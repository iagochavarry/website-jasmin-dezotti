# Jasmin Website V2 Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current site's design system, typography, logos, and layout with the new V2 treatment in `Jasmin Website V2/`, preserve all V1 real copy (bio, credentials, trajectory, testimonials, 2 blog posts), and simplify routes to home + blog only.

**Architecture:** Surgical replacement inside the existing Next.js 15 / Tailwind v4 / React 19 shell. Keep config + redirects + GA + SEO infra. Replace design tokens (`@theme`), swap Nacelle for Cormorant Garamond via `next/font/google`, import V2's bespoke CSS as `additional-styles/v2.css`, rewrite the home section components and blog routes, delete unused routes/components/assets.

**Tech Stack:** Next.js 15 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript, `next/font/google` (Cormorant Garamond + Inter), `next/image`.

**Spec:** `docs/superpowers/specs/2026-05-24-jasmin-v2-refactor-design.md`

**Verification approach:** This is a UI refactor with no unit tests. Each task ends with two verifications: (1) `pnpm build` succeeds (catches type / import errors), and (2) `pnpm dev` renders the affected route(s) without runtime errors. Visual fidelity to V2 is checked at the end (Task 22).

---

## Task 1: Set up feature branch + baseline build

**Files:** none (git only)

- [ ] **Step 1: Create + switch to feature branch**

```bash
git checkout -b refactor/jasmin-v2
git status
```

Expected: on `refactor/jasmin-v2`, working tree clean (V2 folder is untracked — that's fine, we read from it but don't commit it).

- [ ] **Step 2: Baseline build to confirm green starting point**

```bash
pnpm install
pnpm build
```

Expected: build succeeds. If it fails, stop and report — refactor starts from a green baseline.

- [ ] **Step 3: Note the build size for later comparison (optional)**

Capture the Next build output's "First Load JS" line for the home route. We'll compare at the end.

---

## Task 2: Replace fonts (Nacelle → Cormorant Garamond) in `app/layout.tsx`

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace font imports + wiring**

Replace the top of `app/layout.tsx`:

```tsx
import "./css/style.css";

import { Inter, Cormorant_Garamond } from "next/font/google";
import Image from "next/image";

import ConditionalHeader from "@/components/ui/conditional-header";
import GoogleAnalytics from "@/components/analytics/google-analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
```

Update the `<body>` `className`:

```tsx
<body
  className={`${inter.variable} ${cormorant.variable} bg-[var(--color-cream)] font-inter text-base text-[var(--color-ink)] antialiased relative`}
>
```

Note: `ConditionalHeader` will be removed in Task 6 — leave the import for now to keep the build green; it's deleted in Task 6 and replaced by a direct `<Header />` import in Task 19.

- [ ] **Step 2: Remove the mesh background block + image**

Delete this block from `app/layout.tsx`:

```tsx
{/* Background Mesh */}
<div className="fixed inset-0 -z-10 opacity-40">
  <Image
    src="/images/mesh2.jpg"
    alt=""
    fill
    className="object-cover blur-[2px] saturate-50"
    quality={50}
    priority
  />
</div>
```

Also remove the now-unused `import Image from "next/image";` line.

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: succeeds. (Pages will look broken since tokens haven't been swapped yet — that's fine, fixed in Task 4.)

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "refactor(fonts): swap Nacelle for Cormorant Garamond; drop mesh background"
```

---

## Task 3: Delete Nacelle font files

**Files:**
- Delete: `public/fonts/nacelle-regular.woff2`, `public/fonts/nacelle-italic.woff2`, `public/fonts/nacelle-semibold.woff2`, `public/fonts/nacelle-semibolditalic.woff2`

- [ ] **Step 1: Confirm no other reference**

```bash
grep -r "nacelle" --include="*.ts" --include="*.tsx" --include="*.css" --include="*.json" .
```

Expected: no matches outside the `public/fonts/` directory and any leftover class names like `font-nacelle` in components (those are addressed in component rewrites in later tasks — leaving them temporarily is fine since the body still defaults to Inter).

- [ ] **Step 2: Delete the font files**

```bash
rm public/fonts/nacelle-regular.woff2 public/fonts/nacelle-italic.woff2 public/fonts/nacelle-semibold.woff2 public/fonts/nacelle-semibolditalic.woff2
rmdir public/fonts 2>/dev/null || ls public/fonts/
```

If `public/fonts` is now empty, remove it. If it contains other files, leave it.

- [ ] **Step 3: Commit**

```bash
git add -u public/fonts
git commit -m "chore(fonts): remove unused Nacelle woff2 files"
```

---

## Task 4: Replace `@theme` palette in `app/css/style.css` (V1 tokens → V2 tokens)

**Files:**
- Modify: `app/css/style.css`

- [ ] **Step 1: Replace the `@theme` block**

Replace lines 11–27 (`@theme { ... medical theme colors ... text scale ... }` and onward up through `--color-text-muted`) with:

```css
@theme {
  --font-inter: var(--font-inter), sans-serif;
  --font-cormorant: var(--font-cormorant), "Times New Roman", serif;

  /* V2 palette */
  --color-cream: #F1E3D3;
  --color-cream-2: #EAD6C2;
  --color-paper: #FBF6EF;
  --color-sage: #6E7563;
  --color-sage-deep: #565C4D;
  --color-sage-soft: #8E957F;
  --color-terra: #C07A52;
  --color-terra-deep: #A86340;
  --color-ink: #3A3D34;
  --color-line: rgba(110, 117, 99, 0.18);
  --color-line-warm: rgba(192, 122, 82, 0.35);
  --color-accent-soft: #E6BFA6;

  --text-xs: 0.8125rem;
  --text-xs--line-height: 1.5384;
  --text-sm: 0.875rem;
  --text-sm--line-height: 1.5715;
  --text-base: 0.9375rem;
  --text-base--line-height: 1.5333;
  --text-base--letter-spacing: -0.0125em;
  --text-lg: 1.125rem;
  --text-lg--line-height: 1.5;
  --text-lg--letter-spacing: -0.0125em;
  --text-xl: 1.25rem;
  --text-xl--line-height: 1.5;
  --text-xl--letter-spacing: -0.0125em;
  --text-2xl: 1.5rem;
  --text-2xl--line-height: 1.415;
  --text-2xl--letter-spacing: -0.0268em;
  --text-3xl: 1.75rem;
  --text-3xl--line-height: 1.3571;
  --text-3xl--letter-spacing: -0.0268em;
  --text-4xl: 2.5rem;
  --text-4xl--line-height: 1.1;
  --text-4xl--letter-spacing: -0.0268em;
  --text-5xl: 3.5rem;
  --text-5xl--line-height: 1;
  --text-5xl--letter-spacing: -0.0268em;
  --text-6xl: 4rem;
  --text-6xl--line-height: 1;
  --text-6xl--letter-spacing: -0.0268em;
  --text-7xl: 4.5rem;
  --text-7xl--line-height: 1;
  --text-7xl--letter-spacing: -0.0268em;

  --animate-shine: shine 5s ease-in-out 500ms infinite;
  --animate-gradient: gradient 6s linear infinite;

  @keyframes shine {
    0%   { top: 0; transform: scaleY(5); opacity: 0; }
    10%  { opacity: 0.8; }
    20%  { top: 100%; transform: scaleY(10); opacity: 0; }
    100% { top: 100%; transform: scaleY(1); opacity: 0; }
  }

  @keyframes gradient {
    to { background-position: 200% center; }
  }
}
```

Remove the `@keyframes gentleFloat` and `@keyframes gentlePulse` blocks (used only by the deleted ScrollIndicator).

- [ ] **Step 2: Update the `@layer base` block at the bottom of `style.css`**

Change body bg and text colors:

```css
@layer base {
  html {
    scroll-behavior: smooth;
  }

  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-line, currentColor);
  }

  body {
    background-color: var(--color-cream);
    color: var(--color-ink);
  }

  /* Scroll offset to compensate fixed header */
  section[id] {
    scroll-margin-top: 6rem;
  }

  @media (min-width: 768px) {
    section[id] {
      scroll-margin-top: 7rem;
    }
  }
}
```

- [ ] **Step 3: Update the `@import` lines at the top of `style.css`**

Change:

```css
@import 'tailwindcss';

