# Template Know-How: Open React Template

## Overview

This document serves as a comprehensive guide for understanding the technical architecture, patterns, and development guidelines for the **Open React Template** - a modern landing page template built for scalability and maintainability.

---

## Technical Stack

### Core Framework

- **Next.js 15.1.6** - App Router with React Server Components
- **React 19.0.0** - Latest React version with modern features
- **TypeScript 5.7.3** - Strict type checking enabled

### Styling & UI

- **Tailwind CSS 4.0.3** - Utility-first CSS framework with custom theme
- **@tailwindcss/postcss 4.0.3** - PostCSS integration
- **@tailwindcss/forms 0.5.10** - Form styling utilities

### UI Components & Utilities

- **@headlessui/react 2.2.0** - Unstyled, accessible UI components
- **AOS 3.0.0-beta.6** - Animate On Scroll library
- **next/font** - Optimized font loading (Inter + custom Nacelle fonts)

### Build Tools

- **Turbopack** - Next.js's faster bundler (enabled by default in dev)
- **PostCSS** - CSS transformation pipeline

### Package Manager

- **pnpm** - Fast, disk space efficient package manager (recommended)

---

## Project Architecture

### Directory Structure

```
open-react-template/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (layout isolation)
│   │   ├── layout.tsx           # Auth-specific layout
│   │   ├── signin/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (default)/               # Default route group
│   │   ├── layout.tsx           # Main layout with AOS initialization
│   │   └── page.tsx             # Home page
│   ├── api/                     # API routes
│   │   └── hello/route.ts
│   ├── css/                     # Global styles
│   │   ├── style.css            # Main stylesheet
│   │   └── additional-styles/
│   │       ├── theme.css        # Theme tokens & animations
│   │       └── utility-patterns.css  # Reusable UI patterns
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── logo.tsx
│   ├── hero-home.tsx            # Landing sections
│   ├── features.tsx
│   ├── workflows.tsx
│   ├── testimonials.tsx
│   ├── cta.tsx
│   ├── modal-video.tsx
│   ├── page-illustration.tsx
│   └── spotlight.tsx
├── utils/                       # Utility functions & hooks
│   ├── useMasonry.tsx          # Masonry layout hook
│   └── useMousePosition.tsx     # Mouse tracking hook
├── public/                      # Static assets
│   ├── fonts/                   # Custom font files (Nacelle)
│   ├── images/                  # SVG, PNG, JPG assets
│   └── videos/
└── [config files]
```

### Route Groups Pattern

The template uses **Next.js Route Groups** for layout isolation:

1. **(auth)** - Authentication pages with minimal layout (no footer)
2. **(default)** - Main pages with full layout (header + footer + AOS)

**Key Benefit**: Different layouts without affecting URL structure.

---

## Design Patterns & Conventions

### 1. Component Patterns

#### A. Server Components by Default

```typescript
// Default: Server Component (no "use client")
export default function Features() {
  return <section>...</section>
}
```

#### B. Client Components When Needed

```typescript
// Only add "use client" when using hooks or interactivity
"use client";
import { useState } from "react";

export default function Header() {
  // Uses client-side logic
}
```

**When to use "use client":**

- `useState`, `useEffect`, or any React hooks
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs
- Third-party libraries requiring client context

#### C. Page Metadata Pattern

```typescript
export const metadata = {
  title: "Page Title - Open PRO",
  description: "Page description",
};

export default function Page() {
  return <section>...</section>
}
```

### 2. Styling Patterns

#### A. Utility-First with Tailwind

```tsx
<div className="mx-auto max-w-6xl px-4 sm:px-6">
  <h1 className="font-nacelle text-4xl font-semibold md:text-5xl">
    Title
  </h1>
</div>
```

#### B. Centralized UI Patterns

Reusable patterns defined in `utility-patterns.css`:

- `.btn` / `.btn-sm` - Button variants
- `.form-input`, `.form-textarea`, etc. - Form controls

**Usage:**

