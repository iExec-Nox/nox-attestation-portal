# NOX Attestation Explorer

A web interface for verifying the integrity of [NOX Protocol](https://docs.noxprotocol.io/getting-started/welcome) components running inside Intel TDX Confidential VMs (CVMs). It obtains TDX quotes from the aggregator, replays the RTMR measurement chain, and presents a step-by-step attestation report.

## What it does

The explorer generates a random challenge (freshness nonce) on load and fetches the CVM list from the aggregator (`/api/cvms?challenge=…`). The aggregator relays that challenge to each CVM and returns, for every instance, its TDX quote (bound to the challenge) and its compose manifest — so the browser never contacts the CVMs directly. The explorer then verifies each quote through a 6-step pipeline:

| Step | Name                    | What is checked                                            |
| ---- | ----------------------- | ---------------------------------------------------------- |
| 1    | Quote Signature         | Intel DCAP remote attestation — hardware quote is valid    |
| 2    | Report Data / Challenge | Freshness nonce is present in the quote (anti-replay)      |
| 3    | RTMR Values             | RTMR0–RTMR3 match known-good reference values              |
| 4    | RTMR3 Replay            | Event log replays to produce the attested RTMR3 value      |
| 5    | OS Image Hash           | DStack OS image hash is present in the event log           |
| 6    | Compose Hash            | docker-compose manifest hash matches the attested workload |

A CVM is considered **verified** only when all 6 steps pass.

## Tech stack

- React 19 + TypeScript 6
- Vite 6 — dev server and build
- Tailwind CSS v4 — utility classes + `--ct-*` CSS custom properties for the design system
- `eslint-plugin-react-hooks` v7 (React Compiler rules)

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

### Other scripts

```bash
npm run build          # type-check + production build → dist/
npm run preview        # serve the dist/ build locally
npm run lint           # ESLint
npm run lint:fix       # ESLint with auto-fix
npm run format         # Prettier
npm run type-check     # tsc --noEmit
npm run test           # Vitest (watch)
npm run test:run       # Vitest (single run)
npm run test:coverage  # Vitest with V8 coverage
```

## Environment

The app expects a `/api/cvms` proxy endpoint that returns the list of CVM instances,
each with its quote and compose manifest embedded (served by the aggregator).
In development, Vite's proxy (`vite.config.ts`, driven by `CVMS_URL`) forwards requests
to the aggregator. The proxy **must preserve the query string**, since the `challenge`
is passed as `/api/cvms?challenge=…`; the same requirement applies to whatever proxy
fronts `/api/cvms` in production.

## Project structure

```text
src/
  attestation/
    components/     UI components (portal, selector, step cards, …)
    hooks/          useAttestation, attestation-state machine
    services/       verifier.ts, quote-service.ts, rtmr-replay.ts
    types/          shared TypeScript types
  shared/
    layout/         TopBar
    lib/            utilities (bytesToHex, cn, …)
    ui/             design-system primitives (MatIcon, CopyButton, HashRow, …)
```

## License

Proprietary — NOX Protocol. All rights reserved.
