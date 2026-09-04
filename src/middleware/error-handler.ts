import type { Request, Response, NextFunction } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error({
    event: "UNHANDLED_ERROR",
    timestamp: new Date().toISOString(),
    message: err instanceof Error ? err.message : "Unknown error",
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(500).json({
    message: "Internal server error",
  });
}
