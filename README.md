# NOX Attestation Explorer

A web interface for verifying the integrity of [NOX Protocol](https://docs.noxprotocol.io/getting-started/welcome) components running inside Intel TDX Confidential VMs (CVMs). It obtains TDX quotes from the aggregator on demand, replays the RTMR measurement chain, and presents a step-by-step attestation report.

## What it does

On load, the explorer fetches a **lightweight CVM listing** from the aggregator (`GET /api/cvms`) — the active components and their instances only, with no attestation data, so the initial load stays small.

When you verify a CVM — a single instance, all instances of a component, or everything — the explorer generates a **fresh challenge** (freshness nonce) for that action and requests attestation data **on demand** (`POST /api/cvms/attestations`) for exactly the selected instances. The aggregator relays that challenge to each targeted CVM and returns its TDX quote (bound to the challenge) and its compose manifest — so the browser never contacts the CVMs directly. The explorer then verifies each quote through a 6-step pipeline:

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

The app talks to two aggregator-backed proxy endpoints, served by the edge functions
under `api/`:

- `GET /api/cvms` — the lightweight CVM listing (no attestation data).
- `POST /api/cvms/attestations` — on-demand quote + compose for a selected set of
  instances, with a fresh `challenge` in the JSON request body.

Both forward to the aggregator via `VITE_CVMS_URL` (the aggregator's `/cvms` endpoint);
the attestation relay derives its upstream by suffixing `/attestations`. Separately,
`VITE_PROOF_OF_CLOUD_URL` backs `/api/proof-of-cloud`.

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
