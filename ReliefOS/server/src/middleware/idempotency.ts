import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

import { prisma } from "../config/database.js";
import { Prisma } from "../generated/prisma/client.js";

/**
 * Idempotent writes. A client that sends `Idempotency-Key` gets exactly one execution:
 * a retry with the same key and body replays the stored response; the same key with a
 * different body is refused (409). Requests without the header behave as before.
 */
export const idempotent =
  (scope: string) => async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["idempotency-key"];
    const key = typeof header === "string" ? header.trim() : "";
    if (!key) return next();
    if (key.length > 200) {
      return res.status(400).json({ success: false, message: "Idempotency-Key too long", code: "INVALID_IDEMPOTENCY_KEY" });
    }

    const storageKey = `${scope}:${key}`;
    const requestHash = createHash("sha256")
      .update(JSON.stringify({ path: req.originalUrl, body: req.body ?? null }))
      .digest("hex");

    const existing = await prisma.idempotencyKey.findUnique({ where: { key: storageKey } });
    if (existing) {
      if (existing.requestHash !== requestHash) {
        return res.status(409).json({
          success: false,
          message: "This Idempotency-Key was already used with a different request",
          code: "IDEMPOTENCY_KEY_REUSED",
        });
      }
      res.setHeader("Idempotent-Replayed", "true");
      return res.status(existing.statusCode).json(existing.response);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      // Only successful results are remembered (a failed attempt may be retried). The response is
      // stored BEFORE it is sent, so an immediate retry always replays it.
      if (res.statusCode >= 300) return originalJson(body);
      const statusCode = res.statusCode;
      void prisma.idempotencyKey
        .create({
          data: {
            key: storageKey,
            scope,
            requestHash,
            statusCode,
            response: JSON.parse(JSON.stringify(body ?? null)) as Prisma.InputJsonValue,
          },
        })
        .catch(() => undefined) // a concurrent duplicate already stored it
        .finally(() => originalJson(body));
      return res;
    };
    return next();
  };
