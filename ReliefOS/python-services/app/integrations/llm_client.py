"""Optional LLM adapter. Used ONLY to write narrative explanations of results the deterministic tools
already produced. It never decides, approves, pays or changes numbers.

Providers (first configured wins):
  * Any OpenAI-compatible API via LLM_PROVIDER + LLM_API_KEY (+ optional LLM_MODEL / LLM_BASE_URL):
      gemini | groq | cerebras | openrouter | openai | custom (needs LLM_BASE_URL)
  * Anthropic via ANTHROPIC_API_KEY.
Without either, every call returns {"available": False} and workflows run unchanged."""
import json
from typing import Any

import httpx

from ..config import get_settings
from ..observability.logging import log

SYSTEM = (
    "You explain ReliefOS emergency-procurement results to a human coordinator. Use ONLY the JSON you are given. "
    "Quote numbers exactly as given; never compute new prices, quantities or totals. Never say a plan is approved, "
    "paid or delivered unless the data says so. Label simulations as simulations. Be concise: at most 6 sentences."
)

# OpenAI-compatible endpoints and a sensible default model for each (override with LLM_MODEL).
PRESETS: dict[str, tuple[str, str]] = {
    "gemini": ("https://generativelanguage.googleapis.com/v1beta/openai", "gemini-2.5-flash"),
    "groq": ("https://api.groq.com/openai/v1", "openai/gpt-oss-120b"),
    "cerebras": ("https://api.cerebras.ai/v1", "llama-3.3-70b"),
    "openrouter": ("https://openrouter.ai/api/v1", "meta-llama/llama-3.3-70b-instruct:free"),
    "openai": ("https://api.openai.com/v1", "gpt-4o-mini"),
}


def _openai_compatible() -> tuple[str, str, str, str] | None:
    s = get_settings()
    if not (s.llm_provider and s.llm_api_key):
        return None
    base, model = PRESETS.get(s.llm_provider, (None, None))
    base = s.llm_base_url or base
    model = s.llm_model or model
    if not base or not model:
        return None
    return s.llm_provider, base.rstrip("/"), model, s.llm_api_key


def llm_status() -> dict[str, Any]:
    s = get_settings()
    oa = _openai_compatible()
    if oa:
        return {"available": True, "provider": oa[0], "model": oa[2]}
    if s.llm_provider and s.llm_api_key:
        return {"available": False, "provider": s.llm_provider, "reason": "Unknown LLM_PROVIDER; set LLM_BASE_URL and LLM_MODEL."}
    if s.anthropic_api_key:
        try:
            import anthropic  # noqa: F401
        except ImportError:
            return {"available": False, "provider": "anthropic", "reason": "The 'anthropic' package is not installed."}
        return {"available": True, "provider": "anthropic", "model": s.claude_model}
    return {"available": False, "provider": None, "reason": "No LLM configured (set LLM_PROVIDER + LLM_API_KEY); explanations are unavailable."}


async def explain(task: str, data: Any) -> dict[str, Any]:
    status = llm_status()
    if not status["available"]:
        return {"available": False, "text": None, "reason": status["reason"]}
    prompt = f"{task}\n\nDATA:\n{json.dumps(data, default=str)[:30000]}"
    try:
        oa = _openai_compatible()
        if oa:
            provider, base, model, key = oa
            body: dict[str, Any] = {"model": model, "temperature": 0.2, "max_tokens": 1500,
                                    "messages": [{"role": "system", "content": SYSTEM}, {"role": "user", "content": prompt}]}
            if "gpt-oss" in model:
                body["reasoning_effort"] = "low"  # keep the token budget for the answer, not hidden reasoning
            async with httpx.AsyncClient(timeout=45) as client:
                r = await client.post(f"{base}/chat/completions", headers={"Authorization": f"Bearer {key}"}, json=body)
                if r.status_code >= 400:
                    log("llm.http_error", provider=provider, status=r.status_code, body=r.text[:300])
                    return {"available": False, "text": None, "reason": f"{provider} returned HTTP {r.status_code}"}
                text = (r.json()["choices"][0]["message"].get("content") or "").strip()
            if not text:
                return {"available": False, "text": None, "reason": f"{provider} returned an empty answer"}
            return {"available": True, "text": text, "model": f"{provider}:{model}"}

        import anthropic

        s = get_settings()
        client = anthropic.AsyncAnthropic(api_key=s.anthropic_api_key, base_url=s.anthropic_base_url) if s.anthropic_base_url \
            else anthropic.AsyncAnthropic(api_key=s.anthropic_api_key)
        msg = await client.messages.create(model=s.claude_model, max_tokens=600, system=SYSTEM, messages=[{"role": "user", "content": prompt}])
        text = "".join(getattr(b, "text", "") for b in msg.content).strip()
        return {"available": True, "text": text, "model": f"anthropic:{s.claude_model}"}
    except Exception as error:  # the explanation is optional; the workflow must not fail on it
        log("llm.error", error=str(error)[:300])
        return {"available": False, "text": None, "reason": f"LLM call failed: {type(error).__name__}"}
