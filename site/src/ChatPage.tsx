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
  code?: string
  retryable?: boolean
  retryAfterSeconds?: number | null
}

type ChatErrorState = {
  message: string
  question: string
  retryable: boolean
  retryAfterSeconds?: number | null
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
  const [chatError, setChatError] = useState<ChatErrorState | null>(null)

  const configured = Boolean(apiUrl)

  async function sendQuestion(
    question: string,
    options: { appendUser?: boolean } = {},
  ) {
    const trimmed = question.trim()
    const appendUser = options.appendUser !== false
    if (!trimmed || isSending || !configured) return

    const historySource = appendUser ? messages : messages.slice(0, -1)
    const history = historySource
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(-8)
      .map(({ role, content }) => ({ role, content }))

    if (appendUser) {
      const userMessage: ChatMessage = {
        id: messageId(),
        role: 'user',
        content: trimmed,
      }
      setMessages((current) => [...current, userMessage])
    }

    setDraft('')
    setChatError(null)
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
        setChatError({
          message:
            data.error ||
            'No pudimos obtener una respuesta en este momento. Tu pregunta quedó guardada.',
          question: trimmed,
          retryable: data.retryable ?? true,
          retryAfterSeconds: data.retryAfterSeconds,
        })
        return
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
    } catch {
      setChatError({
        message:
          'No pudimos conectar con el asistente ahora mismo. Tu pregunta quedó guardada y puedes volver a intentarlo.',
        question: trimmed,
        retryable: true,
      })
    } finally {
      setIsSending(false)
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendQuestion(draft)
  }

  const userMessageCount = messages.filter((message) => message.role === 'user').length

  return (
    <div className="chat-page chat-page--workspace">
      <section className="chat-intro" aria-labelledby="chat-title">
        <div className="chat-intro-copy">
          <div className="chat-status-row">
            <span className="chat-status-dot" aria-hidden="true" />
            <span>Asistente del proyecto</span>
            <span className="chat-status-separator" aria-hidden="true">·</span>
            <span>Gemini File Search</span>
          </div>
          <h1 id="chat-title">Pregúntale al proyecto</h1>
          <p>
            Consulta resultados, métodos, genes, módulos y trazabilidad usando
            las fuentes canónicas del repositorio.
          </p>
        </div>

        <div className="chat-trust-note">
          <strong>Responde desde las fuentes</strong>
          <span>
            Si la evidencia indexada no alcanza, el asistente lo dirá en vez de
            completar la respuesta con supuestos.
          </span>
        </div>
      </section>

      {!configured ? (
        <section className="chat-config-warning" role="status">
          <strong>El asistente todavía no está conectado.</strong>
          <p>
            La interfaz está lista, pero falta conectar el endpoint seguro del
            backend antes de poder hacer consultas.
          </p>
        </section>
      ) : null}

      <section className="chat-workspace" aria-label="Asistente del proyecto">
        <div className="chat-panel">
          <header className="chat-panel-header">
            <div>
              <strong>Conversación</strong>
              <span>
                {userMessageCount === 0
                  ? 'Haz una pregunta o usa una sugerencia.'
                  : userMessageCount + ' ' + (userMessageCount === 1 ? 'pregunta' : 'preguntas') + ' en esta sesión'}
              </span>
            </div>
            <span className="chat-source-badge">Fuentes canónicas</span>
          </header>

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
                  {message.role === 'user' ? 'Tú' : 'Asistente'}
                </div>
                <div className="chat-message-body">{message.content}</div>

                {message.citations && message.citations.length > 0 ? (
                  <div className="chat-citations" aria-label="Fuentes recuperadas">
                    <span>Fuentes utilizadas</span>
                    <div>
                      {message.citations.map((citation) => (
                        <code
                          key={citation.fileName + '-' + (citation.source ?? '')}
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
                <span className="chat-thinking-dot" aria-hidden="true" />
                Buscando en las fuentes del proyecto…
              </div>
            ) : null}
          </div>

          {chatError ? (
            <div className="chat-error chat-error--friendly" role="status">
              <div>
                <strong>El asistente necesita un momento</strong>
                <p>{chatError.message}</p>
                {chatError.retryAfterSeconds !== null &&
                chatError.retryAfterSeconds !== undefined &&
                chatError.retryAfterSeconds > 0 ? (
                  <small>
                    Puedes probar de nuevo en aproximadamente{' '}
                    {chatError.retryAfterSeconds} s.
                  </small>
                ) : null}
              </div>
              {chatError.retryable ? (
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() =>
                    void sendQuestion(chatError.question, { appendUser: false })
                  }
                  disabled={isSending}
                >
                  Reintentar
                </button>
              ) : null}
            </div>
          ) : null}

          <form className="chat-composer" onSubmit={submit}>
            <label htmlFor="project-question">Tu pregunta</label>
            <textarea
              id="project-question"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ej.: ¿Qué evidencia respalda M5 en Harvest?"
              rows={3}
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
          <section className="chat-sidebar-card">
            <p className="chat-sidebar-kicker">Empieza por aquí</p>
            <div className="chat-suggestions">
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => void sendQuestion(suggestion)}
                  disabled={!configured || isSending}
                >
                  <span>{suggestion}</span>
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </section>

          <section className="chat-sidebar-card chat-sidebar-card--quiet">
            <p className="chat-sidebar-kicker">Cómo responde</p>
            <ul className="chat-rules">
              <li>Prioriza documentos y tablas canónicas.</li>
              <li>Separa resultados de interpretación.</li>
              <li>Expone límites cuando la evidencia no alcanza.</li>
            </ul>
          </section>

          <section className="chat-sidebar-card chat-sidebar-card--limit">
            <p className="chat-sidebar-kicker">Límite científico</p>
            <p>
              Coexpresión y centralidad no prueban causalidad. La validación en
              piel se mantiene separada del baseline y T-008 no se presenta como
              terminado mientras siga incompleto.
            </p>
          </section>
        </aside>
      </section>
    </div>
  )
}
