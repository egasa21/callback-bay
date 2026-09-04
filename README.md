# AstraPay Merchant Notify Mock

A lightweight mock merchant API used for testing AstraPay Direct Debit Payment
Notify callbacks. This service simulates a merchant endpoint that receives
payment notifications from the AstraPay payment-channel service.

> ⚠️ For development/UAT testing only. No database, no authentication, no
> production use.

## Tech Stack

- Node.js + TypeScript
- Express.js
- Deployable to Vercel (serverless function)

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

The service runs at `http://localhost:3000`.

## Endpoints

### `GET /health`

Health check, returns `{ "status": "UP", "service": "astrapay-merchant-notify-mock" }`.

### `GET /`

Root endpoint listing available endpoints.

### `POST /api/snap/v1.0/debit/notify`

Simulates the merchant callback endpoint for AstraPay Direct Debit Payment
Notify.

Required headers: `Authorization`, `Content-Type: application/json`,
`X-TIMESTAMP`, `X-SIGNATURE`, `X-PARTNER-ID`, `X-EXTERNAL-ID`, `CHANNEL-ID`
(expected value `00656`).

Header presence is only enforced (HTTP 400) when `STRICT_VALIDATION=true`.
Otherwise missing headers are logged as warnings.

#### Test scenarios

Use the `scenario` query parameter (defaults to `success`):

| Scenario            | Behavior                                              |
| ------------------- | ------------------------------------------------------ |
| `success`           | HTTP 200 with a successful SNAP response               |
| `error`             | HTTP 500 simulated internal server error                |
| `invalid-response`  | HTTP 200 with an unsuccessful SNAP response              |
| `delay`             | Delays response (`delayMs` query param, capped by `MAX_DELAY_MS`) |

Example:

```bash
curl --location \
  --request POST \
  'http://localhost:3000/api/snap/v1.0/debit/notify' \
  --header 'Authorization: Bearer dummy-token' \
  --header 'Content-Type: application/json' \
  --header 'X-TIMESTAMP: 2026-09-04T09:30:00+07:00' \
  --header 'X-SIGNATURE: dummy-signature' \
  --header 'X-PARTNER-ID: test-merchant' \
  --header 'X-EXTERNAL-ID: 123456789012345678901234567890123456' \
  --header 'CHANNEL-ID: 00656' \
  --data '{
    "originalPartnerReferenceNo": "TEST-TRX-001",
    "originalReferenceNo": "INV/PAY/TEST/001",
    "merchantId": "merchant-test",
    "amount": { "value": "10000.00", "currency": "IDR" },
    "latestTransactionStatus": "00",
    "finishedTime": "2026-09-04T09:30:00+07:00",
    "additionalInfo": {
      "transAmount": { "value": "10000.00", "currency": "IDR" },
      "feeAmount": { "value": "2000.00", "currency": "IDR" },
      "payMethod": "Balance",
      "payOption": "AstraPay"
    }
  }'
```

## Environment Variables

See `.env.example`:

- `PORT` — local server port (default `3000`)
- `STRICT_VALIDATION` — `true`/`false`, enforce header validation
- `DEFAULT_DELAY_MS` — default delay for `scenario=delay`
- `MAX_DELAY_MS` — maximum allowed delay

## Deployment (Vercel)

Vercel's zero-config Express detection picks up `src/app.ts` directly (it
matches one of Vercel's recognized entry filenames) and uses its
`export default app` as the serverless function — no `api/` folder or
`vercel.json` is needed. The whole app is deployed as a single Vercel
Function, so the public callback URL is simply:

```
https://<deployment>.vercel.app/api/snap/v1.0/debit/notify
```

## Scripts

- `npm run dev` — start with hot reload (tsx watch)
- `npm run start` — start without watch
- `npm run build` / `npm run typecheck` — type-check the project
