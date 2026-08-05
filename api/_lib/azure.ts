const RETRY_DELAYS_MS = [1000, 2000, 4000]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function issueAzureToken(): Promise<{ token: string; region: string }> {
  const key = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION
  if (!key || !region) throw new Error('Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION environment variable.')

  const url = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`
  let lastError: unknown = null

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Length': '0' },
    })

    if ((response.status === 429 || response.status >= 500) && attempt < RETRY_DELAYS_MS.length) {
      await sleep(RETRY_DELAYS_MS[attempt])
      continue
    }

    if (!response.ok) {
      const text = await response.text()
      lastError = new Error(`Azure token request failed ${response.status}: ${text}`)
      break
    }

    const token = await response.text()
    return { token, region }
  }

  throw lastError ?? new Error('Azure token request failed after retries.')
}
