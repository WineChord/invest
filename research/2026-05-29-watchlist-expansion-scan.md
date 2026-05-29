# 2026-05-29 watchlist expansion scan

Policy version: v1.1

Scan purpose: test the user-supplied candidate universe against the satellite-account mission and promote only names that add a distinct research angle. This is a watchlist maintenance action, not a buy recommendation. Promotion to `watch` means the name deserves ongoing research and automated market-data coverage; it does not pass the evidence gate, filing-review gate, or entry gate for capital allocation.

Retrieved at: 2026-05-29

Current market-data basis: Yahoo Finance chart daily bars through 2026-05-28, retrieved 2026-05-29 by `scripts/refresh-market-data.mjs`.

Metadata basis: SEC company ticker exchange data, retrieved 2026-05-29, plus Yahoo Finance chart availability checks.

## Promotion Criteria

A name can enter `watch` only when it adds a distinct path to asymmetric compounding that is not already covered better by an existing watchlist company. The promotion threshold is intentionally higher for mega-cap AI, broad software, generic commodity, and single-cycle hardware names because this account is not meant to duplicate the user's main Nasdaq technology allocation.

The promoted names still need primary-source filing reviews and valuation states before any buy decision. Their current role is to make the research universe aware of bottlenecks that may become actionable later.

## Promoted To Watch

| Symbol | Role | Why It Passed The Watchlist Gate | Main Risk Kept In Front |
| --- | --- | --- | --- |
| MU | AI memory and HBM bottleneck | Adds direct exposure to high-bandwidth memory scarcity, a different layer from CRDO and ALAB. | Memory remains cyclical and capital intensive; HBM strength may not overcome commodity-cycle downside. |
| CRWV | pure-play AI cloud capacity | Adds direct AI neocloud capacity exposure alongside NBIS, with a clearer pure-play infrastructure angle. | Leverage, customer concentration, GPU depreciation, and hyperscaler competition can impair equity value. |
| IREN | power-backed AI cloud optionality | Adds power-site and data-center conversion optionality among bitcoin miners without promoting the whole miner basket. | Bitcoin economics, buildout financing, and AI customer quality remain unproven. |
| OKLO | advanced nuclear power option | Adds a long-duration power-scarcity option that could matter if AI load growth overwhelms grid capacity. | Pre-commercial execution, NRC licensing, deployment timing, and dilution risk are extreme. |
| LEU | strategic nuclear fuel and HALEU | Adds nuclear-fuel bottleneck exposure that is upstream from power plants and harder to replicate. | Policy dependence, contract timing, enrichment execution, and customer concentration are central. |
| GSAT | satellite spectrum and direct-to-device peer | Adds a spectrum-backed satellite connectivity peer to ASTS without assuming ASTS is the only direct-to-device path. | Customer concentration, network economics, capex, and competitive positioning versus ASTS remain unresolved. |
| KTOS | defense autonomy and space communications | Adds defense-autonomy and space communications exposure without moving down to weaker drone microcaps. | Contractor economics, program timing, and margin quality may cap extreme upside. |

## Not Promoted In This Scan

The following groups were intentionally not added:

- Mega-cap or near-mega-cap AI and platform names such as NVDA, AMD, AVGO, PLTR, SNOW, ANET, DELL, HPE, IBM, NET, DDOG, MDB, ESTC, and CFLT. Many are excellent businesses, but they overlap too much with a broad Nasdaq technology allocation or are already too mature for the satellite account's asymmetric mandate.
- Duplicative AI power, data-center, and crypto-mining names such as APLD, WULF, HUT, CORZ, MARA, RIOT, CLSK, HIVE, BTDR, and CIFR. IREN is the only miner/power conversion name promoted because the category should remain narrow until AI-cloud customer economics are clearer.
- Nuclear and uranium alternatives such as SMR, NNE, CCJ, NXE, UUUU, and URG. OKLO and LEU are the cleaner watchlist representatives for now; the others are either more commodity-like, less proven, or duplicative.
- Space and satellite small caps such as PL, BKSY, VSAT, SATL, SPIR, MNTS, and ARQQ. Existing RKLB, ASTS, LUNR, RDW, and new GSAT already cover the strongest public space angles with less clutter.
- Quantum runner-ups such as RGTI, QBTS, and QUBT. IONQ remains the single quantum option until the category shows broader commercial evidence.
- Drone, robotics, lidar, and voice-AI names such as AVAV, RCAT, OUST, SYM, SERV, SOUN, UMAC, ONDS, and AIRO. KTOS is the only promoted defense-autonomy representative because it has broader defense and space-system exposure.
- Fintech, crypto exchange, and lending names such as UPST, AFRM, HOOD, COIN, and the bitcoin miner basket. CRCL remains the cleaner stablecoin infrastructure watchlist name.
- Biotech and life-science software names such as ADMA, LQDA, ANIP, XENE, KRYS, SPRY, VERV, NTLA, BEAM, CRSP, RXRX, and SDGR. They may deserve a separate specialist research funnel, but they do not belong in this satellite infrastructure watchlist without a dedicated biology thesis process.
- Critical-minerals and battery-resource names such as MP, LAC, ALB, PLL, SGML, TMC, and NAK. These are too commodity- or permitting-driven for the current active research surface.
- Industrial and automation names such as FLEX, JBL, CIEN, FN, MBLY, AMBA, CGNX, PATH, TER, ISRG, EVEX, JOBY, and ACHR. They may be interesting businesses, but they either dilute the mission or lack enough distinct evidence versus current watchlist bottlenecks.

## Operating Implication

After this scan, market-data automation should treat `research/watchlist.csv` as the coordination point. When a new public ticker is added there, `scripts/refresh-market-data.mjs` should be able to hydrate missing security metadata, fetch price history, update latest closes, derive technical snapshots, attempt SEC-derived metrics, and let the dashboard generate the corresponding research page without changing the GitHub Action.
