// src/lib/dbRetry.ts

/**
 * Wraps a Prisma query with automatic retry on connection errors.
 * Neon DB closes idle connections — this handles that gracefully.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 100
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isConnectionError =
        err instanceof Error &&
        (err.message.includes("Connection closed") ||
          err.message.includes("connection") ||
          err.message.includes("ECONNRESET") ||
          err.message.includes("Closed") ||
          (err as { code?: string }).code === "P1017" ||
          (err as { code?: string }).code === "P1001");

      if (isConnectionError && attempt < retries) {
        console.warn(`DB connection error — retrying (${attempt}/${retries})...`);
        await new Promise((r) => setTimeout(r, delayMs * attempt));
        continue;
      }

      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}