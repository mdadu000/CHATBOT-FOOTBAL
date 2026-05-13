/**
 * POST /api/chat with SSE stream (fetch + ReadableStream).
 * @param {{ message: string, chatId?: string|null, language: string, token: string, signal?: AbortSignal }} params
 * @param {{ onMeta?: (d: object) => void, onToken?: (t: string) => void, onDone?: (d: object) => void }} handlers
 */
export async function streamChat({ message, chatId, language, token, signal }, handlers) {
  const base = import.meta.env.VITE_API_URL || '';
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, chatId: chatId || undefined, language, stream: true }),
    signal,
  });

  if (!res.ok) {
    let errText = `Chat failed (${res.status})`;
    try {
      const j = await res.json();
      if (j.error) errText = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(errText);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('Streaming not supported in this browser');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() || '';
    for (const block of parts) {
      const line = block.trim();
      if (!line.startsWith('data:')) continue;
      const json = line.replace(/^data:\s*/, '');
      let data;
      try {
        data = JSON.parse(json);
      } catch {
        continue;
      }
      if (data.type === 'meta' && handlers.onMeta) handlers.onMeta(data);
      if (data.type === 'token' && data.text && handlers.onToken) handlers.onToken(data.text);
      if (data.type === 'done' && handlers.onDone) handlers.onDone(data);
    }
  }

  const tail = buffer.trim();
  if (tail.startsWith('data:')) {
    try {
      const data = JSON.parse(tail.replace(/^data:\s*/, ''));
      if (data.type === 'done' && handlers.onDone) handlers.onDone(data);
    } catch {
      /* ignore trailing partial */
    }
  }
}
