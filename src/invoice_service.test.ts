import test from "node:test";
import assert from "node:assert/strict";
import { invoiceRequest, invoiceHtml } from "./invoice_service.ts";

test("invoice boundary keeps marketplace identity and money precise", () => {
  const input = invoiceRequest.parse({ orderId: "o-1", sellerName: "Seller", buyerName: "Buyer", buyerEmail: "buyer@example.com", item: "Book", amount: 12.5, currency: "USD" });
  assert.match(invoiceHtml(input), /o-1/);
  assert.match(invoiceHtml(input), /12\.50 USD/);
  assert.throws(() => invoiceRequest.parse({ ...input, buyerEmail: "not-an-email" }));
});
