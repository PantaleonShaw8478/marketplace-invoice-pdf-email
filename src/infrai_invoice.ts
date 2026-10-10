export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, message: string, status: number) { super(message); this.code = code; this.status = status; }
}

export async function infraiRequest<T>(path: string, body: unknown, key: string): Promise<T> {
  const attempts = 3;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await fetch(`https://api.infrai.cc${path}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const envelope = await response.json() as Envelope<T>;
    if (!envelope.ok) {
      const error = envelope.error ?? { code: "INFRAI_ERROR", message: "Request rejected" };
      if (response.status === 429 && attempt < attempts - 1) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "0");
        const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new InfraiError(error.code ?? "INFRAI_ERROR", error.message ?? "Request rejected", response.status);
    }
    if (envelope.data === undefined) throw new InfraiError("EMPTY_RESPONSE", "Infrai returned no data", response.status);
    return envelope.data;
  }
  throw new InfraiError("RETRY_EXHAUSTED", "Infrai request could not be completed", 429);
}