/* V2 design system */
@import './additional-styles/v2.css';

@plugin "@tailwindcss/forms" {
  strategy: base;
}
```

(Removes the imports of `utility-patterns.css` and `theme.css` — both deleted in Task 5.)

- [ ] **Step 4: Build**

```bash
pnpm build
```

Expected: succeeds (the build will reference the missing `v2.css` only after Task 5 creates it; if it fails on the missing import, defer Step 3 of this task until Task 5).

If the build fails because `v2.css` does not yet exist, revert just the `@import './additional-styles/v2.css';` line and re-add it at the end of Task 5.

- [ ] **Step 5: Commit**

```bash
git add app/css/style.css
git commit -m "refactor(theme): replace @theme palette with V2 tokens; drop V1 keyframes"
```

---

## Task 5: Create `app/css/additional-styles/v2.css` (port V2's CSS)

**Files:**
- Create: `app/css/additional-styles/v2.css`
- Delete: `app/css/additional-styles/theme.css`
- Delete: `app/css/additional-styles/utility-patterns.css`

- [ ] **Step 1: Create `v2.css`**

Source the contents from three files:
1. `Jasmin Website V2/assets/site.css` (header, footer, buttons, brand — full file)
2. The `<style>` block inside `Jasmin Website V2/index.html` (hero, marquee, sobre, trajetoria, especialidades, diferenciais, depoimentos, cta, responsive)
3. The `<style>` block inside `Jasmin Website V2/blog.html` (blog hero, filters, featured, post grid, newsletter)
4. `Jasmin Website V2/assets/post.css` (post page styling)

Concatenate them into `app/css/additional-styles/v2.css` in that order. Wrap nothing in `@layer`; let plain CSS land in the base layer.

Remove the duplicate `:root` blocks (the `--cream`/`--paper` vars) — those are now expressed as `--color-*` tokens in `style.css` `@theme`. Find-and-replace within `v2.css`:

| Replace | With |
|---|---|
| `var(--cream)` | `var(--color-cream)` |
| `var(--cream-2)` | `var(--color-cream-2)` |
| `var(--paper)` | `var(--color-paper)` |
| `var(--sage)` | `var(--color-sage)` |
| `var(--sage-deep)` | `var(--color-sage-deep)` |
| `var(--sage-soft)` | `var(--color-sage-soft)` |
| `var(--terra)` | `var(--color-terra)` |
| `var(--terra-deep)` | `var(--color-terra-deep)` |
| `var(--ink)` | `var(--color-ink)` |
| `var(--line)` | `var(--color-line)` |
| `var(--line-warm)` | `var(--color-line-warm)` |
| `var(--shadow-sm)` | (keep — define once at top of v2.css if it's used; both shadow vars are in V2's :root) |
| `var(--shadow-md)` | (same — keep) |
| `var(--serif)` | `var(--font-cormorant)` |
| `var(--sans)` | `var(--font-inter)` |
| `#E6BFA6` (literal in V2 css) | `var(--color-accent-soft)` |

Keep `--shadow-sm` and `--shadow-md` definitions at the top of `v2.css` since they're CSS-only (not theme tokens):

```css
:root {
  --shadow-sm: 0 1px 2px rgba(86, 92, 77, 0.06), 0 4px 14px rgba(86, 92, 77, 0.06);
  --shadow-md: 0 2px 6px rgba(86, 92, 77, 0.06), 0 22px 50px -18px rgba(86, 92, 77, 0.22);
}
```

Drop the V2 `*{ box-sizing: border-box; }` / `html,body{ margin:0 }` / `img{ max-width:100%; display:block; }` / `a{ color:inherit }` / `button{...}` rules — Tailwind preflight already does this. Keep V2's `.container`, `.site-header`, `.nav`, `.brand*`, `.btn*`, `.hero*`, `.strip*`, `.spec*`, `#sobre`, `.sobre*`, `.trajetoria*`, `.traj*`, `#diferenciais`, `.diff*`, `#depoimentos`, `.testi*`, `.cta*`, `footer`, `.foot*`, `.section-*`, `.eyebrow`, `.credentials*`, `.lede`, `.blog-hero*`, `.filters*`, `.featured`, `.feat-*`, `.post-grid*`, `.post-card`, `.post-cover*`, `.post-body*`, `.newsletter*`, `.news-*`, all post page rules (`.post-page`, `.post-back`, `.post-meta`, `.post-title`, `.post-lede`, `.post-author`, `.post-cover-large`, `.prose-grid`, `.prose`, `.pull`, etc.).

Drop V2's `:root` palette block (now redundant; lives in `@theme`).

- [ ] **Step 2: Delete the V1 additional style files**

```bash
rm app/css/additional-styles/theme.css app/css/additional-styles/utility-patterns.css
```

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: succeeds.

- [ ] **Step 4: Dev smoke test**

```bash
pnpm dev
```

Open `http://localhost:3000`. Expected: the existing V1 components render but with V2 typography/colors. They will look broken (V1 markup, V2 CSS) — that's the in-between state. Just confirm no compile/runtime errors in console.

