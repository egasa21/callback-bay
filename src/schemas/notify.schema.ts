import { z } from "zod";

const moneySchema = z.object({
  value: z.string().min(1, "value is required"),
  currency: z.string().min(1, "currency is required"),
});

const transactionStatusSchema = z.enum([
  "00",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
]);

const additionalInfoSchema = z
  .object({
    transAmount: moneySchema.optional(),
    feeAmount: moneySchema.optional(),
    payMethod: z.string().optional(),
    payOption: z.string().optional(),
  })
  .optional();

export const directDebitNotifySchema = z.object({
  originalPartnerReferenceNo: z.string().min(1, "originalPartnerReferenceNo is required"),
  originalReferenceNo: z.string().min(1, "originalReferenceNo is required"),
  merchantId: z.string().min(1, "merchantId is required"),
  amount: moneySchema,
  latestTransactionStatus: transactionStatusSchema,
  finishedTime: z.string().min(1, "finishedTime is required"),
  additionalInfo: additionalInfoSchema,
});

export type DirectDebitNotifyInput = z.infer<typeof directDebitNotifySchema>;
