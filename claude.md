# README.md

## C Programming — Zero → Hero (Static Website)

A clean, **plain HTML/CSS/JS** learning site for first‑year engineering students to go from **zero** to **hero** in C programming. Built for **clarity, pedagogy, and accessibility**. No frameworks, no build step—runs on **GitHub Pages** or any static host (including PythonAnywhere static files).

---

## ✨ Features

* **Left navigation** with collapsible topic groups and scroll‑synced active links
* **Keyboard shortcuts**: `/` focus search · `n/p` next/prev section · `t` toggle nav (mobile/desktop)
* **Search-as-you-type** filter over lesson titles (client-side)
* **Callouts** (Tip/Warning/Error/OK) and **copy buttons** on code blocks
* **Accessible** (semantic HTML, ARIA, focus outlines, contrast ≥ 4.5:1)
* **Print stylesheet** for classroom handouts (A4)
* **Design tokens** (colors, radii, shadows) for easy theming

---

## 🗂️ Project Structure

```
/c-zero-hero/
  index.html                    # Landing + Getting Ready
  /assets/
    styles.css                  # Extracted site styles
    app.js                      # Interactions (nav, search, scrollspy, copy, shortcuts)
    prism.css                   # (optional) syntax highlighting
    prism.js                    # (optional) syntax highlighting
    favicon.svg
  /images/
    diagrams/                   # Simple inline-friendly SVGs (memory, pointers, loops, files)
  /chapters/
    01-introduction.html
    02-basics.html
    03-control-flow.html
    04-loops.html
    05-arrays-strings.html
    06-functions.html
    07-pointers.html
    08-structures.html
    09-files.html
    10-algorithms.html
  /practice/
    basics.html
    control-loops.html
    arrays.html
    functions.html
    pointers.html
    structures.html
    files.html
  /reference/
    common-errors.html
    exam-guide.html
    tools-resources.html
  404.html
  README.md
  CLAUDE.md
```

> **Tip:** Prefer **relative links** so the site works locally and on GitHub Pages.

---

## 🚀 Quick Start

**Open locally**: double‑click `index.html` in any modern browser.

**Recommended browsers**: latest Chrome, Edge, Firefox, Safari; mobile browsers on iOS/Android supported.

---

## ✍️ Authoring Content

Use the existing `index.html` as reference for markup patterns.

### 1) Create a new chapter page

1. Duplicate a chapter template (e.g., `02-basics.html`).
2. Update the `<title>`, main `<h1>`, and section IDs.
3. Ensure the **sidebar** includes links to this page and its subsections.
4. Keep heading hierarchy: one `<h1>` per page, then `<h2>`/`<h3>`.

### 2) Add a new section

```html
<article class="card" id="basics-io">
  <h2>Input / Output</h2>
  <p>…theory…</p>
  <pre><code class="language-c">/* code */</code></pre>
  <div class="tip warn"><strong>scanf gotcha:</strong> …</div>
  <ul>
    <li>Practice item 1</li>
    <li>Practice item 2</li>
  </ul>
</article>
```

* **IDs** must be **kebab-case** (e.g., `function-prototypes`).
* Code blocks: `<pre><code class="language-c">…</code></pre>` (Prism optional).
* Use callouts: `.tip`, `.warn`, `.err`, `.ok` with a strong/label.

### 3) Diagrams (SVG)

* Prefer **inline SVG** for crisp scaling and theming.
* Name files predictably, e.g., `images/diagrams/pointers-basic.svg`.
* Provide `<figure>` + `<figcaption>` for context.

### 4) Common Errors box

Every page ends with **Common Errors & Fixes** relevant to the topic (compile, runtime, logic), using `.tip.err` and `.tip.warn` blocks.

---

## 🎨 Design System

* **Typography**: system UI stack; code uses monospace. Keep line length \~80–100ch.
* **Colors**: defined as CSS variables in `:root` (see `styles.css`).
* **Layout**: left rail \~15–20% (desktop), right content \~80–85%; on mobile, the rail becomes a slide‑in drawer.
* **Components**: topbar, sidebar groups, cards, callouts, code blocks, table styles, buttons.

---

## ♿ Accessibility Checklist (WCAG 2.1 AA)

