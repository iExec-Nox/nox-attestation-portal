import { SummarySection } from './SummarySection.tsx'
import { CodePreviewContainer } from './CodePreviewContainer.tsx'
import { HashRow, Eyebrow } from '../../shared/ui/index.tsx'
import type { AttestationResult, CvmInfo, RtmrValues } from '../types/index.ts'

function RtmrSection({ rtmr }: Readonly<{ rtmr: RtmrValues }>) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        padding: '18px 20px',
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <Eyebrow>Runtime Measurement Registers</Eyebrow>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(['rtmr0', 'rtmr1', 'rtmr2', 'rtmr3'] as const).map((key) => (
          <HashRow key={key} label={key.toUpperCase()} value={`0x${rtmr[key]}`} ok={true} />
        ))}
      </div>
    </div>
  )
}

function ChallengeSection({ challenge }: Readonly<{ challenge: string }>) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        padding: '18px 20px',
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <Eyebrow>Cryptographic Challenge</Eyebrow>
      </div>
      <HashRow label="32-byte nonce" value={`0x${challenge}`} ok={true} />
    </div>
  )
}

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

export function AttestationReport({
  result,
  cvm,
}: Readonly<{ result: AttestationResult; cvm: CvmInfo }>) {
  const rawOsHash = result.steps[4]?.data?.expected
  const rawComposeHash = result.steps[5]?.data?.observed
  const osImageHash = typeof rawOsHash === 'string' ? rawOsHash : ''
  const composeHash = typeof rawComposeHash === 'string' ? rawComposeHash : ''
  const ok = result.status === 'verified'

  const dockerComposeContent = JSON.parse(result.composeContent || '').docker_compose_file

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SummarySection
        result={result}
        cvm={cvm}
        ok={ok}
        osImageHash={osImageHash}
        composeHash={composeHash}
      />
      {result.rtmrValues && <RtmrSection rtmr={result.rtmrValues} />}
      {result.challenge && <ChallengeSection challenge={result.challenge} />}
      {result.composeContent && (
        <ComposeManifest content={dockerComposeContent} hash={composeHash} ok={ok} />
      )}
    </div>
  )
}