```tsx
<button className="btn bg-linear-to-t from-indigo-600 to-indigo-500">
  Click Me
</button>
```

#### C. Custom Theme Tokens

Defined in `style.css` using `@theme`:

- Custom fonts: `--font-inter`, `--font-nacelle`
- Typography scale with line-heights and letter-spacing
- Custom animations: `--animate-shine`, `--animate-gradient`

#### D. Advanced Gradient & Border Effects

Common pattern for glassmorphic borders:

```tsx
className="before:absolute before:inset-0 before:rounded-[inherit] 
  before:border before:border-transparent 
  before:[background:linear-gradient(...)_border-box] 
  before:[mask-composite:exclude_!important] 
  before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]"
```

**Purpose**: Creates sophisticated border gradients with transparency.

### 3. Animation Patterns

#### AOS (Animate On Scroll) Integration

Initialized in `(default)/layout.tsx`:

```typescript
useEffect(() => {
  AOS.init({
    once: true,              // Animation happens only once
    disable: "phone",        // Disabled on mobile for performance
    duration: 600,
    easing: "ease-out-sine",
  });
});
```

**Usage in components:**

```tsx
<div data-aos="fade-up" data-aos-delay={200}>
  Content
</div>
```

### 4. Image Handling

#### Optimized Images

```typescript
import Image from "next/image";
import HeroImage from "@/public/images/hero-image-01.jpg";

<Image
  src={HeroImage}
  width={1104}
  height={576}
  priority              // For above-the-fold images
  alt="Descriptive text"
/>
```

### 5. Custom Hooks Pattern

#### Example: useMasonry Hook

```typescript
const masonryContainer = useMasonry();

return (
  <div ref={masonryContainer} className="grid">
    {items.map(item => <div key={item.id}>{item}</div>)}
  </div>
);
```

**Purpose**: Encapsulates complex layout logic into reusable hooks.

---

## Configuration Files

### TypeScript Configuration

- **Strict mode enabled** for type safety
- **Path aliases**: `@/*` maps to root directory
- **Target**: ES5 for broad compatibility

### Next.js Configuration

- Minimal configuration (uses defaults)
- Turbopack enabled in dev mode

### PostCSS/Tailwind Setup

- Uses `@tailwindcss/postcss` plugin
- Custom theme layer in `style.css`
- Form plugin with base strategy

---

## Styling System Deep Dive

### Color Palette

Primary colors (from patterns):

- **Indigo**: Primary brand color (`indigo-500`, `indigo-600`)
- **Gray**: Dark theme base (`gray-900`, `gray-950` for backgrounds)
- **Text**: `gray-200` for primary text, `indigo-200/65` for muted text

### Typography

- **Primary Font**: Inter (Google Font) - Body text
- **Display Font**: Nacelle (Local font) - Headings
- **Scale**: Custom defined in theme (xs to 7xl)

### Spacing & Layout

- **Max Width**: `max-w-6xl` for content containers
- **Padding**: `px-4 sm:px-6` for responsive horizontal padding
- **Vertical**: `py-12 md:py-20` for section spacing

### Responsive Breakpoints

Follows Tailwind defaults:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## Development Guidelines

### 1. Code Quality Principles

#### Keep It Simple

- ✅ Use existing patterns before creating new ones
- ✅ Prefer composition over complex abstractions
- ✅ Single Responsibility Principle for components
- ❌ Avoid premature optimization
- ❌ Don't create unnecessary abstractions

#### Maintainability First

```typescript
// ✅ Good: Clear, maintainable
export default function Hero() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1>Title</h1>
      </div>
    </section>
  );
}

// ❌ Avoid: Over-engineered
const withContainer = (Component) => (props) => (
  <div className="mx-auto max-w-6xl px-4 sm:px-6">
    <Component {...props} />
  </div>
);
```

### 2. UI Development Best Practices

#### Consistency

- **Always** use centralized utility classes (`.btn`, `.form-input`)
- **Follow** existing spacing patterns (`py-12 md:py-20`)
- **Match** color schemes from existing components
- **Reuse** animation patterns and timing

