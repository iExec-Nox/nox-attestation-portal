# Changelog

## [1.1.0-beta.2](https://github.com/iExec-Nox/nox-attestation-portal/compare/v1.1.0-beta.1...v1.1.0-beta.2) (2026-07-22)


### 🚀 Added

* **attestation:** add proof-of-cloud whitelist check ([e6aee8c](https://github.com/iExec-Nox/nox-attestation-portal/commit/e6aee8c9385fc5fa690c948268b26e7ab11072be))
* use dcap qvl instead of remote phala verifier ([0522465](https://github.com/iExec-Nox/nox-attestation-portal/commit/0522465294f4f8a605b6e6d71c473249665d0abd))
* use js library to verify quote instead of Phala Cloud ([bd11b11](https://github.com/iExec-Nox/nox-attestation-portal/commit/bd11b1174a9350a536da29aff18a4b217f428ecb))


### ✍️ Changed

* **api:** forward query string to CVMS aggregator ([35fdf48](https://github.com/iExec-Nox/nox-attestation-portal/commit/35fdf4815da63199e92b3e554469beb928c1e660))
* **attestation:** run proof-of-cloud check in parallel with dcap ([22e973a](https://github.com/iExec-Nox/nox-attestation-portal/commit/22e973a96364521e0057d56d95f6b6606ff737a8))
* **attestation:** validate quote hex and simplify DCAP timeout handling ([6e4fe06](https://github.com/iExec-Nox/nox-attestation-portal/commit/6e4fe064662c8fee4c65e0ae9945f4e2c1cd49dc))
* change conditions of successful attestation ([0ea0715](https://github.com/iExec-Nox/nox-attestation-portal/commit/0ea0715056b78a902a2b4e2997a1dd3668943b5c))
* **component-selector:** pass challenge to fetch cvms ([2f7093c](https://github.com/iExec-Nox/nox-attestation-portal/commit/2f7093cc0ebd9e0943cf536ff58e451b6721d0e8))
* correct title casing to Nox ([85ac21b](https://github.com/iExec-Nox/nox-attestation-portal/commit/85ac21becdd00d69ba25b78017a52a25862e03e1))
* correct title casing to Nox ([6ccf140](https://github.com/iExec-Nox/nox-attestation-portal/commit/6ccf1402434ab3f1b8b09b171261c0bb1a8c6f61))
* get quote and info from aggregator ([d1db030](https://github.com/iExec-Nox/nox-attestation-portal/commit/d1db03036567cb44d5950c623a39b73d89f4f8e4))
* **portal:** index instances by id for constant-time quote lookup ([021cae1](https://github.com/iExec-Nox/nox-attestation-portal/commit/021cae11bb87191b064163241d2ba6ee2423e228))
* **portal:** use per-load challenge, drop quote prefetch cache ([6e9205b](https://github.com/iExec-Nox/nox-attestation-portal/commit/6e9205b5131f5ded2fca06bd8e517bb84999baef))
* **proxy:** align dev phala proxy path with production rewrite ([ba7be6e](https://github.com/iExec-Nox/nox-attestation-portal/commit/ba7be6e0f1882b15ebdac67e287e4c800bd52cf4))
* **quote-service:** fetch cvms with challenge, drop direct cvm calls ([bb001ca](https://github.com/iExec-Nox/nox-attestation-portal/commit/bb001cabf9f05b02bcdbe5115011a15af9ecfa98))
* **types:** embed quote and app_compose in instance info ([b3728ed](https://github.com/iExec-Nox/nox-attestation-portal/commit/b3728eda2bf9356a0f4048b86e0b5d0999ff2165))
* **use-attestation:** thread challenge through run ([a194f07](https://github.com/iExec-Nox/nox-attestation-portal/commit/a194f072d843c30488894658bd15f1c9e9125463))
* **verifier:** guard against malformed aggregator payload ([439c154](https://github.com/iExec-Nox/nox-attestation-portal/commit/439c15431c78fccdabf74c55728dcee35b2a002b))
* **verifier:** verify from provided instance data instead of fetching ([853d7c7](https://github.com/iExec-Nox/nox-attestation-portal/commit/853d7c778ad1ac6c3eb0ead567f7b6d1d4f7203a))
* **vite:** preserve query string when proxying /api/cvms ([336a7ee](https://github.com/iExec-Nox/nox-attestation-portal/commit/336a7eeeb648cadb2a13920cc4237b0156a0f051))


### 📋 Misc

* **attestation:** add unit tests for DCAP verifier, orchestrator, and proof-of-cloud check ([4122a7c](https://github.com/iExec-Nox/nox-attestation-portal/commit/4122a7ce76941378b1e9373de77347fbce64a349))
* remove dead phala cloud verify api traces ([c407be7](https://github.com/iExec-Nox/nox-attestation-portal/commit/c407be7502ab2463158634da344d0782dc4512c8))
* **verifier:** verify from instance data, drop fetch mocks ([a260406](https://github.com/iExec-Nox/nox-attestation-portal/commit/a260406bb08543bb131c2a312b526db25cbf1eae))

## [1.1.0-beta.1](https://github.com/iExec-Nox/nox-attestation-portal/compare/v1.1.0-beta...v1.1.0-beta.1) (2026-06-17)


### 🚀 Added

* **attestation:** multi-instance cvm portal with security and ux har… ([5f9fad3](https://github.com/iExec-Nox/nox-attestation-portal/commit/5f9fad37e8b76883f164f861944a54ad854a362d))
* **attestation:** multi-instance cvm portal with security and ux hardening ([a401805](https://github.com/iExec-Nox/nox-attestation-portal/commit/a401805b2520534734081f7ea745da0351686cc3))
* **attestation:** quote prefetch, ux polish, and proxy fixes ([c24caf3](https://github.com/iExec-Nox/nox-attestation-portal/commit/c24caf3e25289b4d36f44b4a092790dba6396a4b))
* **attestation:** quote prefetch, ux polish, and proxy fixes ([69a3eee](https://github.com/iExec-Nox/nox-attestation-portal/commit/69a3eeeb383cede72c8c2bad2126f087a4b7158d))
* implement tdx attestation verification portal ([0b8bf3d](https://github.com/iExec-Nox/nox-attestation-portal/commit/0b8bf3d1c7900f165f6e810f3019876d9350d1a6))
* implement tdx attestation verification portal ([e3d3ed4](https://github.com/iExec-Nox/nox-attestation-portal/commit/e3d3ed48c14720a3f32a595c4052a5fc705bc411))
* remove server-side proxy, call cvm and external apis directly ([06d3e30](https://github.com/iExec-Nox/nox-attestation-portal/commit/06d3e305454aca9ae5cc48237fb38fc95a55eae5))
* remove server-side proxy, call cvm and external apis directly ([b279299](https://github.com/iExec-Nox/nox-attestation-portal/commit/b279299bc4376cfa1de3007b370e2e9b8d93386f))
* **ui:** improve instance verification ux across components ([3adb0c7](https://github.com/iExec-Nox/nox-attestation-portal/commit/3adb0c764a376dcc67e9c23dc19709b40ae8b784))
* **ui:** improve instance verification ux across components ([cb10662](https://github.com/iExec-Nox/nox-attestation-portal/commit/cb10662cacf3391f28b32419f2274fce64e1d09f))
* **ui:** show instance_id and machine_id on one line in instance card ([7cdeda3](https://github.com/iExec-Nox/nox-attestation-portal/commit/7cdeda3a51567bfa80f2dc45e270d9df93f7702b))
* **ui:** show instance_id and machine_id on one line in instance card ([425fe37](https://github.com/iExec-Nox/nox-attestation-portal/commit/425fe37407d38ec61e7c05dc59ebee918dc3ca63))
* **ux:** dashboard empty state, verify all buttons and smart re-verify ([d06c851](https://github.com/iExec-Nox/nox-attestation-portal/commit/d06c851157c28d6a571a7cf9792c3ef690d77d76))
* **ux:** dashboard empty state, verify all buttons and smart re-verify ([992af15](https://github.com/iExec-Nox/nox-attestation-portal/commit/992af158bfbcfb2c099a8b5a7749403b720d9b22))


### ✍️ Changed

* **api:** use vite cvm url env var in cvms proxy handler ([f0e43bd](https://github.com/iExec-Nox/nox-attestation-portal/commit/f0e43bdadfb2a3b6d7e4284a854b5962b7eb8ad1))
* **attestation:** harden error handling and fix status priority ([47c131b](https://github.com/iExec-Nox/nox-attestation-portal/commit/47c131b4e1f7737f8c86cb1f5b22300aaa135ed7))
* **csp:** allow google fonts in content security policy ([a38817b](https://github.com/iExec-Nox/nox-attestation-portal/commit/a38817bf13164bc5026860321f4d12501009b1d5))
* **dev:** block api/ dir from vite static serving, add cvms proxy fallback ([bdeee14](https://github.com/iExec-Nox/nox-attestation-portal/commit/bdeee1439f299af3ec5d4c581504450cec963713))
* proxy phala verify through server to bypass cors header restriction ([4973e7a](https://github.com/iExec-Nox/nox-attestation-portal/commit/4973e7ab77239844906152fce3fc1840d009e923))
* proxy phala verify through server to bypass cors header restriction ([70bdc21](https://github.com/iExec-Nox/nox-attestation-portal/commit/70bdc21bb73fd0f83609920ef69dcb7c9fc5b5fa))
* route cvm requests through vercel proxy to avoid cors ([3774e71](https://github.com/iExec-Nox/nox-attestation-portal/commit/3774e71c96eaf7843cdffdbb519e58076aeed518))
* route cvm requests through vercel proxy to avoid cors ([6af4109](https://github.com/iExec-Nox/nox-attestation-portal/commit/6af4109b11b184b81006f89fde88db4ff2d453dd))
* security review ([94addce](https://github.com/iExec-Nox/nox-attestation-portal/commit/94addce92b0084768779d20002984bd246538daf))
* **security:** fix critical regressions found in senior review ([f587ded](https://github.com/iExec-Nox/nox-attestation-portal/commit/f587ded4e410770d13eb0f7b7b2bfb0f541d2a91))
* **security:** fix security review ([72cb097](https://github.com/iExec-Nox/nox-attestation-portal/commit/72cb0976baaab827cac0cdb8d7ef1681b450f20d))
* **vercel:** add explicit build config and spa fallback to enable api functions ([15a448b](https://github.com/iExec-Nox/nox-attestation-portal/commit/15a448bbf627adf9fa1ab3dfcb2c62a4e4bc448f))


### 📋 Misc

* add .nvmrc and update lockfile from merge ([52861ea](https://github.com/iExec-Nox/nox-attestation-portal/commit/52861ea4138b9e986fd7cd15767cc97c1ea803e3))
* add github actions workflow and checks ([2a20fa4](https://github.com/iExec-Nox/nox-attestation-portal/commit/2a20fa49e5cfabacfd9832213861e3d39f801059))
* add release-please configuration ([c40ec48](https://github.com/iExec-Nox/nox-attestation-portal/commit/c40ec48658c1a157bd21388e28747b8928af5449))
* add release-please configuration ([9448799](https://github.com/iExec-Nox/nox-attestation-portal/commit/9448799d295d9e90bdd6c74941faa736d2305db3))
* **App:** fix stale assertion and mock fetch for jsdom ([2babe78](https://github.com/iExec-Nox/nox-attestation-portal/commit/2babe783287892550e4a189e70ff3ac71ac7b711))
* configure husky and commitlint ([b74a444](https://github.com/iExec-Nox/nox-attestation-portal/commit/b74a4448545b49880fb9a2b35713c6f995a092f0))
* configure vitest ([a739d0b](https://github.com/iExec-Nox/nox-attestation-portal/commit/a739d0b49cb3f28f743650ca3cf7eafbe041f3f3))
* ignore .env files ([b7fd58e](https://github.com/iExec-Nox/nox-attestation-portal/commit/b7fd58e309a4a66ac160a5ffa1f6559a67f78b59))
* ignore .env files ([411a790](https://github.com/iExec-Nox/nox-attestation-portal/commit/411a790c474e64838c644d7ee06710e9755b517b))
* initial setup ([cf9abc4](https://github.com/iExec-Nox/nox-attestation-portal/commit/cf9abc4426721d9db6437316a7cdbc37abeed0ed))
* **main:** release 1.0.0 ([961d126](https://github.com/iExec-Nox/nox-attestation-portal/commit/961d1262926fc7ab3d625863a90d8de7f60daad7))
* **main:** release 1.0.0 ([e3aefc4](https://github.com/iExec-Nox/nox-attestation-portal/commit/e3aefc456735bf2d7da1ce946f1a7fffe16dd630))
* **main:** release 1.1.0-beta ([bf46c12](https://github.com/iExec-Nox/nox-attestation-portal/commit/bf46c12ebf61f5870060fac0681cd107acd6fc6a))
* **main:** release 1.1.0-beta ([67bc5f1](https://github.com/iExec-Nox/nox-attestation-portal/commit/67bc5f18c18f87f4018f6a8491260b46f0812020))
* update favicon with iexec logo ([2750bb6](https://github.com/iExec-Nox/nox-attestation-portal/commit/2750bb6d42f8e6cee727664400a1542749074704))
* update favicon with iexec logo ([db4f076](https://github.com/iExec-Nox/nox-attestation-portal/commit/db4f0764cd565be1bd63eaf168ca274abdde3582))

## [1.1.0-beta](https://github.com/iExec-Nox/nox-attestation-portal/compare/v1.0.0...v1.1.0-beta) (2026-06-03)


### 🚀 Added

* remove server-side proxy, call cvm and external apis directly ([67a4787](https://github.com/iExec-Nox/nox-attestation-portal/commit/67a4787aa021478e9d310d3582912a3157340e96))
* remove server-side proxy, call cvm and external apis directly ([561b115](https://github.com/iExec-Nox/nox-attestation-portal/commit/561b115d653c0ee779d3c447b5b12b55d6334eb0))
* **ui:** improve instance verification ux across components ([0097a30](https://github.com/iExec-Nox/nox-attestation-portal/commit/0097a307e2f80eb7bf07fca4cdb86545c7ec2645))
* **ui:** improve instance verification ux across components ([3756251](https://github.com/iExec-Nox/nox-attestation-portal/commit/37562513cc78657f3326151c8ce36a75e5504316))
* **ui:** show instance_id and machine_id on one line in instance card ([7433154](https://github.com/iExec-Nox/nox-attestation-portal/commit/743315424e42004462cf95be20613ead1c72d2d3))
* **ui:** show instance_id and machine_id on one line in instance card ([c4abf24](https://github.com/iExec-Nox/nox-attestation-portal/commit/c4abf24c396012bc85b7e5a051dace9f8345ff51))
* **ux:** dashboard empty state, verify all buttons and smart re-verify ([9c0c2e5](https://github.com/iExec-Nox/nox-attestation-portal/commit/9c0c2e57052e2c43b1275d77da02fc5dbea9f570))
* **ux:** dashboard empty state, verify all buttons and smart re-verify ([46d859d](https://github.com/iExec-Nox/nox-attestation-portal/commit/46d859d4d7a12c1052a68207bc5667e6006e48cb))


### ✍️ Changed

* proxy phala verify through server to bypass cors header restriction ([e656a3f](https://github.com/iExec-Nox/nox-attestation-portal/commit/e656a3fe623a1753f7c03aaa5a47d79046792a8c))
* proxy phala verify through server to bypass cors header restriction ([7cbc205](https://github.com/iExec-Nox/nox-attestation-portal/commit/7cbc205b25c379ab85425b3812dd32484c67570f))


### 📋 Misc

* update favicon with iexec logo ([093b9f0](https://github.com/iExec-Nox/nox-attestation-portal/commit/093b9f063057737082846497a2c4b348c4a3637b))
* update favicon with iexec logo ([787d870](https://github.com/iExec-Nox/nox-attestation-portal/commit/787d8703de39dfe4ff108e6766d381f72ca89c0e))

## 1.0.0 (2026-05-29)


### 🚀 Added

* **attestation:** multi-instance cvm portal with security and ux har… ([9887e12](https://github.com/iExec-Nox/nox-attestation-portal/commit/9887e12e7c65f6f8afa4deb0ed1519c6d9f6efb9))
* **attestation:** multi-instance cvm portal with security and ux hardening ([bb2c5ed](https://github.com/iExec-Nox/nox-attestation-portal/commit/bb2c5ed70d2fc521601475745a1bcc717f6f42a5))
* **attestation:** quote prefetch, ux polish, and proxy fixes ([44b4f52](https://github.com/iExec-Nox/nox-attestation-portal/commit/44b4f529846ad914d5128d0a1fe593991176506a))
* **attestation:** quote prefetch, ux polish, and proxy fixes ([9ca908b](https://github.com/iExec-Nox/nox-attestation-portal/commit/9ca908b31dfc12c43e3759e3dd0764d9bfe8ee44))
* implement tdx attestation verification portal ([e6dc4b3](https://github.com/iExec-Nox/nox-attestation-portal/commit/e6dc4b301db91bc75515429bde2dbc58026550c9))
* implement tdx attestation verification portal ([13a358b](https://github.com/iExec-Nox/nox-attestation-portal/commit/13a358b56b398cd0b2cdb1dc6c481a42b5b22320))


### ✍️ Changed

* **attestation:** harden error handling and fix status priority ([6a1e350](https://github.com/iExec-Nox/nox-attestation-portal/commit/6a1e35054a54eca4d49f1a0156d01b3bbf5b89e5))
* route cvm requests through vercel proxy to avoid cors ([d1eb567](https://github.com/iExec-Nox/nox-attestation-portal/commit/d1eb56757efc15a74d5de9487ec3ea1c61b06125))
* route cvm requests through vercel proxy to avoid cors ([bfc3ba1](https://github.com/iExec-Nox/nox-attestation-portal/commit/bfc3ba1830726a28b83c035fcb2c1e48df108fe3))


### 📋 Misc

* add github actions workflow and checks ([2a20fa4](https://github.com/iExec-Nox/nox-attestation-portal/commit/2a20fa49e5cfabacfd9832213861e3d39f801059))
* add release-please configuration ([8074b5d](https://github.com/iExec-Nox/nox-attestation-portal/commit/8074b5d6cb34b4814f88ed48ee69d9c968f4c4e9))
* add release-please configuration ([3599197](https://github.com/iExec-Nox/nox-attestation-portal/commit/3599197ec8deeb99bf70b9bfebb37218995b029d))
* **App:** fix stale assertion and mock fetch for jsdom ([d025ef8](https://github.com/iExec-Nox/nox-attestation-portal/commit/d025ef845934f10bd075f9cd824e3a396b0132c7))
* configure husky and commitlint ([b74a444](https://github.com/iExec-Nox/nox-attestation-portal/commit/b74a4448545b49880fb9a2b35713c6f995a092f0))
* configure vitest ([a739d0b](https://github.com/iExec-Nox/nox-attestation-portal/commit/a739d0b49cb3f28f743650ca3cf7eafbe041f3f3))
* initial setup ([cf9abc4](https://github.com/iExec-Nox/nox-attestation-portal/commit/cf9abc4426721d9db6437316a7cdbc37abeed0ed))