Stop the dev server (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add app/css/additional-styles/v2.css
git add -u app/css/additional-styles
git commit -m "refactor(theme): port V2 CSS to additional-styles/v2.css; drop V1 theme + utility-patterns"
```

---

## Task 6: Delete unused routes (`(auth)`, `atendimento`, `api/hello`)

**Files:**
- Delete: `app/(auth)/`
- Delete: `app/(default)/atendimento/`
- Delete: `app/api/hello/` (and `app/api/` if empty)

- [ ] **Step 1: Remove directories**

```bash
rm -rf "app/(auth)" "app/(default)/atendimento" "app/api/hello"
rmdir app/api 2>/dev/null || ls app/api/
```

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: succeeds. The home + blog routes still build; old `/atendimento` and `/signin` references in V1 components (`href="/atendimento"`, etc.) won't break the build — they're just dead links at runtime until those components are rewritten in later tasks.

- [ ] **Step 3: Commit**

```bash
git add -u
git commit -m "refactor: remove (auth), atendimento, and api/hello routes"
```

---

## Task 7: Delete unused components

**Files:**
- Delete: `components/soon-available.tsx`
- Delete: `components/modal-video.tsx`
- Delete: `components/page-illustration.tsx`
- Delete: `components/scroll-indicator.tsx`
- Delete: `components/spotlight.tsx`
- Delete: `components/ui/conditional-header.tsx`
- Delete: `components/ui/breadcrumbs.tsx`
- Modify: `app/layout.tsx` (swap `ConditionalHeader` for direct `Header` import)

- [ ] **Step 1: Update `app/layout.tsx` to import Header directly**

Replace:

```tsx
import ConditionalHeader from "@/components/ui/conditional-header";
```

with:

```tsx
import Header from "@/components/ui/header";
```

Replace `<ConditionalHeader />` in the JSX with `<Header />`.

- [ ] **Step 2: Delete the components**

```bash
rm components/soon-available.tsx \
   components/modal-video.tsx \
   components/page-illustration.tsx \
   components/scroll-indicator.tsx \
   components/spotlight.tsx \
   components/ui/conditional-header.tsx \
   components/ui/breadcrumbs.tsx
```

- [ ] **Step 3: Verify no stale imports**

```bash
grep -rE "(SoonAvailable|ModalVideo|PageIllustration|ScrollIndicator|Spotlight|ConditionalHeader|Breadcrumbs|scroll-indicator|spotlight|conditional-header|breadcrumbs|soon-available|modal-video|page-illustration)" --include="*.ts" --include="*.tsx" .
```

Expected: matches only inside files we're about to rewrite (workflows.tsx, features.tsx, about-doctor.tsx, testimonials.tsx use ScrollIndicator/Spotlight; (default)/page.tsx imports SoonAvailable). These get cleaned up in their rewrite tasks. The build will currently FAIL because of them.

- [ ] **Step 4: Stub out broken imports temporarily**

In `app/(default)/page.tsx`, remove the `import SoonAvailable from "@/components/soon-available";` line.

In each of `components/hero-home.tsx`, `components/about-doctor.tsx`, `components/workflows.tsx`, `components/features.tsx`, `components/testimonials.tsx`, remove `import ScrollIndicator from "@/components/scroll-indicator";` and any `<ScrollIndicator ... />` usages. Remove `import Spotlight from "@/components/spotlight";` from `components/workflows.tsx` and replace `<Spotlight ...>` with `<div ...>` (matching className).

This is a temporary cleanup so the build stays green between tasks.

- [ ] **Step 5: Build**

```bash
pnpm build
```

Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add -u
git commit -m "refactor: remove unused components (soon-available, modal-video, scroll-indicator, spotlight, breadcrumbs, conditional-header, page-illustration)"
```

---

## Task 8: Drop AOS dependency + simplify `(default)/layout.tsx`

**Files:**
- Modify: `app/(default)/layout.tsx`
- Modify: `package.json`

- [ ] **Step 1: Rewrite `app/(default)/layout.tsx`**

Replace the file with:

```tsx
import Footer from "@/components/ui/footer";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="relative flex grow flex-col">{children}</main>
      <Footer />
    </>
  );
}
```

(Drops `"use client"`, AOS init, and the `isSoonPage` footer-hiding branch.)

- [ ] **Step 2: Remove AOS from `package.json`**

Edit `package.json`. Delete these two lines:

```
"aos": "3.0.0-beta.6",
```

(from `dependencies`) and:

```
"@types/aos": "^3.0.7",
```

(from `devDependencies`).

- [ ] **Step 3: Reinstall to update lockfile**

```bash
pnpm install
```

Expected: lockfile updates, AOS removed.

- [ ] **Step 4: Verify no stray AOS imports**

```bash
grep -rE "(from \"aos\"|import AOS|data-aos)" --include="*.ts" --include="*.tsx" .
```

Expected: matches only inside `components/hero-home.tsx`, `components/cta.tsx` (V1 used `data-aos` attributes). These get removed in the hero/cta rewrites — leave for now, they're harmless string attributes.

- [ ] **Step 5: Build**

```bash
pnpm build
```

Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add app/\(default\)/layout.tsx package.json pnpm-lock.yaml
git commit -m "refactor: drop AOS dependency; simplify default layout"
```

---

## Task 9: Migrate V2 assets into `public/images/v2/`

**Files:**
- Create: `public/images/v2/logo-submark-white.png`
- Create: `public/images/v2/logo-full-tan.png`
- Create: `public/images/v2/dra-jasmin.png`
- Create: `public/images/v2/cirurgia.jpg`
- Create: `public/images/v2/icon-ouvido.png`
- Create: `public/images/v2/icon-nariz.png`
- Create: `public/images/v2/icon-garganta.png`

- [ ] **Step 1: Copy assets**

```bash
mkdir -p public/images/v2
cp "Jasmin Website V2/assets/logo-submark-white.png" public/images/v2/
cp "Jasmin Website V2/assets/logo-full-tan.png" public/images/v2/
cp "Jasmin Website V2/assets/dra-jasmin.png" public/images/v2/
cp "Jasmin Website V2/assets/cirurgia.jpg" public/images/v2/
cp "Jasmin Website V2/assets/icon-ouvido.png" public/images/v2/
cp "Jasmin Website V2/assets/icon-nariz.png" public/images/v2/
cp "Jasmin Website V2/assets/icon-garganta.png" public/images/v2/
ls public/images/v2/
```

Expected: 7 files listed.

- [ ] **Step 2: Commit**

```bash
git add public/images/v2/
git commit -m "feat(assets): import V2 logos, portrait, cirurgia photo, and otorrino icons"
```

---

## Task 10: Prune `public/images/` to only what the new site uses

**Files:**
- Delete: all of `public/images/*` except `favicon.ico` (which is actually at `public/favicon.ico`, not `public/images/`), `otorrino-icons.png`, `workflow-01.png`

- [ ] **Step 1: Move keepers, delete the rest**

```bash
cd public/images
# Keep these (referenced by V1 blog posts)
keep="otorrino-icons.png workflow-01.png"

for f in *; do
  if [ -d "$f" ]; then
    continue   # skip the v2/ subdirectory
  fi
  if ! echo "$keep" | grep -qw "$f"; then
    rm "$f"
  fi
done
ls
cd ../..
```

Expected: only `otorrino-icons.png`, `workflow-01.png`, and the `v2/` directory remain in `public/images/`.

- [ ] **Step 2: Commit**

```bash
git add -u public/images
git commit -m "chore(assets): prune unused images; keep only those referenced by V1 blog posts and V2 set"
```

---

## Task 11: Rewrite `components/ui/header.tsx` (V2 dark-sage fixed header)

**Files:**
- Modify: `components/ui/header.tsx`

- [ ] **Step 1: Replace the file**

```tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isStuck, setIsStuck] = useState(false);
  const pathname = usePathname();
  const isBlog = pathname.startsWith("/blog");

  useEffect(() => {
    const onScroll = () => setIsStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${isStuck ? " is-stuck" : ""}`}>
      <div className="container nav">
        <Link href="/" className="brand" aria-label="Dra. Jasmin Dezotti Lovisi">
          <Image
            className="brand-mark"
            src="/images/v2/logo-submark-white.png"
            alt=""
            width={64}
            height={64}
            priority
          />
          <span className="brand-text">
            <span className="brand-name">Jasmin Dezotti</span>
            <span className="brand-sub">Otorrinolaringologista</span>
          </span>
        </Link>

        <ul className="nav-links">
          <li><Link href="/#sobre">Sobre</Link></li>
          <li><Link href="/#especialidades">Especialidades</Link></li>
          <li><Link href="/#diferenciais">Diferenciais</Link></li>
          <li><Link href="/#depoimentos">Depoimentos</Link></li>
        </ul>

        <div className="nav-actions">
          <Link href="/blog" className={`nav-blog${isBlog ? " is-active" : ""}`}>Blog</Link>
          <Link href="/#agendar" className="btn btn-primary">
            Agendar
            <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: succeeds.

- [ ] **Step 3: Dev smoke test**

```bash
pnpm dev
```

Open `http://localhost:3000`. Confirm: dark-sage fixed header at top, brand mark + name on left, nav links centered, Blog + Agendar on right. Scroll down — header gets the `.is-stuck` darker variant. Click Blog — navigates to `/blog`, current "Blog" link gets underline.

Stop dev.

- [ ] **Step 4: Commit**

```bash
git add components/ui/header.tsx
git commit -m "refactor(header): rewrite with V2 dark-sage fixed nav + sticky scroll state"
```

---

## Task 12: Rewrite `components/ui/footer.tsx` (V2 4-col sage-deep)

**Files:**
- Modify: `components/ui/footer.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div>
            <Link href="/" className="foot-brand brand">
              <Image
                className="brand-mark"
                src="/images/v2/logo-submark-white.png"
                alt=""
                width={64}
                height={64}
              />
              <span className="brand-text">
                <span className="brand-name">Jasmin Lovisi</span>
                <span className="brand-sub">Otorrinolaringologista</span>
              </span>
            </Link>
            <p className="foot-blurb">
              Cuidado especializado em ouvido, nariz e garganta — para crianças e adultos no Rio de Janeiro.
            </p>
          </div>

          <div>
            <div className="foot-h">Navegar</div>
            <ul className="foot-list">
              <li><Link href="/#sobre">Sobre</Link></li>
              <li><Link href="/#especialidades">Especialidades</Link></li>
              <li><Link href="/#diferenciais">Diferenciais</Link></li>
              <li><Link href="/#depoimentos">Depoimentos</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>

          <div>
            <div className="foot-h">Contato</div>
            <ul className="foot-list">
              <li>(21) 99757-7798</li>
              {/* TODO(content): confirm email with Jasmin */}
              <li>jasmindezotti.otorrino@gmail.com</li>
              {/* TODO(content): confirm Instagram handle */}
              <li>@jasminlovisi.otorrino</li>
              {/* TODO(content): confirm clinic address */}
              <li>Botafogo, RJ</li>
            </ul>
          </div>

          <div>
            <div className="foot-h">Atendimento</div>
            <ul className="foot-list">
              <li>Seg — Sex · 09h às 19h</li>
              <li>Sábado · 09h às 13h</li>
              <li>Particular &amp; reembolso</li>
            </ul>
          </div>
        </div>

        <div className="foot-bot">
          <div>© {year} Dra. Jasmin Dezotti Lovisi · CRM 52125602-5 · RQE 60167</div>
          <div className="foot-social">
            <a href="https://instagram.com/jasminlovisi.otorrino" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.4a4 4 0 1 1-7.9 1.2 4 4 0 0 1 7.9-1.2z" />
                <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
              </svg>
            </a>
            <a href="https://wa.me/5521997577798" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.4 8.4 0 0 1-12.8 7.2L3 21l2.4-5A8.4 8.4 0 1 1 21 11.5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/ui/footer.tsx
