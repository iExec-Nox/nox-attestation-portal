import { SummarySection } from './SummarySection.tsx'
import { CodePreviewContainer } from './CodePreviewContainer.tsx'
import type { AttestationResult } from '../types/index.ts'

function ComposeManifest({
  content,
  hash,
  ok,
}: Readonly<{ content: string; hash: string; ok: boolean }>) {
  return (
    <CodePreviewContainer
      title="Attested Docker Compose"
      content={content}
      filename="docker-compose.yaml"
      hash={hash || undefined}
      verdictOk={ok}
    />
  )
}

export function AttestationReport({ result }: Readonly<{ result: AttestationResult }>) {
  const rawComposeHash = result.steps[5]?.data?.observed
  const composeHash = typeof rawComposeHash === 'string' ? rawComposeHash : ''
  const ok = result.status === 'verified'

  let dockerComposeContent: string | undefined
  try {
    dockerComposeContent = JSON.parse(result.composeContent || '{}').docker_compose_file
  } catch {
    dockerComposeContent = result.composeContent
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SummarySection result={result} />
      {result.composeContent && (
        <ComposeManifest content={dockerComposeContent} hash={composeHash} ok={ok} />
      )}
    </div>
  )
}
