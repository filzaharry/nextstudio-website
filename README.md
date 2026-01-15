# 🚀 NextStudio Website - Evolution & Refactor

This project has evolved into a high-end, interactive digital studio website. It features complex GSAP animations, 3D elements, a modular component-based architecture, and an adaptive contact system.

---

## 📁 Project Overview & Evolution

The project has undergone a massive refactor, moving from a monolithic structure to a highly modular and maintainable codebase.

### 🏗 Architecture

- **Components**: UI is split into reusable HTML fragments (Header, Hero, Services, Projects, Contact Modal, Footer).
- **Modern CSS**: Uses CSS Variables (tokens) for a unified design system and mobile-first responsiveness.
- **GSAP & ScrollTrigger**: Drives the cinematic scroll experiences in Hero, Projects, and Services sections.
- **Dynamic Data**: Category and Service data are decoupled from HTML and managed via `data/categories.json`.

---

## 🛠 Key Features & Implementation

### 1️⃣ Adaptive Contact Modal (Multi-Step Refactor)

The Contact Modal was completely rebuilt to provide a premium user experience:

- **Frosted Glass (Glassmorphism)**: Implemented using `backdrop-filter: blur(30px)` and semi-transparent backgrounds.
- **Adaptive Theming**: Real-time background sampling detects luminance and automatically toggles between `.is-light` and `.is-dark` modes for text contrast.
- **Modular Steps**: Individual HTML components for each step (`contact-step-1.html` to `contact-step-4.html`).
- **Dynamic Service Selection**: Multi-select pills are rendered dynamically from `categories.json` with auto-cleansing (removing brackets) and capitalization.
- **Inline Field Validation**: Error messages appear exactly under the problematic field with real-time clearing as the user types.
- **Toast Notifications**: Snackbar-style alerts for submission errors in the top-right corner.

### 2️⃣ Cinematic Hero Experience

- **Interactive Cursor Follow**: A floating video card follows the cursor with smooth damping (`followEase`).
- **Edge Adhesion**: As requested by users, the video card now stays visible at the borders when the cursor leaves, rather than fading out.
- **3D Integration**: Seamless blending of a 3D logo scene with HTML content.
- **Responsive Scaling**: Video expansion logic adapts from Desktop (737px height) to Tablet (70vh) and Mobile.

### 3️⃣ Precise Header Typography

- **Grid-based Layout**: Switched to a 3-6-3 column grid to ensure the middle item starts exactly at the 1/3 mark of the screen.
- **Multi-Disciplined Alignment**: Left-aligned text within the center block for a structured, modern layout.

### 4️⃣ Optimized Project Showcase

- **Image Loading Guard**: Animations now wait for all project images to load before calculating positions, preventing "jumping" or incorrect scroll offsets.
- **Staggered Character Reveals**: High-end typography animations for labels and headlines.

---

## 🎨 Design System

We use a curated set of CSS variables defined in the global scope:

- `--font-size-xs` to `--font-size-lg`: Unified typography scaling.
- `--color-primary`: Bright accent color (`#f55629`) for CTA and active indicators.
- **Adaptive Classes**: `.is-light` and `.is-dark` are propagated throughout the DOM based on background luminance detection.

---

## 🚀 Deployment & Local Development

### Run with Node.js

```bash
npx -y serve -l 8080
```

_Access at: http://localhost:8080_

### Why a Server is Needed?

The project uses **ES6 Modules** and `fetch()` for loading HTML components and JSON data. Opening `index.html` directly via the filesystem will cause CORS errors.

---

_Project Refactored & Documented: January 15, 2026_