git commit -m "refactor(footer): rewrite with V2 4-col sage-deep layout"
```

---

## Task 13: Rewrite `components/hero-home.tsx` (V2 hero, no metrics, V1 credentials)

**Files:**
- Modify: `components/hero-home.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import Image from "next/image";
import Link from "next/link";

export default function HeroHome() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <span className="eyebrow">Atendimento e Cirurgias · Rio de Janeiro</span>

          <h1 className="display">
            Dra. Jasmin
            <br />
            <em>Dezotti</em> Lovisi
          </h1>

          <div className="credentials">
            <span>Otorrinolaringologista</span>
            <span className="dot"></span>
            <span>CRM 52125602-5</span>
            <span className="dot"></span>
            <span>RQE 60167</span>
          </div>

          <p className="lede">
            Cuidado especializado em ouvido, nariz e garganta — um olhar atento,
            técnico e acolhedor para cada queixa, da criança ao adulto.
          </p>

          <div className="hero-ctas">
            <Link href="#agendar" className="btn btn-primary">
              Agendar Consulta
              <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </Link>
            <Link href="#especialidades" className="btn btn-ghost">
              Conhecer especialidades
            </Link>
          </div>
        </div>

        <div>
          <div className="portrait-wrap">
            <svg className="portrait-arc" viewBox="0 0 600 750" aria-hidden="true">
              <defs>
                <linearGradient id="arcG" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#C07A52" stopOpacity="0" />
                  <stop offset=".5" stopColor="#C07A52" stopOpacity=".7" />
                  <stop offset="1" stopColor="#C07A52" stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle cx="300" cy="375" r="290" fill="none" stroke="url(#arcG)" strokeWidth="1.4" strokeDasharray="2 6" />
              <path d="M 60 480 C 180 420, 240 520, 360 460" fill="none" stroke="#6E7563" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
              <path d="M 40 540 C 180 480, 260 580, 420 520" fill="none" stroke="#6E7563" strokeWidth="1.2" strokeLinecap="round" opacity=".5" />
              <path d="M 80 600 C 200 560, 280 640, 460 580" fill="none" stroke="#6E7563" strokeWidth="1.2" strokeLinecap="round" opacity=".3" />
              <path d="M 540 220 C 580 220, 580 280, 545 285 C 525 290, 525 270, 540 265 C 555 258, 555 242, 540 242" fill="none" stroke="#C07A52" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M 500 200 Q 510 240 500 280" fill="none" stroke="#C07A52" strokeWidth="1.2" strokeLinecap="round" opacity=".5" />
              <path d="M 480 188 Q 494 240 480 292" fill="none" stroke="#C07A52" strokeWidth="1.2" strokeLinecap="round" opacity=".3" />
            </svg>

            <div className="portrait-frame">
              <Image
                className="portrait-img"
                src="/images/v2/dra-jasmin.png"
                alt="Dra. Jasmin Dezotti Lovisi"
                width={960}
                height={1200}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

(Drops AOS `data-aos` attrs and the metrics row.)

- [ ] **Step 2: Build + dev smoke test**

```bash
pnpm build
pnpm dev
```

Open `http://localhost:3000`. Confirm: hero renders with eyebrow, big serif title with italic "Dezotti", credentials row, lede, two CTAs (Agendar Consulta + Conhecer especialidades), portrait on right with decorative arcs. Stop dev.

- [ ] **Step 3: Commit**

```bash
git add components/hero-home.tsx
git commit -m "refactor(hero): rewrite to V2 hero (display title, credentials, portrait); drop metrics"
```

---

## Task 14: Create `components/marquee.tsx` (specialty terms strip)

**Files:**
- Create: `components/marquee.tsx`

- [ ] **Step 1: Create the file**

```tsx
const TERMS = [
  "Rinologia",
  "Cirurgia nasal",
  "Cirurgia endoscópica nasossinusal",
  "Sinusite",
  "Rinossinusite crônica",
  "Rinite",
  "Desvio de septo",
  "Obstrução nasal",
  "Respiração nasal",
  "Base de crânio",
  "Otologia",
  "Audição",
  "Zumbido",
  "Dor de ouvido",
  "Infecções de ouvido",
  "Tontura",
  "Labirintite",
  "Laringologia",
  "Rouquidão",
  "Alterações da voz",
  "Garganta",
  "Amigdalite",
  "Refluxo laringofaríngeo",
  "Sono e respiração",
  "Ronco",
  "Apneia do sono",
  "Otorrino infantil",
  "Adenoide",
  "Amígdalas",
  "Respiração oral",
  "Cuidado clínico e cirúrgico",
];

export default function Marquee() {
  // Duplicate the track for a seamless loop (CSS animates the inner track).
  const items = [...TERMS, ...TERMS];
  return (
    <div className="strip" aria-hidden="true">
      <div className="strip-track">
        {items.map((term, i) => (
          <span key={i} className="strip-item">
            {term}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/marquee.tsx
git commit -m "feat(marquee): add specialty terms scrolling strip"
```

---

## Task 15: Rewrite `components/about-doctor.tsx` (V2 Sobre + Trajetória with V1 content)

