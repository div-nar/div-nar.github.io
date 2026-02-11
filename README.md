# SATURN V AMBITION — Personal Portfolio

An interactive 3D wireframe Saturn V rocket portfolio. Scroll through mission stages to explore work experience, research, and writing — each section maps to a real stage of the rocket. Built with Three.js, no frameworks.

## Live Site

[https://div-nar.github.io](https://div-nar.github.io)

## How It Works

The Saturn V rocket is rendered as an interactive wireframe in the centre of the screen. As you scroll, the rocket separates into stages — each mapped to a content section:

| Stage | Content |
|-------|---------|
| **CSM** (Command + Service Module) | Intro, mission profile, contact links |
| **S-IVB** (Third Stage + LEM) | Dognosis, Lossfunk |
| **S-II** (Second Stage) | Empathetic Machines, Forecasting Fatalities, Climate Portfolio |
| **Interstage Coupler** | Separates to reveal S-II engine bell |
| **S-IC** (First Stage) | ISB, August AI, latest Substack article |
| **Liftoff** | Transmission Logs — rocket reassembles and lifts off |

## Features

- **Interactive 3D Rocket**: Wireframe Saturn V rendered with Three.js, auto-rotates with mouse influence
- **Stage Separation**: Scroll-driven separation with per-group opacity, camera zoom, and vertical offset
- **LOX Droplets**: Liquid oxygen particles drip from separation seams when stages are apart
- **Pre-Liftoff Sequence**: Rocket reassembles before lifting off when Transmission Logs appear
- **Dynamic Content**: Latest articles loaded from Substack via RSS
- **Responsive**: Adapts layout for mobile with stacked cards

## Tech Stack

- **Three.js** (v0.169.0) — 3D rendering, GLTFLoader for rocket model
- **Vanilla HTML/CSS/JS** — no build tools, no frameworks
- **GLTF/GLB** — rocket model with 13 meshes across 5 separation groups
- **RSS2JSON API** — Substack article integration
- **GitHub Pages** — deployment

## Project Structure

```
.
├── index.html            # Main page (HTML + inline Three.js)
├── writing.html          # Dedicated writing/blog page
├── style.css             # All styling and responsive design
├── rocket-full.glb       # Saturn V 3D model (13 meshes)
├── stage-data.json       # Group Y-range reference data
├── empathetic-machines.pdf
└── README.md
```

## Deployment

Push to `main` — GitHub Pages auto-deploys in 1-2 minutes.

## Contact

- **Email**: divithnarendra@gmail.com
- **LinkedIn**: [divith-narendra](https://www.linkedin.com/in/divith-narendra/)
- **Substack**: [kwerky.substack.com](https://kwerky.substack.com/)
- **X**: [@div_narendra](https://x.com/div_narendra)

---

*Escape velocity or nothing.*
