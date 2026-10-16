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

/** Azure neural text-to-speech: SSML in, MP3 bytes out (same Speech resource and key as the token). */
export async function synthesizeSsml(ssml: string): Promise<Buffer> {
  const key = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION
  if (!key || !region) throw new Error('Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION environment variable.')

  const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'avalon',
    },
    body: ssml,
  })
  if (!response.ok) throw new Error(`Azure TTS failed ${response.status}: ${await response.text()}`)
  return Buffer.from(await response.arrayBuffer())
}
