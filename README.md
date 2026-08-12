# Solar Hybrid System Explorer

Interactive learning webpage for understanding a factory solar and hybrid
energy system with:

- 170 identical 710 W solar panels (120.70 kWp)
- 14 PV strings
- 2 x Solis 50 kW hybrid inverters
- 2 battery packs
- Grid, generator, switching and critical loads

## Open the website online

https://solar-hybrid-explorer.fmgimuzuljb.chatgpt.site

## Run on your computer

Requirements:

- Node.js 22.13 or newer
- npm

Open a terminal inside this folder and run:

```bash
npm install
npm run dev
```

Then open the local address shown in the terminal.

## Edit the webpage

The main files are:

- `app/page.tsx` - website content and interactive functions
- `app/globals.css` - colors, layout and responsive design
- `app/layout.tsx` - page title and metadata

After making changes, verify the production build with:

```bash
npm run build
```

## Important engineering assumption

The 170-panel string plan assumes all installed panels are identical 710 W
modules. If different panel models or wattages are used, the PV string and
MPPT arrangement must be recalculated and approved by the responsible
electrical engineer.

This webpage is a conceptual learning tool, not a construction drawing.