#### Accessibility

- Include `aria-label` for icon buttons
- Use semantic HTML (`<nav>`, `<section>`, `<article>`)
- Maintain focus styles
- Provide `alt` text for images

#### Performance

- Use `priority` prop for above-the-fold images
- Lazy load components when appropriate
- Keep client-side JavaScript minimal
- Disable AOS on mobile devices (already configured)

### 3. Component Development Pattern

**Before creating a new component:**

1. Check if similar component exists
2. Consider if it's truly reusable (use in 3+ places?)
3. Review if existing component can be extended

**When creating components:**

```typescript
// 1. Define clear props interface
interface ComponentProps {
  title: string;
  description?: string;
  variant?: "primary" | "secondary";
}

// 2. Use TypeScript for type safety
export default function Component({ 
  title, 
  description,
  variant = "primary" 
}: ComponentProps) {
  // 3. Keep logic minimal and clear
  return (
    <div className="...">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
```

### 4. Styling Guidelines

#### Centralized Configuration

```css
/* ✅ Add reusable patterns to utility-patterns.css */
.custom-input {
    @apply rounded-lg px-4 py-2.5 border border-gray-700;
}

/* ❌ Avoid inline styles or scattered custom CSS */
```

#### Tailwind Usage

```tsx
// ✅ Good: Readable, maintainable
<div className="mx-auto max-w-6xl px-4 sm:px-6">
  <button className="btn w-full bg-indigo-600 hover:bg-indigo-500">
    Submit
  </button>
</div>

// ❌ Avoid: Overly complex inline
<div style={{ 
  maxWidth: "1280px", 
  margin: "0 auto",
  padding: "0 24px" 
}}>
  <button style={{ 
    background: "linear-gradient(...)" 
  }}>
    Submit
  </button>
</div>
```

### 5. Change Management

#### Prefer Small, Focused Changes

- ✅ One feature/fix per change
- ✅ Update only necessary files
- ✅ Test changes locally
- ❌ Avoid massive refactors without necessity
- ❌ Don't change working code "just because"

#### Review Checklist

Before committing changes:

- [ ] Does it follow existing patterns?
- [ ] Is it the simplest solution?
- [ ] Does it maintain type safety?
- [ ] Is it responsive (mobile/tablet/desktop)?
- [ ] Does it match the existing color scheme?
- [ ] Are animations smooth and purposeful?
- [ ] Is accessibility maintained?
- [ ] Did you test in the browser?

### 6. Future Scalability

#### When to Extract Components

Extract when:

- Used in 3+ places
- Complex logic (50+ lines)
- Clear single responsibility
- Independently testable

Keep inline when:

- Used once or twice
- Simple markup (<20 lines)
- Tightly coupled to parent

#### File Organization

```
components/
├── ui/              # Generic, highly reusable
│   ├── button.tsx
│   ├── input.tsx
│   └── modal.tsx
├── sections/        # Page-specific sections (consider creating)
│   ├── hero-home.tsx
│   └── features.tsx
└── layout/          # Layout components (consider creating)
    ├── header.tsx
    └── footer.tsx
```

**Note**: Current structure is flat - only reorganize if component count exceeds 20+.

---

## Common Patterns Reference

### Landing Section Pattern

```typescript
export default function Section() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="pb-12 text-center md:pb-20">
            <h2 className="font-nacelle text-3xl font-semibold md:text-4xl">
              Title
            </h2>
            <p className="text-xl text-indigo-200/65">
              Description
            </p>
          </div>
          
          {/* Section content */}
          <div>
            {/* Content here */}
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Modal Pattern (Using Headless UI)

```typescript
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

const [open, setOpen] = useState(false);

<Dialog open={open} onClose={() => setOpen(false)}>
  <DialogBackdrop className="fixed inset-0 bg-black/70" />
  <DialogPanel>
    {/* Modal content */}
  </DialogPanel>
