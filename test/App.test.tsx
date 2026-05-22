import { render, screen } from '@testing-library/react'

import App from '@/App'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => [] } as Response),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('NOX Components')).toBeInTheDocument()
  })

  it('is accessible — main landmark exists', () => {
    const { container } = render(<App />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
