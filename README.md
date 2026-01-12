# 🚀 Services Section - Scroll Animation Demo

Interactive scroll-driven animation with a **Modular CSS Architecture** and **Vanilla JavaScript**.
Key features include sequenced typography animation, sliding hover indicators, and smooth scroll interactions using CSS Variables and `clamp()` logic.

---

## 📁 Project Structure

```
dev-test-filza/
├── index.html              # Main Entry Point
├── README.md               # Documentation
│
├── components/             # Reusable HTML Components
│   ├── navbar.html         # Fixed Navigation
│   ├── title.html          # Animated Title [ S E R V I C E S ]
│   └── card.html           # Card Template
│
├── css/
│   ├── global.css          # Reset, Variables, Utilities
│   ├── services-section.css # Main CSS entry point (Imports modules)
│   └── services/           # Modular CSS Files
│       ├── layout.css      # Core Layout & Scroll Track
│       ├── navigation.css  # Navbar Styling & Interaction
│       ├── title.css       # Title Animation Logic
│       └── cards.css       # Card Styling
│
├── data/
│   └── services.json       # Dynamic Service Data
│
└── js/
    ├── main.js             # App Initialization & Loader
    ├── ui/                 # UI Logic
    │   └── navIndicator.js # Navigation interactions
    └── scroll/             # Scroll Logic
        ├── ScrollProgress.js # Monitors scroll % -> Updates CSS var
        └── titleCardPush.js  # Push effect logic for Title vs Cards
```

---

## 🔄 Coding Flow & Architecture

### 1️⃣ Initialization (`main.js`)

The app follows a simple init sequence:

1.  **Load Components**: Fetches `navbar.html` and `title.html` into the DOM.
2.  **Render Data**: Fetches `services.json`, clones `card.html`, and populates `.cards-wrapper`.
3.  **Start Logic**:
    - `initScrollProgress()`: Tracks scroll position (0-1) and updates `--scroll-progress`.
    - `initTitleCardPush()`: Handles physical collision/push effect between Title and Cards.
    - `initNavIndicator()`: Sets up navigation UI behaviors.

### 2️⃣ Modular CSS Architecture

We broke down the monolithic CSS into functional modules for better maintainability:

- **`layout.css`**: Handles the recursive height (`300vh`), sticky viewports, and background layers.
- **`title.css`**: Contains the complex **4-Phase Animation Timeline** for the `[ SERVICES ]` text.
- **`navigation.css`**: Manages the sliding indicator pill logic using sibling selectors.
- **`cards.css`**: Styles the content cards and their entrance animations.

---

## 🎬 Animation Flow (The "Scroll Timeline")

The animation is driven by a single CSS Variable: `--scroll-progress`, calculated in JS.

### 📍 Phase 1: Bracket Spread (0% - 10%)

- **Logic**: `clamp(0, (progress - 0.05) * 10, 1)`
- The brackets `[ ]` slide open to create space.

### 📍 Phase 2: Text Reveal (10% - 30%)

- **Logic**: Staggered `clamp()` per character.
- Text **S E R V I C E S** reveals character by character with opacity and blur effects.

### 📍 Phase 3: Reading / Pause (30% - 50%)

- **Static Phase**: The title remains sticky and fully visible to allow user reading.
- No significant movement occurs here.

### 📍 Phase 4: Exit & Content Entry (50% - 90%)

- **Title Push**: As cards scroll up, JS detects collision (`titleCardPush.js`) and physically "pushes" the title upwards.
- **Cards Enter**: Cards fade in and translate upwards based on scroll progress.

---

## 🚀 How to Run

### Option 1: Node.js (Recommended)

```bash
npx -y serve -l 8080
# Access: http://localhost:8080
```

### Option 2: Python

```bash
python3 -m http.server 8080
```

> **⚠️ Important**: Do NOT open `index.html` directly (file://). CORS errors will occur due to `fetch()` requests.

---

_Updated: January 4, 2026_
