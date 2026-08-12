# Solar Hybrid System Explorer

Interactive learning webpage for understanding a factory solar and hybrid energy system with:

- 170 identical 710 W solar panels (120.70 kWp)
- 14 PV strings across 2 Solis 50 kW hybrid inverters (100 kW combined AC output)
- High-Voltage Battery Packs (Configuration to confirm)
- Interactive Single Line Diagram (SLD) with operating scenarios and MPPT explorer

## Architecture

This project is built using standard **React + TypeScript + Vite**.

## Run on your computer

Requirements:
- Node.js 22.13 or newer
- npm

To perform a clean installation and start the development server:

```bash
npm ci
npm run dev
```

To build and check types:

```bash
npm run build
npm run lint
```

## Core Source Files & Phase 2 Components

- `index.html` - Primary Vite entry HTML
- `app/page.tsx` - Main page layout, mode selector, and section components
- `app/globals.css` - Global styling, typography, and responsive design
- `src/components/InteractiveSLD.tsx` - Phase 2 Interactive Single Line Diagram with route simulation
- `src/components/SLDNode.tsx` - Electrical component node rendering with scenario states
- `src/components/ComponentDetails.tsx` - Component inspection details & engineering parameters
- `src/components/MPPTExplorer.tsx` - Solis 50 kW Inverter MPPT mapping modal
- `src/components/PVStringModal.tsx` - PV string specification and cold-temperature Voc calculator modal
- `src/components/GeneratorInfoModal.tsx` - Generator integration architecture modal
- `src/hooks/useModalAccessibility.ts` - Modal focus trapping, Escape key handler, and aria accessibility
- `src/data/systemConfig.ts` - Engineering parameters, panel specs, and safety warnings
- `src/data/sldData.ts` - Electrical node definitions and interconnection topology
- `src/data/scenarios.ts` - 6 operating scenarios and dynamic active routing paths

## Engineering Assumptions & Safety Warnings

1. **Identical Panels Assumption**: The 170-panel string plan assumes all installed panels are identical 710 W modules. If different panel models or wattages are used, the PV string and MPPT arrangement must be recalculated and approved by the responsible electrical engineer.
2. **Cold-Temperature Voc**: Cold-temperature Voc must be calculated using the exact panel Voc temperature coefficient and the minimum design temperature. Verify against the inverter 1000 V DC limit.
3. **Battery Configuration**: High-voltage battery pack configuration is to be confirmed. Usable energy cannot be calculated until series configuration, permitted depth of discharge, BMS limits and manufacturer compatibility are confirmed.
4. **Protective Ratings**: All component circuit breaker and fuse ratings listed are provisional and subject to formal short-circuit and cable sizing calculations by a certified M&E engineer.
5. **Conceptual SLD Notice**: This webpage is an educational conceptual learning tool, not a certified construction drawing.

