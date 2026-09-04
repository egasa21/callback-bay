import { Router } from "express";
import { handleDirectDebitNotify } from "../controllers/notify.controller";

export const notifyRouter = Router();

notifyRouter.post("/v1.0/debit/notify", handleDirectDebitNotify);
