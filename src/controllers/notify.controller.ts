import type { Request, Response, NextFunction } from "express";
import { directDebitNotifySchema } from "../schemas/notify.schema";
import type { DirectDebitNotifyResponse, NotifyScenario } from "../types/notify";

const EXPECTED_CHANNEL_ID = "00656";
const DEFAULT_DELAY_MS = Number(process.env.DEFAULT_DELAY_MS ?? 5000);
const MAX_DELAY_MS = Number(process.env.MAX_DELAY_MS ?? 30000);
const STRICT_VALIDATION = process.env.STRICT_VALIDATION === "true";

const SUCCESS_RESPONSE: DirectDebitNotifyResponse = {
  responseCode: "2005600",
  responseMessage: "Request has been processed successfully",
};

const INVALID_RESPONSE: DirectDebitNotifyResponse = {
  responseCode: "5005600",
  responseMessage: "Simulated merchant failure",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateHeaders(req: Request): string[] {
  const errors: string[] = [];

  if (!req.header("Authorization")) errors.push("Missing Authorization");
  if (!req.header("X-TIMESTAMP")) errors.push("Missing X-TIMESTAMP");
  if (!req.header("X-SIGNATURE")) errors.push("Missing X-SIGNATURE");
  if (!req.header("X-PARTNER-ID")) errors.push("Missing X-PARTNER-ID");
  if (!req.header("X-EXTERNAL-ID")) errors.push("Missing X-EXTERNAL-ID");

  const channelId = req.header("CHANNEL-ID");
  if (!channelId) {
    errors.push("Missing CHANNEL-ID");
  } else if (channelId !== EXPECTED_CHANNEL_ID) {
    errors.push(`Invalid CHANNEL-ID: expected ${EXPECTED_CHANNEL_ID}`);
  }

  return errors;
}

export async function handleDirectDebitNotify(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const headerErrors = validateHeaders(req);

    if (headerErrors.length > 0) {
      if (STRICT_VALIDATION) {
        res.status(400).json({
          message: "Invalid request",
          errors: headerErrors,
        });
        return;
      }

      console.warn({
        event: "DIRECT_DEBIT_NOTIFY_HEADER_WARNING",
        timestamp: new Date().toISOString(),
        warnings: headerErrors,
      });
    }

    const parseResult = directDebitNotifySchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        message: "Invalid request",
        errors: parseResult.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`
        ),
      });
      return;
    }

    console.log({
      event: "DIRECT_DEBIT_NOTIFY_RECEIVED",
      timestamp: new Date().toISOString(),
      headers: {
        authorizationPresent: Boolean(req.header("Authorization")),
        signaturePresent: Boolean(req.header("X-SIGNATURE")),
        timestamp: req.header("X-TIMESTAMP"),
        partnerId: req.header("X-PARTNER-ID"),
        externalId: req.header("X-EXTERNAL-ID"),
        channelId: req.header("CHANNEL-ID"),
      },
      body: parseResult.data,
    });

    const scenario = (req.query.scenario as NotifyScenario | undefined) ?? "success";

    switch (scenario) {
      case "error": {
        res.status(500).json({ message: "Simulated merchant internal server error" });
        return;
      }

      case "invalid-response": {
        res.status(200).json(INVALID_RESPONSE);
        return;
      }

      case "delay": {
        const requestedDelay = Number(req.query.delayMs ?? DEFAULT_DELAY_MS);
        const delayMs = Number.isFinite(requestedDelay)
          ? Math.min(Math.max(requestedDelay, 0), MAX_DELAY_MS)
          : DEFAULT_DELAY_MS;

        await sleep(delayMs);
        res.status(200).json(SUCCESS_RESPONSE);
        return;
      }

      case "success":
      default: {
        res.status(200).json(SUCCESS_RESPONSE);
        return;
      }
    }
  } catch (error) {
    next(error);
  }
}
