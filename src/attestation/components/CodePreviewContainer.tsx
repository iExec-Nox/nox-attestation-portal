import { useState } from 'react'
import { MatIcon, Verdict } from '../../shared/ui/index.tsx'

interface CodePreviewContainerProps {
  title: string
  content: string
  filename?: string
  hash?: string
  verdictOk?: boolean
  defaultCollapsed?: boolean
}

/* ── YAML tokenizer ── */
type Span = { text: string; color?: string }

interface RenderedLine {
  id: string
  lineNumber: number
  tokens: Array<Span & { id: string }>
}

function parseYamlLine(line: string): Span[] {
  if (!line.trim()) return [{ text: line }]
  if (line.trim().startsWith('#')) return [{ text: line, color: 'var(--ct-fg-5)' }]

  const keyMatch = /^(\s*)((?:- )?)([\w.-]+)(\s*:\s*)(.*)$/.exec(line)
  if (keyMatch) {
    const [, indent, listMarker, key, colon, rest] = keyMatch
    return [
      ...(indent ? [{ text: indent }] : []),
      ...(listMarker ? [{ text: listMarker, color: 'var(--ct-fg-5)' }] : []),
      { text: key, color: 'var(--ct-fg-2)' },
      { text: colon, color: 'var(--ct-fg-5)' },
      ...(rest ? parseValue(rest) : []),
    ]
  }

  const listMatch = /^(\s*)(- )(.*)$/.exec(line)
  if (listMatch) {
    const [, indent, marker, rest] = listMatch
    return [
      ...(indent ? [{ text: indent }] : []),
      { text: marker, color: 'var(--ct-fg-5)' },
      ...(rest ? parseValue(rest) : []),
    ]
  }

  return parseValue(line)
}

function parseValue(text: string): Span[] {
  if (!text) return []

  const anchorMatch = /^([&*]\S+)(\s*.*)$/.exec(text)
  if (anchorMatch) {
    const rest = anchorMatch[2]
    return [{ text: anchorMatch[1], color: '#C4B5FD' }, ...(rest ? parseValue(rest) : [])]
  }

  const spans: Span[] = []
  let remaining = text

  while (remaining.length > 0) {
    const tmplIdx = remaining.indexOf('${')
    if (tmplIdx !== -1) {
      const closeIdx = remaining.indexOf('}', tmplIdx)
      if (closeIdx !== -1) {
        if (tmplIdx > 0) spans.push(...parseSegment(remaining.slice(0, tmplIdx)))
        spans.push({ text: remaining.slice(tmplIdx, closeIdx + 1), color: '#FCD34D' })
        remaining = remaining.slice(closeIdx + 1)
        continue
      }
    }
    spans.push(...parseSegment(remaining))
    break
  }

  return spans
}

function parseSegment(text: string): Span[] {
  if (!text) return []

  if (text.startsWith('"') || text.startsWith("'")) {
    const q = text[0]
    const closeIdx = text.indexOf(q, 1)
    if (closeIdx !== -1) {
      const after = text.slice(closeIdx + 1)
      return [
        { text: text.slice(0, closeIdx + 1), color: '#86EFAC' },
        ...(after ? parseSegment(after) : []),
      ]
    }
    return [{ text, color: '#86EFAC' }]
  }

  const boolMatch = /^(true|false|null)(.*)$/.exec(text)
  if (boolMatch) {
    return [
      { text: boolMatch[1], color: '#C4B5FD' },
      ...(boolMatch[2] ? [{ text: boolMatch[2], color: 'var(--ct-fg-3)' }] : []),
    ]
  }

  if (/^-?\d/.exec(text.trim())) return [{ text, color: '#67E8F9' }]

  return [{ text, color: 'var(--ct-fg-3)' }]
}

function buildLines(content: string): RenderedLine[] {
  return content.split('\n').map((line, idx) => ({
    id: `L${idx + 1}`,
    lineNumber: idx + 1,
    tokens: parseYamlLine(line).map((span, si) => ({ ...span, id: `${idx}-s${si}` })),
  }))
}

export function CodePreviewContainer({
  title,
  content,
  filename = 'docker-compose.yaml',
  hash,
  verdictOk,
  defaultCollapsed = false,
}: Readonly<CodePreviewContainerProps>) {
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const shortHash = hash ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : undefined
  const renderedLines = buildLines(content)

  return (
    <div
      style={{
        overflow: 'hidden',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.32)',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <MatIcon name="terminal" size={15} color="var(--ct-fg-5)" />
        <span
          style={{
            font: '700 11px/1 var(--ct-font-ui)',
            letterSpacing: '1.2px',
            textTransform: 'uppercase' as const,
            color: 'var(--ct-fg-4)',
          }}
        >
          {title}
        </span>
        {verdictOk !== undefined && <Verdict ok={verdictOk} />}
        {shortHash && (
          <span
            style={{
              font: '500 11px/1 var(--ct-font-mono)',
              color: 'var(--ct-fg-5)',
            }}
          >
            {shortHash}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--ct-fg-4)',
            font: '600 12px/1 var(--ct-font-ui)',
            padding: '2px 0',
          }}
        >
          {collapsed ? 'Expand' : 'Collapse'}
          <MatIcon name={collapsed ? 'expand_more' : 'expand_less'} size={16} />
        </button>
      </div>

      {/* Sub-header + content */}
      {!collapsed && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.01)',
            }}
          >
            <MatIcon name="description" size={14} color="var(--ct-fg-5)" />
            <span
              style={{ font: '500 12px/1 var(--ct-font-mono)', color: 'var(--ct-fg-4)', flex: 1 }}
            >
              {filename}
              <span style={{ color: 'var(--ct-fg-6)', marginLeft: 6 }}>· read-only</span>
            </span>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                height: 28,
                padding: '0 10px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.10)',
                cursor: 'pointer',
                color: copied ? 'var(--ct-brand)' : 'var(--ct-fg-3)',
                font: '600 11px/1 var(--ct-font-ui)',
              }}
            >
              <MatIcon name={copied ? 'check' : 'content_copy'} size={12} />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <pre style={{ overflow: 'auto', margin: 0, maxHeight: 460, padding: '14px 0' }}>
            {renderedLines.map((ln) => (
              <div key={ln.id} style={{ display: 'flex', minHeight: '1.65em' }}>
                <span
                  style={{
                    width: 42,
                    textAlign: 'right',
                    paddingRight: 16,
                    color: 'rgba(255,255,255,0.20)',
                    font: '500 12px/1.65 var(--ct-font-mono)',
                    flexShrink: 0,
                    userSelect: 'none' as const,
                  }}
                >
                  {ln.lineNumber}
                </span>
                <span style={{ font: '500 12px/1.65 var(--ct-font-mono)', flex: 1 }}>
                  {ln.tokens.map((token) => (
                    <span key={token.id} style={{ color: token.color }}>
                      {token.text}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </pre>
        </>
      )}
    </div>
  )
}