</Dialog>
```

### Gradient Text Pattern

```tsx
<h1 className="animate-[gradient_6s_linear_infinite] 
  bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] 
  bg-[length:200%_auto] 
  bg-clip-text 
  text-transparent 
  font-nacelle text-4xl font-semibold">
  Animated Gradient Text
</h1>
```

---

## Working with This Template

### Adding a New Page

1. **Create page file** in appropriate route group:

   ```typescript
   // app/(default)/about/page.tsx
   export const metadata = {
     title: "About - Open PRO",
     description: "About us page",
   };
   
   export default function About() {
     return <section>About content</section>
   }
   ```

2. **Link to it** using Next.js Link:

   ```tsx
   import Link from "next/link";
   <Link href="/about">About</Link>
   ```

### Adding a New Component

1. **Create component file** in `components/`:

   ```typescript
   // components/pricing.tsx
   export default function Pricing() {
     return (
       <section>
         {/* Pricing content */}
       </section>
     );
   }
   ```

2. **Import and use**:

   ```typescript
   import Pricing from "@/components/pricing";
   ```

### Modifying Styles

1. **For global patterns**: Edit `app/css/additional-styles/utility-patterns.css`
2. **For theme tokens**: Edit `app/css/style.css` in `@theme` block
3. **For component-specific**: Use Tailwind utilities inline

### Adding Assets

- **Images**: Place in `public/images/`
- **Fonts**: Place in `public/fonts/` + configure in `app/layout.tsx`
- **Videos**: Place in `public/videos/`

Import path: `@/public/images/filename.jpg`

---

## Agentic Coding Guidelines

### Context for AI Assistants

When working with this codebase:

1. **Follow Existing Patterns**: This template has well-established patterns. Always review similar components before creating new ones.

2. **Type Safety**: TypeScript is strictly enabled. Always provide proper types.

3. **Server vs Client**: Default to Server Components. Only use "use client" when absolutely necessary.

4. **Styling**: Use Tailwind utilities and existing CSS patterns. Avoid creating custom CSS unless adding to centralized files.

5. **Responsiveness**: All changes must be mobile-first and responsive.

6. **Simplicity Over Cleverness**: Clear, maintainable code > clever abstractions.

7. **Incremental Changes**: Make focused changes. Don't refactor unnecessarily.

### AI Assistant Prompt Template

```
When making changes to this template:
- Prioritize simplicity and maintainability
- Follow existing component and styling patterns
- Use TypeScript with proper types
- Default to Server Components unless hooks/interactivity needed
- Maintain responsive design (mobile-first)
- Keep UI consistent with existing color/spacing/typography
- Review changes before finalizing
- Don't over-engineer solutions
```

---

## Troubleshooting

### Common Issues

1. **Missing Dependencies**

   ```bash
   pnpm install
   ```

2. **Port Already in Use**

   ```bash
   # Find and kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

3. **Type Errors**
   - Check `tsconfig.json` paths
   - Verify all imports use proper types
   - Run `pnpm build` to see all type errors

4. **Styling Not Applying**
   - Clear Next.js cache: `rm -rf .next`
   - Verify Tailwind class names are correct
   - Check for typos in custom CSS classes

---

## Resources

- **Next.js Docs**: <https://nextjs.org/docs>
- **Tailwind CSS v4**: <https://tailwindcss.com/docs/v4-beta>
- **React 19**: <https://react.dev/>
- **Headless UI**: <https://headlessui.com/>
- **AOS Library**: <https://michalsnik.github.io/aos/>

---

## Summary

This template is built for:

- ✅ **Simplicity**: Clear patterns, minimal abstraction
- ✅ **Performance**: Server Components, optimized fonts/images, Turbopack
- ✅ **Maintainability**: TypeScript, centralized styles, consistent patterns
- ✅ **Scalability**: Modular components, route groups, clear organization
- ✅ **Modern Stack**: Latest Next.js, React, and Tailwind features

**Golden Rule**: When in doubt, follow existing patterns. Simple and consistent beats clever and complex.

---

*Last Updated: November 2025*
*Template Version: Based on Next.js 15.1.6, React 19, Tailwind CSS 4*