**Files:**
- Modify: `components/about-doctor.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import Image from "next/image";

export default function AboutDoctor() {
  return (
    <section id="sobre">
      <div className="container">
        <div className="sobre-grid">
          <div className="sobre-image">
            <Image
              src="/images/v2/cirurgia.jpg"
              alt="Dra. Jasmin durante procedimento cirúrgico"
              width={1200}
              height={1500}
            />
            <span className="sobre-image-tag">Centro cirúrgico · Hospital Pedro Ernesto</span>
          </div>

          <div>
            <span className="section-label">Sobre a Dra. Jasmin</span>
            <h2 className="section-title">
              Medicina <em>atenta</em>, conduta serena.
            </h2>

            <p className="sobre-quote">
              Cada paciente carrega uma história — minha função é escutar com calma,
              examinar com precisão e devolver respostas que façam sentido.
            </p>

            <div className="sobre-body">
              <p>
                Médica otorrinolaringologista formada pela Faculdade Souza Marques,
                com residência médica em Otorrinolaringologia pela UERJ, no Hospital
                Universitário Pedro Ernesto — referência em ensino, assistência e
                formação clínica e cirúrgica no Rio de Janeiro.
              </p>
              <p>
                Sua trajetória combina sólida formação hospitalar com experiências
                em terapia intensiva, centro de tratamento de queimados, pesquisa
                em neuroimunologia pela UFRJ e <em>observership</em> internacional
                em Pneumologia na Cleveland Clinic, nos Estados Unidos.
              </p>
              <p>
                Com aprofundamento em anatomia cirúrgica aplicada e cursos de
                dissecção em mastoide, rinologia e base de crânio, a Dra. Jasmin
                direcionou sua subespecialização para <strong>Rinologia</strong>,
                com fellowship no HUPE/UERJ. Atua no manejo clínico e cirúrgico
                de rinossinusites, desvios septais e doenças nasossinusais, além
                de trabalhos científicos e apresentações em congressos no Brasil.
              </p>
              <p>
                Atualmente, atende no Rio de Janeiro e em Niterói, com atuação
                vinculada ao HUPE/UERJ, OTO Grupo e Pires de Melo.
              </p>
            </div>
          </div>
        </div>

        <div className="trajetoria">
          <div className="trajetoria-head">
            <div>
              <span className="section-label">Trajetória profissional</span>
              <h3>
                Formação <em>contínua</em>
                <br />
                em centros de referência.
              </h3>
            </div>
            <p>
              Da graduação à subespecialização em rinologia, uma trajetória
              construída em hospitais-escola, fellowships e estágios internacionais —
              com foco em medicina baseada em evidência e cirurgia de precisão.
            </p>
          </div>

          <div className="traj-grid">
            <div className="traj-col">
              <article className="traj-card">
                <span className="traj-tag">Graduação</span>
                <h4>Faculdade Souza Marques</h4>
                <span className="traj-sub">Doutorado em Medicina</span>
                <ul className="traj-list">
                  <li>Estágio · Centro de Tratamento de Queimados — Hospital Federal do Andaraí</li>
                  <li>Estágio em pesquisa · UFRJ — Neuroimunologia</li>
                  <li>Estágio em Terapia Intensiva · Rede D'Or</li>
                  <li><strong>Observership</strong> · Cleveland Clinic, Pneumologia (EUA)</li>
                </ul>
              </article>

              <article className="traj-card">
                <span className="traj-tag">Aprofundamentos</span>
                <h4>Cursos de dissecção</h4>
                <span className="traj-sub">Anatomia cirúrgica aplicada</span>
                <ul className="traj-list">
                  <li>Dissecção de Mastoide · UFRJ</li>
                  <li>Dissecção de Rinologia e Base de Crânio · CETEB</li>
                </ul>
              </article>
            </div>

            <div className="traj-col">
              <article className="traj-card is-feature">
                <span className="traj-tag">Residência médica</span>
                <h4>Otorrinolaringologia</h4>
                <span className="traj-sub">UERJ — Hospital Universitário Pedro Ernesto</span>
                <ul className="traj-list">
                  <li>Programa completo em clínica e cirurgia otorrinolaringológica</li>
                  <li>Atuação em hospital-escola de referência no Rio de Janeiro</li>
                </ul>
              </article>

              <article className="traj-card is-feature">
                <span className="traj-tag">Fellowship</span>
                <h4>Rinologia</h4>
                <span className="traj-sub">HUPE — UERJ</span>
                <ul className="traj-list">
                  <li>Subespecialização em cirurgia endoscópica nasossinusal</li>
                  <li>Manejo avançado de rinossinusites e desvios septais</li>
                </ul>
              </article>
            </div>

            <div className="traj-col">
              <article className="traj-card">
                <span className="traj-tag">Apresentações em congressos</span>
                <h4>Trabalhos científicos</h4>
                <span className="traj-sub">Brasil</span>
                <ul className="traj-list">
                  <li>Congresso FORL · São Paulo</li>
                  <li>Sociedade de Otorrinolaringologia · Rio de Janeiro</li>
                </ul>
              </article>

              <article className="traj-card">
                <span className="traj-tag">Experiência clínica</span>
                <h4>Atuação atual</h4>
                <span className="traj-sub">Rio de Janeiro &amp; Niterói</span>
                <ul className="traj-list">
                  <li>UERJ · Hospital Universitário Pedro Ernesto</li>
                  <li>OTO Grupo · Ipanema, Barra, Tijuca e Madureira</li>
                  <li>Pires de Melo · Niterói</li>
                </ul>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/about-doctor.tsx
git commit -m "refactor(about): V2 Sobre + Trajetória cards using V1 bio content"
```

---

## Task 16: Create `components/specialties.tsx` (3 spec cards) and delete `workflows.tsx`

**Files:**
- Create: `components/specialties.tsx`
- Delete: `components/workflows.tsx`

- [ ] **Step 1: Create `components/specialties.tsx`**

```tsx
import Image from "next/image";

export default function Specialties() {
  return (
    <section id="especialidades">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="section-label">Especialidades</span>
            <h2 className="section-title">
              Cuidado completo
              <br />
              em <em>ouvido, nariz e garganta</em>.
            </h2>
          </div>
        </div>

        <div className="spec-grid">
          <article className="spec-card">
            <span className="num">Ouvido</span>
            <Image className="spec-icon" src="/images/v2/icon-ouvido.png" alt="" width={76} height={76} />
            <h3>Otologia &amp; Audição</h3>
            <p>
              Investigação de zumbido, perda auditiva, otites de repetição e
              tonturas com avaliação audiológica precisa.
            </p>
            <ul className="spec-list">
              <li>Otoscopia digital com registro</li>
              <li>Audiometria e impedanciometria</li>
              <li>Vertigem e labirintite</li>
            </ul>
          </article>

          <article className="spec-card">
            <span className="num">Nariz</span>
            <Image className="spec-icon" src="/images/v2/icon-nariz.png" alt="" width={76} height={76} />
            <h3>Rinologia</h3>
            <p>
              Manejo de rinites, sinusites e desvios de septo com videoendoscopia
              em consultório e plano terapêutico individualizado.
            </p>
            <ul className="spec-list">
              <li>Endoscopia nasal e nasofibrolaringoscopia</li>
              <li>Rinite alérgica &amp; sinusite crônica</li>
              <li>Apneia do sono e roncopatia</li>
            </ul>
          </article>

          <article className="spec-card">
            <span className="num">Garganta</span>
            <Image className="spec-icon" src="/images/v2/icon-garganta.png" alt="" width={76} height={76} />
            <h3>Laringe &amp; Voz</h3>
            <p>
              Avaliação de rouquidão, refluxo laringofaríngeo, amigdalites
              recorrentes e cuidados com a voz profissional.
            </p>
            <ul className="spec-list">
              <li>Videolaringoscopia</li>
              <li>Disfonias e cuidados com a voz</li>
              <li>Amigdalite e faringite</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Delete workflows.tsx**

```bash
rm components/workflows.tsx
```

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: succeeds. (`page.tsx` still imports the deleted Workflows — that'll be fixed in Task 20, but `pnpm build` will FAIL until then. So actually: leave this Task 16's commit until Task 20 unifies it. To keep tasks committable independently, temporarily edit `app/(default)/page.tsx` now to drop the `import Workflows from "@/components/workflows";` and the `<Workflows />` JSX block.)

Edit `app/(default)/page.tsx`: delete `import Workflows from "@/components/workflows";` and the `<Workflows />` JSX line.

Re-run:

```bash
pnpm build
```

Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/specialties.tsx app/\(default\)/page.tsx
git rm components/workflows.tsx 2>/dev/null || true
git add -u components
git commit -m "refactor(specialties): replace Workflows with V2 3-card Specialties section"
```

