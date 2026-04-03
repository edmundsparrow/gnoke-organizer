# 📋 Gnoke Organizer

Task management with priorities, scheduling, and smart filters.

> **Portable. Private. Persistent.**

---

## Live Demo

**[edmundsparrow.github.io/gnoke-organizer](https://edmundsparrow.github.io/gnoke-organizer)**

---

## What It Does

- Add tasks with title, notes, date, time, and priority
- Three priority levels: Low, Medium, High
- Smart filters: All, Active, Done, Today, High Priority
- Real-time stats — total, active, completed
- Edit and delete tasks inline
- Works completely offline
- No account. No server. No tracking.

---

## Run Locally

```bash
git clone https://github.com/edmundsparrow/gnoke-organizer.git
cd gnoke-organizer
python -m http.server 8080
```

Open: **http://localhost:8080**

---

## Project Structure

```
gnoke-organizer/
├── index.html          ← Splash / intro screen
├── main/
│   └── index.html      ← Main app shell (clean URL: /main/)
├── js/
│   ├── state.js        ← App state (single source of truth)
│   ├── theme.js        ← Dark / light toggle
│   ├── ui.js           ← Toast, modal, status chip
│   ├── update.js       ← Version checker
│   └── app.js          ← Bootstrap + event wiring
├── style.css           ← Gnoke design system
├── sw.js               ← Service worker (offline / PWA)
├── manifest.json       ← PWA manifest
├── global.png          ← App icon (192×192 and 512×512)
└── LICENSE
```

---

## Privacy & Tech

- **Stack:** Vanilla JS, localStorage — zero dependencies.
- **Privacy:** No tracking, no telemetry, no ads. Your data is yours.
- **License:** GNU GPL v3.0

---

## Support

If this app saves you time, consider buying me a coffee:
**[selar.com/showlove/edmundsparrow](https://selar.com/showlove/edmundsparrow)**

---

© 2026 Edmund Sparrow — Gnoke Suite
