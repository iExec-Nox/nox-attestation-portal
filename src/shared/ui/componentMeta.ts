/* ── Component meta: icons + descriptions per NOX service type ── */
const COMPONENT_META = [
  {
    key: 'nox-handle-gateway',
    icon: 'hub',
    desc: 'REST gateway for encrypted value storage and delegation in the NOX Protocol.',
  },
  {
    key: 'nox-kms',
    icon: 'key',
    desc: 'Key Management Service for ECIES delegation in the NOX Protocol.',
  },
  {
    key: 'nox-runner',
    icon: 'settings_suggest',
    desc: 'Off-chain computation worker for confidential operations in the NOX Protocol.',
  },
  {
    key: 'nox-ingestor-replayer',
    icon: 'replay',
    desc: 'On-demand gap recovery, republishing historical NoxCompute blocks to NATS JetStream in the NOX Protocol.',
  },
  // Keep after `nox-ingestor-replayer`: lookups take the first `includes` match,
  // and this key also matches the replayer's name — putting it first would give
  // the replayer this entry and make its own unreachable.
  {
    key: 'nox-ingestor',
    icon: 'sensors',
    desc: 'Chain listener streaming NoxCompute events to NATS JetStream in the NOX Protocol.',
  },
] as const

export function getComponentIcon(name: string): string {
  return COMPONENT_META.find(({ key }) => name.includes(key))?.icon ?? 'memory'
}

export function getComponentDescription(name: string): string {
  return COMPONENT_META.find(({ key }) => name.includes(key))?.desc ?? 'NOX Protocol CVM component.'
}