---

## Task 17: Create `components/differentials.tsx` and delete `features.tsx`

**Files:**
- Create: `components/differentials.tsx`
- Delete: `components/features.tsx`

- [ ] **Step 1: Create `components/differentials.tsx`**

```tsx
import Link from "next/link";

const ITEMS = [
  {
    title: "Formação de excelência",
    sub: "Graduação na Faculdade Souza Marques; residência em Otorrinolaringologia na UERJ (HUPE), com estágio internacional na Cleveland Clinic (EUA).",
  },
  {
    title: "Especialização em rinologia",
    sub: "Fellowship em rinologia no HUPE/UERJ, com aprofundamentos em dissecção de rinologia e base de crânio (CETEB) e mastoide (UFRJ).",
  },
  {
    title: "Escuta clínica cuidadosa",
    sub: "Tempo para entender sintomas, histórico, rotina e expectativas antes de definir a conduta.",
  },
  {
    title: "Conduta individualizada",
    sub: "Plano de tratamento pensado para cada paciente, evitando soluções genéricas ou excessivas.",
  },
  {
    title: "Acompanhamento responsável",
    sub: "Continuidade do cuidado com retorno orientado e ajuste da conduta conforme evolução.",
  },
];

export default function Differentials() {
  return (
    <section id="diferenciais">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="section-label">Diferenciais</span>
            <h2 className="section-title">
              Uma consulta que <em>realmente</em> escuta.
            </h2>
          </div>
          <p className="section-intro">
            Pequenos cuidados que mudam totalmente a experiência médica — do
            agendamento ao retorno.
          </p>
        </div>

        <div className="diff-grid">
          <ul className="diff-list">
            {ITEMS.map((item, i) => (
              <li key={i}>
                <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="ttl">{item.title}</div>
                  <div className="sub">{item.sub}</div>
                </div>
                <span className="arrow-link">→</span>
              </li>
            ))}
          </ul>

          <aside className="diff-aside">
            <div className="visual">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                <circle cx="60" cy="60" r="48" strokeDasharray="3 6" />
                <circle cx="60" cy="60" r="32" />
                <path d="M60 28v64M28 60h64" />
                <circle cx="60" cy="60" r="6" fill="#E6BFA6" stroke="none" />
              </svg>
            </div>
            <h4>
              Tecnologia clínica
              <br />a serviço do diagnóstico.
            </h4>
            <p>
              Quando indicado, exames como otoscopia, endoscopia nasal e
              nasofibrolaringoscopia auxiliam uma avaliação mais precisa de
              ouvido, nariz e garganta, permitindo decisões mais seguras e bem
              explicadas ao paciente.
            </p>
            <Link href="#agendar" className="btn btn-terra">
              Agendar avaliação
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Delete features.tsx + clean up page.tsx import**

```bash
rm components/features.tsx
```

Edit `app/(default)/page.tsx`: delete `import Features from "@/components/features";` and the `<Features />` JSX line.

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/differentials.tsx app/\(default\)/page.tsx
git add -u components
git commit -m "refactor(differentials): replace Features with V2 numbered list + aside"
```

---

## Task 18: Rewrite `components/testimonials.tsx` (V2 3-card grid, no filter)

**Files:**
- Modify: `components/testimonials.tsx`

- [ ] **Step 1: Replace the file**

```tsx
const TESTIMONIALS: { feature?: boolean; quote: string; initial: string; name: string; meta: string }[] = [
  {
    feature: true,
    quote:
      "Depois de anos sofrendo com sinusite crônica, finalmente encontrei alívio. A Dra. Jasmin foi extremamente atenciosa, explicou todo o tratamento e me acompanhou em cada etapa. Hoje respiro muito melhor e minha qualidade de vida mudou completamente.",
    initial: "M",
    name: "Maria Silva",
    meta: "Rio de Janeiro · 2025",
  },
  {
    quote:
      "Excelente profissional. Tratei um problema de audição que me incomodava há anos. A doutora foi muito paciente, tirou todas as minhas dúvidas e o resultado foi além das minhas expectativas.",
    initial: "C",
    name: "Carlos Mendes",
    meta: "Rio de Janeiro · 2025",
  },
  {
    quote:
      "O atendimento foi acolhedor desde o primeiro contato. Meu filho tinha problemas recorrentes de otite e graças ao tratamento correto da Dra. Jasmin, ele está curado. Recomendo de olhos fechados.",
    initial: "A",
    name: "Ana Paula Costa",
    meta: "Rio de Janeiro · 2024",
  },
];

export default function Testimonials() {
  return (
    <section id="depoimentos">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="section-label">Depoimentos</span>
            <h2 className="section-title">
              O que dizem
              <br />
              sobre <em>a consulta</em>.
            </h2>
          </div>
          <p className="section-intro">
            Avaliações reais de pacientes — coletadas em plataformas verificadas.
          </p>
        </div>

        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <article key={i} className={`testi${t.feature ? " feature" : ""}`}>
              <div className="stars">★★★★★</div>
              <p className="testi-quote">{t.quote}</p>
              <div className="testi-author">
                <div className="testi-avatar">{t.initial}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-meta">{t.meta}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Remove unused utility**

```bash
rm utils/useMasonry.tsx
```

(`useMousePosition.tsx` was used by Spotlight, also unused — confirm and remove:)

```bash
grep -rE "useMousePosition" --include="*.ts" --include="*.tsx" .
```

If no matches, also remove:

```bash
rm utils/useMousePosition.tsx
```

If `utils/` is now empty, remove the directory.

- [ ] **Step 3: Build**

```bash
pnpm build
```

Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/testimonials.tsx
git add -u utils
git commit -m "refactor(testimonials): V2 3-card grid with V1 testimonials; drop category filter and useMasonry"
```

---

## Task 19: Rewrite `components/cta.tsx` (V2 cream "agendar" card)

**Files:**
- Modify: `components/cta.tsx`

- [ ] **Step 1: Replace the file**

