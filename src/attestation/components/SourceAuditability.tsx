import { MatIcon } from '../../shared/ui/index.tsx'

export interface AuditLink {
  label: string
  icon: string
  url: string | null
  tooltip: string
}

interface ComponentAuditability {
  commitUrl: string
  buildWorkflowUrl: string
  attestationUrl: string | null
  rekorUrl: string | null
}

const AUDITABILITY_REGISTRY: Array<{ patterns: string[]; data: ComponentAuditability }> = [
  {
    // matches: nox-handle-gateway, nox-gateway, nox-gateway-*
    patterns: ['handle-gateway', 'nox-gateway'],
    data: {
      commitUrl: 'https://github.com/iExec-Nox/nox-handle-gateway',
      buildWorkflowUrl:
        'https://github.com/iExec-Nox/nox-handle-gateway/blob/main/.github/workflows/docker-build-on-tag.yaml',
      attestationUrl: 'https://github.com/aghiles-ait/test-sigstore/attestations/30789221',
      rekorUrl:
        'https://search.sigstore.dev/?hash=0a50000fc886c537e42d1a953449be0d37af9a2f6fb296a55cdf11403110969a',
    },
  },
  {
    patterns: ['nox-runner'],
    data: {
      commitUrl: 'https://github.com/iExec-Nox/nox-runner',
      buildWorkflowUrl:
        'https://github.com/iExec-Nox/nox-runner/blob/main/.github/workflows/docker-build-on-tag.yaml',
      attestationUrl: null,
      rekorUrl: null,
    },
  },
  {
    patterns: ['nox-kms'],
    data: {
      commitUrl: 'https://github.com/iExec-Nox/nox-kms',
      buildWorkflowUrl:
        'https://github.com/iExec-Nox/nox-kms/blob/main/.github/workflows/docker-build-on-tag.yaml',
      attestationUrl: null,
      rekorUrl: null,
    },
  },
  {
    // matches: nox-ingestor, nox-gateway-journal
    patterns: ['nox-ingestor', 'gateway-journal'],
    data: {
      commitUrl: 'https://github.com/iExec-Nox/nox-ingestor',
      buildWorkflowUrl:
        'https://github.com/iExec-Nox/nox-ingestor/blob/main/.github/workflows/docker-build-on-tag.yaml',
      attestationUrl: null,
      rekorUrl: null,
    },
  },
]

export function getAuditLinks(componentName: string): AuditLink[] {
  const entry = AUDITABILITY_REGISTRY.find(({ patterns }) =>
    patterns.some((p) => componentName.includes(p)),
  )
  if (!entry) return []
  const { data } = entry
  return [
    {
      label: 'Source Code',
      icon: 'code',
      url: data.commitUrl,
      tooltip: 'View source repository on GitHub',
    },
    {
      label: 'Build Workflow',
      icon: 'deployed_code',
      url: data.buildWorkflowUrl,
      tooltip: 'View CI build workflow on GitHub',
    },
    {
      label: 'Attestation',
      icon: 'verified_user',
      url: data.attestationUrl,
      tooltip: 'View image attestation on GitHub',
    },
    {
      label: 'Rekor Record',
      icon: 'search',
      url: data.rekorUrl,
      tooltip: 'Verify transparency log entry on Sigstore Rekor',
    },
  ]
}

export function AuditLinkPill({ label, icon, url, tooltip }: Readonly<AuditLink>) {
  const available = url !== null
  return (
    <a
      href={url ?? undefined}
      target="_blank"
      rel="noreferrer"
      title={available ? tooltip : 'Coming soon'}
      aria-disabled={!available}
      onClick={!available ? (e) => e.preventDefault() : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: 22,
        padding: '0 8px',
        borderRadius: 6,
        background: available ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: `1px solid ${available ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)'}`,
        color: available ? 'var(--ct-fg-3)' : 'var(--ct-fg-6)',
        font: '600 10px/1 var(--ct-font-ui)',
        textDecoration: 'none',
        cursor: available ? 'pointer' : 'default',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        transition: 'background 120ms ease, border-color 120ms ease',
      }}
    >
      <MatIcon name={icon} size={11} color={available ? 'var(--ct-fg-4)' : 'var(--ct-fg-6)'} />
      {label}
      {available ? (
        <MatIcon name="open_in_new" size={9} color="var(--ct-fg-6)" />
      ) : (
        <span
          style={{
            fontSize: 8,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            color: 'var(--ct-fg-6)',
            fontWeight: 700,
          }}
        >
          soon
        </span>
      )}
    </a>
  )
}
