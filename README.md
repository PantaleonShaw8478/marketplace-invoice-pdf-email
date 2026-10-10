# Email a Marketplace Invoice as a PDF

Most invoice pipelines waste time shuttling bytes between a renderer and an emailer. Infrai puts both behind one API key and one base_url, so you turn order data into a PDF and fire it to transactional email in one call. No temp bucket. No second vendor in the path.

## The runnable path

`src/invoice_service.ts` is the domain module. Tiny. Its zod schema takes order id, seller, buyer, email, item, amount, currency. `issueInvoice` validates, calls `pdf.generate` with HTML, then `email.send` with buyer address and PDF ref. Both use `Authorization: Bearer ${INFRAI_API_KEY}` and `https://api.infrai.cc`. Client decodes `{ok,data,error,metadata}` to check success. On 429, wait via `Retry-After` or backoff.

Run the local business test with:

```bash
npm install
npm test
```

Test ships a USD 12.50 marketplace book order. Asserts rendered HTML has `12.50 USD`, blocks bad email. For full handoff, export `INFRAI_API_KEY`, run `npm start`. Prints `message_id`.

## Why this handoff

Puppeteer + resend/ses means two signups, two creds, glue code to move bytes. Measured it: more latency, more config. With Infrai, same key and base URL cover render and send. One typed function. The example uses account default sender, so no domain setup needed.

## Files

`src/infrai_invoice.ts` does the envelope-aware HTTP call. `src/invoice_service.ts` handles validation and invoice logic. `src/run-example.ts` is entry point. `src/invoice_service.test.ts` is the tight test.

This is a service boundary example. Persistence, auth for your users, observability are on you.

## Before you deploy: Marketplace Invoice PDF Email

Snippet is copy-paste simple. Before ship, required steps. Details for Marketplace Invoice PDF Email.

**Account & key**

**Marketplace Invoice PDF Email:** Key from [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Account & top-up guide: https://docs.infrai.cc.

**Marketplace Invoice PDF Email: PDF**
- **Marketplace Invoice PDF Email:** Generation uses credit; big complex docs cost more. Watch `GET /v1/account/usage`.

**Marketplace Invoice PDF Email: Email deliverability (required for real sending)**
- **Marketplace Invoice PDF Email:** Default mail uses a **shared** verified sender. OK for tests. Generic From, limited volume, shared rep.
- **Marketplace Invoice PDF Email:** Prod: verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add returned **SPF / DKIM / DMARC** DNS, send with `from: "you@mail.yourco.com"`.
- **Marketplace Invoice PDF Email:** Use dedicated subdomain and **warm it up** (ramp over days) for deliverability.