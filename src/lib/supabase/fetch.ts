export const SUPABASE_FETCH_TIMEOUT_MS = Number(
  process.env.SUPABASE_FETCH_TIMEOUT_MS ?? 8000
)

export function fetchWithTimeout(
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1]
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), SUPABASE_FETCH_TIMEOUT_MS)

  const originalSignal = init?.signal
  if (originalSignal) {
    if (originalSignal.aborted) {
      controller.abort()
    } else {
      originalSignal.addEventListener('abort', () => controller.abort(), {
        once: true,
      })
    }
  }

  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timeoutId)
  )
}