* [ ] Landmarks: `<header> <nav> <main> <footer>` present
* [ ] Keyboard: all interactive elements reachable; shortcuts documented
* [ ] Color contrast ≥ 4.5:1; focus outlines visible
* [ ] `aria-expanded`/`aria-controls` for collapsibles; `aria-current="page"` for active link
* [ ] Images/diagrams have alt text/figcaptions
* [ ] Headings form a logical outline (no skipped levels)

---

## ⚙️ JS Interactions (in `assets/app.js`)

* Sidebar accordion with `aria-expanded`
* Scrollspy: highlight link of section in view
* Smooth scrolling for anchor links
* Search filter over sidebar links
* Keyboard shortcuts: `/`, `n/p`, `t`
* Copy buttons for code blocks
* Persisted preferences: sidebar state, theme (if added)

---

## 🧪 Quality Gates

Run these before publishing:

1. **HTML validation**: [https://validator.w3.org/nu/](https://validator.w3.org/nu/) (0 errors, no critical warnings)
2. **Accessibility**: WAVE or axe DevTools (fix contrast/labels)
3. **Performance (Lighthouse)**: Mobile **≥ 90** Perf; **≥ 95** A11y/Best/SEO
4. **Link check**: ensure no 404s; test anchors across pages
5. **Manual QA**: keyboard‑only nav; print view (A4); small screens (360px)

---

## 📦 Deploy

### GitHub Pages

1. Create a new repo, e.g., `c-zero-hero`.
2. Push the folder structure above.
3. In repo Settings → **Pages** → Source: **Deploy from a branch**, Branch: `main` (root).
4. Wait for the green check, then open the Pages URL.

### PythonAnywhere (static)

* Upload the folder to your PythonAnywhere files.
* Add a **Static files** map (e.g., URL `/` → your folder path), set `index.html` as default.

> Keep all links **relative** (e.g., `./chapters/02-basics.html`) so both hosts work.

---

## 🔒 Privacy & Security

* No analytics or tracking by default (classroom‑friendly). If you add analytics, document it here and offer an opt‑out.
* No third‑party scripts except optional Prism (self‑host or local vendored files preferred).

---

## 🧭 Roadmap (nice‑to‑have)

* Lightweight full‑text search (≤ 20KB index)
* Sticky per‑page mini‑TOC
* Progress badges via `localStorage`
* PWA offline pack for classrooms

---

## 📜 License

* **Code**: MIT
* **Course content**: choose one—CC BY 4.0 / CC BY‑NC 4.0 (TBD by course owner). Update this line accordingly.

---

## 🙌 Credits

Crafted for first‑year CSE students. Design goal: calm, clear, and practice‑first.

---

# CLAUDE.md

## Role & Mission

You are **Senior Front‑End Engineer + Technical Writer** assigned to maintain and expand the **C Programming — Zero → Hero** static site. You will **extend** the existing skeleton into a **complete, publishable** learning platform.

## Hard Constraints (do not violate)

* **Pure static**: vanilla HTML, CSS, JS (no build tools/frameworks).
* **Runs from filesystem and GitHub Pages** (use **relative links** only).
* **Accessibility**: WCAG 2.1 AA; keyboard‑first UX; documented shortcuts.
* **Performance**: Lighthouse (mobile) Perf ≥ 90; A11y/Best/SEO ≥ 95.
* **No placeholders** in shipped pages.

## Sources of Truth

1. The provided `index.html` UI skeleton and tokens.
2. The course guide the user supplies (treat as canonical for theory, examples, exercises). If ambiguity arises, add a small **FYI** note and preserve correctness.

## Output Contract

For each task:

* Provide a **unified diff** (when editing existing files) **and** the **final file content**.
* Keep changes minimal and evidence‑based (don’t churn unrelated parts).
* Summarize **QA checks** completed (HTML validation, Lighthouse, A11y notes).

## File Tree You Must Maintain

(See README’s structure.) Every HTML page must include the same **sidebar** and **topbar** patterns, highlight the current page, and share `assets/styles.css` and `assets/app.js`.

## Authoring Rules

* Headings: one `<h1>` per page; then `<h2>`/`<h3>` for sections.
* Section IDs: **kebab-case** and unique (used by anchors + scrollspy).
* Code blocks: `<pre><code class="language-c">…</code></pre>`; add a copy button via JS.
* Callouts: `.tip`, `.warn`, `.err`, `.ok` with a short bold label.
* Each chapter ends with **Practice** and **Common Errors** relevant to that topic.
* Tables: semantic `<table><thead><tbody>`; avoid layout tables.
* SVG diagrams: simple, inline or under `/images/diagrams/`, with `<figure>` + `<figcaption>`.

## Accessibility Requirements

* Semantic landmarks (`<header> <nav> <main> <footer>`)
* `aria-expanded`, `aria-controls` on collapsibles; `aria-current="page"` for active nav link
* Visible focus states; contrast ≥ 4.5:1
* Keyboard shortcuts: `/`, `n/p`, `t`; do not prevent default typing in inputs
* Alt text for images; captions for diagrams

## Interaction Requirements (assets/app.js)

* Collapsible sidebar groups (persist open state in `localStorage`)
* Scrollspy that updates active link on scroll
* Smooth anchor scroll, including cross‑page anchors where relevant
* Search filter over sidebar links
* Copy buttons injected for all `<pre><code>` blocks
* Optional theme toggle (persisted)

## Visual System (assets/styles.css)

* Extract all inline styles from `index.html` into `styles.css`.
* Preserve tokens (colors, radii, shadow). Keep content width ≤ `--max-content`.
* Mobile: rail becomes drawer; maintain the topbar height and sticky behavior.

## Tasks Backlog (execute top‑down)

1. **Extract CSS/JS** from the skeleton into `/assets/styles.css` and `/assets/app.js`; update all pages to reference them.
2. **Create chapter pages** under `/chapters/` mirroring the topics; ensure the sidebar links match and highlight current page.
3. **Populate content** from the course guide across pages with proper headings, code, tables, callouts, diagrams.
4. **Build practice pages** grouped by topic; cross‑link from chapters.
5. **Create reference pages** (Common Errors, Exam Guide, Tools & Resources) from the guide.
6. **Add copy buttons**, keyboard shortcuts, and search filter behavior.
7. **Implement print stylesheet** for A4 (hide nav; readable serif; include page title and canonical URL in header/footer).
8. **QA & fix**: run the Quality Gates (below) and report results.

## Quality Gates (must pass before completion)

* ✅ Nu HTML Checker: **0 errors**; no critical warnings
* ✅ WAVE / axe: no contrast violations; forms/controls have labels; landmarks present
* ✅ Lighthouse (mobile): Perf ≥ 90; A11y/Best/SEO ≥ 95
* ✅ All links valid; anchors resolve; keyboard‑only navigation works
* ✅ Print view renders cleanly in A4 and hides navigation

## Diff & Commit Conventions

* Small, topic‑scoped diffs.
* Commit message format:

  * `feat(chapters): add 04-loops with patterns and common errors`
  * `style(css): extract tokens and improve contrast for callouts`
  * `fix(a11y): add aria-current to active sidebar links`

## PR Template (use in your final summary)

```
### What changed
- …

### Why
- …

### Screenshots / Lighthouse
- (attach)

### QA Checklist
- [ ] HTML validated
- [ ] A11y checked (WAVE/axe)
- [ ] Lighthouse (mobile) ≥ targets
- [ ] Keyboard-only smoke test
- [ ] Print view OK
```

## Self‑Audit Checklist (fill in each delivery)

* [ ] New/edited pages follow heading hierarchy and ID rules
* [ ] Code blocks labeled and copyable
* [ ] Callouts used for tricky points
* [ ] Diagrams have captions and alt text
* [ ] Sidebar updated across all pages; active state correct
* [ ] No external dependencies beyond optional Prism (prefer vendored)

## Failure Handling

* If a requirement conflicts, **do the safe, standards‑compliant thing**, and note the trade‑off in the PR summary.
* Do not invent technical content; if the source is unclear, mark a small **TBD** note and proceed minimally.

## Delivery Format

* Provide the **full file contents** for any new/changed file.
* Include a **file tree** summary and a short **QA report** at the end of the response.

---

**End of CLAUDE.md**
