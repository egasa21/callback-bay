import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { notifyRouter } from "./routes/notify.route";
import { errorHandler } from "./middleware/error-handler";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "AstraPay Merchant Notify Mock",
    status: "running",
    endpoints: {
      notify: "POST /v1.0/debit/notify",
      health: "GET /health",
    },
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "UP",
    service: "astrapay-merchant-notify-mock",
  });
});

app.use(notifyRouter);

app.use(errorHandler);

export default app;
