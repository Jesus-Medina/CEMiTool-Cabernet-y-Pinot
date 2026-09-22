import { useMemo, useState } from 'react'

type Citation = {
  fileName: string
  source?: string
}

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}

type ApiResponse = {
  answer?: string
  citations?: Citation[]
  error?: string
}

const suggestions = [
  '¿Qué es M5 y por qué es importante?',
  '¿Por qué se eligió beta=10?',
  '¿Qué mostró la validación externa en piel?',
  '¿Qué está terminado y qué falta en T-008?',
]

function messageId() {
  return crypto.randomUUID()
}

export default function ChatPage() {
  const apiUrl = useMemo(
    () => (import.meta.env.VITE_CHAT_API_URL ?? '').replace(/\/$/, ''),
    [],
  )
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: messageId(),
      role: 'assistant',
      content:
        'Hola. Puedo ayudarte a navegar el proyecto CEMiTool Cabernet–Pinot usando sus documentos, tablas y scripts indexados. Pregúntame por M5, beta, hubs, validación, T-008 o dónde está cada evidencia.',
    },
  ])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  const configured = Boolean(apiUrl)

  async function sendQuestion(question: string) {
    const trimmed = question.trim()
    if (!trimmed || isSending || !configured) return

    const history = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(-8)
      .map(({ role, content }) => ({ role, content }))

    const userMessage: ChatMessage = {
      id: messageId(),
      role: 'user',
      content: trimmed,
    }

    setMessages((current) => [...current, userMessage])
    setDraft('')
    setError('')
    setIsSending(true)

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history,
        }),
      })

      const data = (await response.json()) as ApiResponse

      if (!response.ok || !data.answer) {
        throw new Error(data.error || 'No se recibió una respuesta válida.')
      }

      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: 'assistant',
          content: data.answer ?? '',
          citations: data.citations ?? [],
        },
      ])
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : 'No se pudo consultar el asistente.'
      setError(message)
    } finally {
      setIsSending(false)
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendQuestion(draft)
  }

  return (
    <div className="page-stack chat-page">
      <section className="chat-hero">
        <div>
          <p className="eyebrow">Asistente RAG · Gemini File Search</p>
          <h1>Pregúntale al proyecto</h1>
          <p className="lede">
            El chat consulta una colección curada de documentación, tablas y
            scripts canónicos. Está diseñado para explicar evidencia y
            trazabilidad sin convertir coexpresión en causalidad.
          </p>
        </div>
        <div className="chat-hero-note">
          <strong>Fuente antes que memoria</strong>
          <span>
            Si la evidencia indexada no basta, el asistente debe decirlo en vez
            de completar el hueco.
          </span>
        </div>
      </section>

      {!configured ? (
        <section className="chat-config-warning" role="status">
          <strong>Chat aún no conectado.</strong>
          <p>
            Falta definir <code>VITE_CHAT_API_URL</code> durante el build del
            sitio. El frontend ya está preparado para conectarse al worker
            seguro.
          </p>
          <a
            className="inline-link"
            href="https://github.com/Jesus-Medina/CEMiTool-Cabernet-y-Pinot/tree/main/chatbot"
          >
            Ver guía de configuración →
          </a>
        </section>
      ) : null}

      <section className="chat-layout" aria-label="Asistente del proyecto">
        <div className="chat-panel">
          <div className="chat-thread" aria-live="polite">
            {messages.map((message) => (
              <article
                className={
                  message.role === 'user'
                    ? 'chat-message chat-message--user'
                    : 'chat-message chat-message--assistant'
                }
                key={message.id}
              >
                <div className="chat-message-meta">
                  {message.role === 'user' ? 'Tú' : 'Asistente del proyecto'}
                </div>
                <div className="chat-message-body">{message.content}</div>

                {message.citations && message.citations.length > 0 ? (
                  <div className="chat-citations" aria-label="Fuentes recuperadas">
                    <span>Fuentes recuperadas</span>
                    <div>
                      {message.citations.map((citation) => (
                        <code
                          key={`${citation.fileName}-${citation.source ?? ''}`}
                        >
                          {citation.fileName}
                        </code>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            ))}

            {isSending ? (
              <div className="chat-thinking" role="status">
                Buscando en las fuentes del proyecto…
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="chat-error" role="alert">
              {error}
            </div>
          ) : null}

          <form className="chat-composer" onSubmit={submit}>
            <label htmlFor="project-question">Pregunta</label>
            <textarea
              id="project-question"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ej.: ¿Qué evidencia respalda M5 en Harvest?"
              rows={4}
              maxLength={5000}
              disabled={!configured || isSending}
            />
            <div className="chat-composer-footer">
              <span>{draft.length}/5000</span>
              <button
                className="button button--primary"
                type="submit"
                disabled={!configured || isSending || !draft.trim()}
              >
                {isSending ? 'Consultando…' : 'Preguntar'}
              </button>
            </div>
          </form>
        </div>

        <aside className="chat-sidebar">
          <div className="chat-sidebar-card">
            <p className="eyebrow">Prueba una pregunta</p>
            <div className="chat-suggestions">
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => void sendQuestion(suggestion)}
                  disabled={!configured || isSending}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="chat-sidebar-card chat-sidebar-card--limit">
            <p className="eyebrow">Límite científico</p>
            <p>
              Este asistente explica resultados del proyecto. No convierte hubs
              en reguladores causales, no atribuye grosor de piel a M5 y no
              presenta T-008 como terminado mientras las fuentes indiquen lo
              contrario.
            </p>
          </div>
        </aside>
      </section>
    </div>
  )
}
