import { SummarySection } from './SummarySection.tsx'
import { CodePreviewContainer } from './CodePreviewContainer.tsx'
import { getAuditLinks, type AuditLink } from './SourceAuditability.tsx'
import type { AttestationResult } from '../types/index.ts'

function ComposeManifest({
  content,
  hash,
  ok,
  auditLinks,
}: Readonly<{ content: string; hash: string; ok: boolean; auditLinks: AuditLink[] }>) {
  return (
    <CodePreviewContainer
      title="Attested Docker Compose"
      content={content}
      filename="docker-compose.yaml"
      hash={hash || undefined}
      verdictOk={ok}
      auditLinks={auditLinks}
    />
  )
}

export function AttestationReport({
  result,
  componentName,
}: Readonly<{ result: AttestationResult; componentName: string }>) {
  const rawComposeHash = result.steps[5]?.data?.expected
  const composeHash = typeof rawComposeHash === 'string' ? rawComposeHash : ''
  const ok = result.status === 'verified'
  const auditLinks = getAuditLinks(componentName)

  let dockerComposeContent: string
  try {
    dockerComposeContent =
      JSON.parse(result.composeContent || '{}').docker_compose_file ?? result.composeContent ?? ''
  } catch {
    dockerComposeContent = result.composeContent ?? ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SummarySection result={result} />
      {result.composeContent && (
        <ComposeManifest
          content={dockerComposeContent}
          hash={composeHash}
          ok={ok}
          auditLinks={auditLinks}
        />
      )}
    </div>
  )
}
