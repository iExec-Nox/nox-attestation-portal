/* ── Component meta: icons + descriptions per NOX service type ── */
const COMPONENT_META = [
  {
    key: 'nox-gateway-journal',
    icon: 'menu_book',
    desc: 'Append-only audit journal mirroring the gateway in the NOX Protocol.',
  },
  {
    key: 'nox-gateway',
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
] as const

export function getComponentIcon(name: string): string {
  return COMPONENT_META.find(({ key }) => name.includes(key))?.icon ?? 'memory'
}

export function getComponentDescription(name: string): string {
  return COMPONENT_META.find(({ key }) => name.includes(key))?.desc ?? 'NOX Protocol CVM component.'
}
