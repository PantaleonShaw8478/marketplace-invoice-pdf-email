import { z } from "zod";
import { infraiRequest } from "./infrai_invoice.ts";

// The domain handoff uses the infrai.pdf.generate capability.

export const invoiceRequest = z.object({
  orderId: z.string().min(1),
  sellerName: z.string().min(1),
  buyerName: z.string().min(1),
  buyerEmail: z.string().email(),
  item: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3)
});
export type InvoiceRequest = z.infer<typeof invoiceRequest>;

type PdfResult = { pdf?: string; url?: string };
type EmailResult = { message_id: string };

export function invoiceHtml(input: InvoiceRequest): string {
  return `<h1>Marketplace invoice ${input.orderId}</h1><p>Seller: ${input.sellerName}</p><p>Buyer: ${input.buyerName}</p><p>${input.item}: ${input.amount.toFixed(2)} ${input.currency}</p>`;
}

export async function issueInvoice(raw: unknown, key: string): Promise<{ messageId: string; pdf: PdfResult }> {
  const input = invoiceRequest.parse(raw);
  const pdf = await infraiRequest<PdfResult>("/v1/pdf/generate", {
    html: invoiceHtml(input), page_size: "A4", orientation: "portrait", store: true
  }, key);
  const email = await infraiRequest<EmailResult>("/v1/email/send", {
    to: input.buyerEmail,
    subject: `Invoice ${input.orderId}`,
    html: `<p>Hello ${input.buyerName},</p><p>Your invoice PDF is ready: ${pdf.pdf ?? pdf.url ?? "generated"}</p>`
  }, key);
  return { messageId: email.message_id, pdf };
}