```tsx
export default function Cta() {
  return (
    <section className="cta-band" id="agendar">
      <div className="container">
        <div className="cta-card">
          <div>
            <span className="section-label">Marque sua avaliação</span>
            <h3>
              Pronta para te <em>escutar</em>.
              <br />
              Hoje, com calma.
            </h3>
            <p>
              Agende sua consulta presencial — atendimento particular e por
              reembolso, com retorno orientado quando indicado.
            </p>
            <div className="cta-actions">
              <a
                href="https://wa.me/5521997577798"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Agendar pelo WhatsApp
                <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m13 5 7 7-7 7" />
                </svg>
              </a>
              {/* TODO(content): confirm Doctoralia URL */}
              <a href="#" className="btn btn-ghost">
                Doctoralia
              </a>
            </div>
          </div>
          <dl className="cta-info">
            <dt>Telefone</dt>
            <dd>(21) 99757-7798</dd>
            {/* TODO(content): confirm Instagram handle */}
            <dt>Instagram</dt>
            <dd>@jasminlovisi.otorrino</dd>
            {/* TODO(content): confirm clinic address */}
            <dt>Endereço</dt>
            <dd>Barra da Tijuca, Rio de Janeiro</dd>
          </dl>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build**

```bash
pnpm build
```

Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/cta.tsx
git commit -m "refactor(cta): V2 cream agendar card; WhatsApp link from V1"
```

---

## Task 20: Reassemble `app/(default)/page.tsx` (full home composition)

**Files:**
- Modify: `app/(default)/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import Hero from "@/components/hero-home";
import Marquee from "@/components/marquee";
import AboutDoctor from "@/components/about-doctor";
import Specialties from "@/components/specialties";
import Differentials from "@/components/differentials";
import Testimonials from "@/components/testimonials";
import Cta from "@/components/cta";
import StructuredData from "@/components/seo/structured-data";

export const metadata = {
  title: "Dra. Jasmin Dezotti Lovisi · Otorrinolaringologista no Rio de Janeiro",
  description:
    "Otorrinolaringologista especializada em rinologia, otologia e laringologia. Atendimento clínico e cirúrgico para ouvido, nariz e garganta no Rio de Janeiro. Agende pelo WhatsApp.",
  robots: "index, follow",
  alternates: { canonical: "https://jasmindezotti.com/" },
  openGraph: {
    title: "Dra. Jasmin Dezotti Lovisi · Otorrinolaringologista no Rio de Janeiro",
    description:
      "Otorrinolaringologista especializada em rinologia, otologia e laringologia. Atendimento clínico e cirúrgico no Rio de Janeiro.",
    url: "https://jasmindezotti.com/",
    siteName: "Dra. Jasmin Dezotti Lovisi",
    locale: "pt_BR",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <StructuredData />
      <Hero />
      <Marquee />
      <AboutDoctor />
      <Specialties />
      <Differentials />
      <Testimonials />
      <Cta />
    </>
  );
}
```

Note: `<Header />` is rendered by `app/layout.tsx`; `<Footer />` by `app/(default)/layout.tsx`. They're not re-imported here.

- [ ] **Step 2: Build + dev smoke test**

```bash
pnpm build
pnpm dev
```

Open `http://localhost:3000`. Walk top-to-bottom:
1. Fixed dark sage header at top
2. Hero with portrait
3. Marquee strip scrolling
4. Sobre + Trajetória cards (6 cards in 3 columns)
5. Especialidades (3 cards)
6. Diferenciais (numbered list on dark sage + aside)
7. Depoimentos (3 cards)
8. CTA cream card
9. Footer on sage-deep

Confirm: no console errors, anchor links from header scroll smoothly to each section.

Stop dev.

- [ ] **Step 3: Commit**

```bash
git add app/\(default\)/page.tsx
git commit -m "feat(home): wire V2 home composition (Hero → Marquee → Sobre → Especialidades → Diferenciais → Depoimentos → CTA)"
```

---

## Task 21: Rewrite `app/(default)/blog/page.tsx` (V2 blog index, 2 V1 posts)

**Files:**
- Modify: `app/(default)/blog/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog · Dra. Jasmin Dezotti Lovisi",
  description:
    "Artigos sobre saúde respiratória, otorrinolaringologia e bem-estar. Conteúdo escrito e revisado pela Dra. Jasmin Dezotti.",
  robots: "index, follow",
  alternates: { canonical: "https://jasmindezotti.com/blog/" },
  openGraph: {
    title: "Blog · Dra. Jasmin Dezotti Lovisi",
    description:
      "Artigos sobre saúde respiratória, otorrinolaringologia e bem-estar.",
    url: "https://jasmindezotti.com/blog/",
    siteName: "Dra. Jasmin Dezotti Lovisi",
    locale: "pt_BR",
    type: "website",
  },
};

const POSTS = [
  {
    slug: "o-que-e-otorrino",
    title: "O que é Otorrinolaringologia?",
    subtitle:
      "Entenda o que faz um otorrinolaringologista e quando procurar este especialista.",
    category: "Saúde",
    readingTime: "8 min",
    cover: "/images/otorrino-icons.png",
  },
  {
    slug: "cuidados-com-rinite-alergica",
    title: "Cuidados Essenciais com Rinite Alérgica",
    subtitle:
      "Sintomas, causas e como controlar a rinite alérgica no dia a dia.",
    category: "Rinologia",
    readingTime: "6 min",
    cover: "/images/workflow-01.png",
  },
];

export default function Blog() {
  return (
    <>
      <section className="blog-hero">
        <div className="container blog-hero-grid">
          <div>
            <span className="eyebrow">Diário clínico</span>
            <h1>
              Conhecimento
              <br />
              que <em>cuida</em>.
            </h1>
            <p className="lede">
              Artigos para entender — sem jargão — o que acontece com o ouvido,
              o nariz e a garganta. Conteúdo escrito e revisado pela Dra. Jasmin.
            </p>
          </div>
        </div>
      </section>

      <section className="post-grid-wrap">
        <div className="container">
          <div className="post-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
            {POSTS.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="post-card article">
                <div className="post-cover">
                  <span className="tag">Artigo</span>
                  <Image
                    src={p.cover}
                    alt=""
                    width={800}
                    height={500}
                    style={{ objectFit: "contain", width: "100%", height: "100%" }}
                  />
                </div>
                <div className="post-body">
                  <div className="meta">
                    <span>{p.category}</span>
                    <span className="dot"></span>
                    <span>{p.readingTime}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.subtitle}</p>
                  <span className="read">Ler →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Build + dev smoke test**

```bash
pnpm build
pnpm dev
```

Open `http://localhost:3000/blog`. Expected: blog hero with serif "Conhecimento que cuida", 2 cards below in a 2-col grid.

Stop dev.

- [ ] **Step 3: Commit**

```bash
git add app/\(default\)/blog/page.tsx
git commit -m "refactor(blog): V2 index with 2 V1 posts; drop filters and featured card"
```

---

## Task 22: Rewrite `app/(default)/blog/[slug]/page.tsx` (V2 post template + V1 content)

**Files:**
- Modify: `app/(default)/blog/[slug]/page.tsx`

- [ ] **Step 1: Read the existing V1 post content**

The current file contains a `blogPostsData` Record with full HTML content for two slugs. Preserve that content map (the `content` HTML strings, `title`, `subtitle`, `category`, `date`, `author`, `image` fields) — just re-render it with V2 markup.

- [ ] **Step 2: Replace the file**

```tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Post = {
  title: string;
  subtitle: string;
  category: string;
  date: string;
  readingTime: string;
  author: string;
  cover: string;
  content: string; // HTML
};

const POSTS: Record<string, Post> = {
  "o-que-e-otorrino": {
    title: "O que é Otorrinolaringologia?",
    subtitle:
      "Entenda o que faz um otorrinolaringologista, as doenças mais comuns e quando procurar este especialista.",
    category: "Saúde",
    date: "20 de Novembro, 2024",
    readingTime: "8 min de leitura",
    author: "Dra. Jasmin Dezotti Lovisi",
    cover: "/images/otorrino-icons.png",
    content: `__O_QUE_E_OTORRINO_HTML__`,
  },
  "cuidados-com-rinite-alergica": {
    title: "Cuidados Essenciais com Rinite Alérgica",
    subtitle:
      "Entenda os sintomas, causas e como controlar a rinite alérgica no dia a dia.",
    category: "Rinologia",
    date: "15 de Novembro, 2024",
    readingTime: "6 min de leitura",
    author: "Dra. Jasmin Dezotti Lovisi",
    cover: "/images/workflow-01.png",
    content: `__CUIDADOS_COM_RINITE_ALERGICA_HTML__`,
  },
};

export function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return {};
  const url = `https://jasmindezotti.com/blog/${slug}/`;
  return {
    title: `${post.title} · Blog · Dra. Jasmin Dezotti Lovisi`,
    description: post.subtitle,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.subtitle,
      url,
      siteName: "Dra. Jasmin Dezotti Lovisi",
      locale: "pt_BR",
      type: "article",
    },
  };
}

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  return (
    <article className="post-page">
      <div className="container">
        <Link href="/blog" className="post-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Voltar para o blog
        </Link>
      </div>

      <section className="post-hero">
        <div className="container">
          <div className="post-meta">
            <span className="pill">Artigo</span>
            <span>{post.category}</span>
            <span className="dot"></span>
            <span>{post.readingTime}</span>
            <span className="dot"></span>
            <span>{post.date}</span>
          </div>
          <h1 className="post-title">{post.title}</h1>
          <p className="post-lede">{post.subtitle}</p>
          <div className="post-author">
            <div className="ava" aria-hidden="true"></div>
            <div className="who">
              <span className="name">{post.author}</span>
              <small>Otorrinolaringologista · CRM 52125602-5</small>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="post-cover-large">
          <Image
            src={post.cover}
            alt=""
            width={1200}
            height={600}
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
          />
        </div>
      </div>

      <div className="container">
        <div className="prose-grid">
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Inline the actual HTML content**

Replace `__O_QUE_E_OTORRINO_HTML__` and `__CUIDADOS_COM_RINITE_ALERGICA_HTML__` with the actual content strings from the existing `blogPostsData` map in the file you replaced. Open the current `[slug]/page.tsx` BEFORE this task (you can view it from git via `git show HEAD~N:app/(default)/blog/[slug]/page.tsx` if needed) and copy the full `content` template-literal strings for both slugs verbatim. Paste them in place of the placeholder tokens, keeping the backticks.

- [ ] **Step 4: Build + dev smoke test**

```bash
pnpm build
pnpm dev
```

Open both:
- `http://localhost:3000/blog/o-que-e-otorrino`
- `http://localhost:3000/blog/cuidados-com-rinite-alergica`

Expected: each renders with V2 post styling (post-hero with title + lede + meta, prose body with V1 article content), "Voltar para o blog" link at top. Also try `http://localhost:3000/blog/nope` — should 404.

Stop dev.

- [ ] **Step 5: Commit**

```bash
git add "app/(default)/blog/[slug]/page.tsx"
git commit -m "refactor(blog/post): V2 post template using V1 article HTML content"
```

---

## Task 23: Final verification

**Files:** none

- [ ] **Step 1: Confirm no stale references**

```bash
grep -rE "(/atendimento|/signin|/signup|/reset-password|api/hello|nacelle|SoonAvailable|Spotlight|Workflows|Features|ScrollIndicator|Breadcrumbs|ConditionalHeader|useMasonry|useMousePosition|@/components/scroll-indicator|@/components/spotlight|@/components/workflows|@/components/features|@/components/soon-available|@/components/modal-video|@/components/page-illustration|@/components/ui/conditional-header|@/components/ui/breadcrumbs)" --include="*.ts" --include="*.tsx" --include="*.css" .
```

Expected: no matches. If anything appears, hunt it down and remove.

- [ ] **Step 2: Type-check + lint**

```bash
pnpm build
pnpm lint
```

Expected: both clean.

- [ ] **Step 3: Dev server walkthrough**

```bash
pnpm dev
```

Walk these routes:
- `/` — full home, header anchors all jump correctly
- `/blog` — 2 cards
- `/blog/o-que-e-otorrino` — full post
- `/blog/cuidados-com-rinite-alergica` — full post
- `/atendimento` — 404
- `/signin` — 404
- `/api/hello` — 404

Resize browser to 375px width — confirm header (brand + Agendar) remains, sections stack vertically, no horizontal scroll.

Check the browser devtools Network tab on `/` and confirm `Cormorant Garamond` woff2 files load from `fonts.gstatic.com`.

Stop dev.

- [ ] **Step 4: Production smoke test**

```bash
pnpm start &
sleep 5
curl -sI http://localhost:3000/ | head -5
curl -sI http://localhost:3000/blog/ | head -5
curl -sI http://localhost:3000/blog/o-que-e-otorrino | head -5
# Stop the prod server
kill %1
```

Expected: all return `200 OK` with the security headers from `next.config.js`.

- [ ] **Step 5: Inventory diff**

```bash
git status
git log --oneline main..HEAD
```

Expected: clean tree; sensible commit history (~17 commits, one per task).

- [ ] **Step 6: Open PR-ready state**

You can either:
- Push and open a PR: `git push -u origin refactor/jasmin-v2 && gh pr create --title "Refactor: adopt V2 design system, simplify routes to home + blog" --body "$(cat docs/superpowers/specs/2026-05-24-jasmin-v2-refactor-design.md | head -40)"`
- Or merge locally if Iago prefers: `git checkout main && git merge --no-ff refactor/jasmin-v2`

Recommend: open the PR so Iago can preview deploy diffs before merging.

---

## Self-review

- **Spec coverage:**
  - §2 Delete list → Tasks 3, 6, 7, 8, 10 ✓
  - §3 Typography → Tasks 2, 3 ✓
  - §4 Asset migration → Tasks 9, 10 ✓
  - §5 Routes → Tasks 20, 21, 22 ✓
  - §6 Content mapping → Tasks 13, 15, 16, 17, 18, 19, 22 ✓
  - §7 Open content gaps → addressed as inline `TODO(content)` comments in Tasks 12 and 19 ✓
  - Header sticky behavior → Task 11 (useEffect scroll listener for `.is-stuck`) ✓
  - Marquee → Task 14 ✓
  - Token replacement → Tasks 4, 5 ✓
- **Placeholder scan:** Tasks 22 Step 3 references `__O_QUE_E_OTORRINO_HTML__` and `__CUIDADOS_COM_RINITE_ALERGICA_HTML__` placeholders intentionally — Step 3 of that task explicitly tells the engineer to copy the literal content strings from the pre-refactor file. Acceptable because the source location and method are fully specified.
- **Type consistency:** Component names (`Hero`, `Marquee`, `AboutDoctor`, `Specialties`, `Differentials`, `Testimonials`, `Cta`, `Header`, `Footer`) used consistently in Task 20's page composition matching their export defaults in Tasks 11–19.
- **Risk:** Task 5 (V2 CSS port) is the longest, most fiddly task — touch the most files and could easily introduce subtle visual breaks. Mitigation: built-in dev smoke test at the end of Task 5; component rewrites in Tasks 11–22 will surface any missing CSS rules.

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-24-jasmin-v2-refactor.md`.

Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for plans with many steps and verification gates.
2. **Inline Execution** — execute tasks in this session using `superpowers:executing-plans`, batch execution with checkpoints for review.

Which approach?
