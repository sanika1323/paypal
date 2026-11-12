import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

/**
 * Principals:
 *  - coordinator: a human, Bearer RELIEFOS_COORDINATOR_TOKEN. Required for consequential actions
 *    (approve/reject, PayPal checkout/capture, delivery receipt, real supplier-failure reports).
 *  - agent:       the Python agent service, X-Service-Token RELIEFOS_AGENT_TOKEN. May read, create
 *    drafts/proposals/validation reports/workflow records and report SIMULATED failures. Never accepted
 *    where a coordinator is required.
 *
 * When a token is not configured, that principal check is disabled for local development and
 * GET /api/auth/status reports it, so the UI can show it.
 */
export type Principal = { role: "coordinator" | "agent" | "anonymous"; devMode: boolean };

const coordinatorToken = () => process.env.RELIEFOS_COORDINATOR_TOKEN?.trim() || null;
const agentToken = () => process.env.RELIEFOS_AGENT_TOKEN?.trim() || null;

export const coordinatorAuthRequired = () => coordinatorToken() !== null;
export const agentAuthRequired = () => agentToken() !== null;

const safeEqual = (candidate: string | undefined, expected: string): boolean => {
  if (!candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

export const isValidCoordinatorToken = (candidate: string | undefined): boolean => {
  const expected = coordinatorToken();
  return expected === null ? true : safeEqual(candidate, expected);
};

const bearer = (req: Request) => {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7).trim() : undefined;
};

export const getPrincipal = (req: Request): Principal => {
  const serviceToken = typeof req.headers["x-service-token"] === "string" ? req.headers["x-service-token"] : undefined;
  const coord = coordinatorToken();
  const agent = agentToken();

  if (serviceToken !== undefined) {
    if (agent === null) return { role: "agent", devMode: true };
    return safeEqual(serviceToken, agent) ? { role: "agent", devMode: false } : { role: "anonymous", devMode: false };
  }
  const token = bearer(req);
  if (coord === null) return { role: "coordinator", devMode: true };
  return safeEqual(token, coord) ? { role: "coordinator", devMode: false } : { role: "anonymous", devMode: false };
};

const deny = (res: Response, message: string, code: string) =>
  res.status(code === "FORBIDDEN_FOR_AGENTS" ? 403 : 401).json({ success: false, message, code });

/** Human-only. The agent service token is never accepted here. */
export const requireCoordinator = (req: Request, res: Response, next: NextFunction) => {
  const principal = getPrincipal(req);
  if (principal.role === "agent") {
    return deny(res, "Agents cannot perform this action; a human coordinator must.", "FORBIDDEN_FOR_AGENTS");
  }
  if (principal.role !== "coordinator") {
    return deny(res, "Coordinator sign-in required for this action", "COORDINATOR_AUTH_REQUIRED");
  }
  res.locals.principal = principal;
  return next();
};

/** Agent-service or coordinator writes (drafts, proposals, validation reports, workflow records). */
export const requireAgentOrCoordinator = (req: Request, res: Response, next: NextFunction) => {
  const principal = getPrincipal(req);
  if (principal.role === "anonymous") {
    return deny(res, "Agent service token or coordinator sign-in required", "AUTH_REQUIRED");
  }
  res.locals.principal = principal;
  return next();
};

export const principalOf = (res: Response): Principal =>
  (res.locals.principal as Principal | undefined) ?? { role: "anonymous", devMode: false };

/** Applies a guard to every non-GET request of a router (reads stay open). */
export const guardWrites =
  (guard: (req: Request, res: Response, next: NextFunction) => unknown) => (req: Request, res: Response, next: NextFunction) =>
    req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS" ? next() : guard(req, res, next);
