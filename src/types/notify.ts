export interface Money {
  value: string;
  currency: string;
}

export type TransactionStatus =
  | "00"
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07";

export interface NotifyAdditionalInfo {
  transAmount?: Money;
  feeAmount?: Money;
  payMethod?: string;
  payOption?: string;
}

export interface DirectDebitNotifyRequest {
  originalPartnerReferenceNo: string;
  originalReferenceNo: string;
  merchantId: string;
  amount: Money;
  latestTransactionStatus: TransactionStatus;
  finishedTime: string;
  additionalInfo?: NotifyAdditionalInfo;
}

export interface DirectDebitNotifyResponse {
  responseCode: string;
  responseMessage: string;
}

export type NotifyScenario = "success" | "error" | "invalid-response" | "delay";
