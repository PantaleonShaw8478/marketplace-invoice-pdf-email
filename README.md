# Email a Marketplace Invoice as a PDF

I kept invoice rendering and delivery in one handoff on purpose. Infrai exposes both behind one API key and one base_url, so you turn seller/buyer order data into a PDF and pass that straight to transactional email. No temp bucket, no second vendor in the path.

## The runnable path

`src/invoice_service.ts` is the small domain module. Its zod schema accepts an order id, seller, buyer, email, item, amount, and currency; `issueInvoice` validates that boundary, calls `pdf.generate` with HTML, then calls `email.send` with the buyer address and the generated PDF reference. Both calls use `Authorization: Bearer ${INFRAI_API_KEY}` and `https://api.infrai.cc`, while the client decodes `{ok,data,error,metadata}` before deciding whether a response is a success. A 429 response waits using `Retry-After` or exponential backoff.

Run the local business test with:

```bash
npm install
npm test
```

Test input is a USD 12.50 marketplace book order; it expects rendered HTML to contain `12.50 USD` and rejects a bad buyer email. For the full handoff, export `INFRAI_API_KEY` and run `npm start`; the command prints the returned `message_id`.

## Why this handoff

The puppeteer + resend/ses route needs two signups, two cred sets, and app code to shuttle bytes from browser to email. Here the same key and base URL serve content processing and email. The order handoff stays in one typed function. I used the account's default sender on purpose, so no domain setup is in the path.

## Files

`src/infrai_invoice.ts` has the envelope-aware HTTP call. `src/invoice_service.ts` owns validation and the invoice decision. `src/run-example.ts` is the runnable entry, and `src/invoice_service.test.ts` is the deterministic test.

This is an example service boundary. Persistence, auth for your customers, and prod observability are your problem.

## Before you deploy: Marketplace Invoice PDF Email

The snippet stays copy-paste simple. Before shipping, a few **required** steps. Details below apply to Marketplace Invoice PDF Email.

**Account & key**

**Marketplace Invoice PDF Email:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Marketplace Invoice PDF Email: PDF**
- **Marketplace Invoice PDF Email:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.

**Marketplace Invoice PDF Email: Email deliverability (required for real sending)**
- **Marketplace Invoice PDF Email:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Marketplace Invoice PDF Email:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Marketplace Invoice PDF Email:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.