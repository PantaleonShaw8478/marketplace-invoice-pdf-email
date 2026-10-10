import { issueInvoice } from "./invoice_service.ts";

const key = process.env.INFRAI_API_KEY;
if (!key) throw new Error("Set INFRAI_API_KEY before running the example");
const result = await issueInvoice({
  orderId: "order-1042", sellerName: "Northwind Market", buyerName: "Ari Chen",
  buyerEmail: "chenhua@changba.com", item: "Handmade lamp", amount: 89, currency: "USD"
}, key);
console.log(`Invoice emailed with message_id ${result.messageId}`);
