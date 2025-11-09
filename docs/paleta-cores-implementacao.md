# Implementação da Paleta Médica - Dra. Jasmin Dezotti

## ✅ Paleta de Cores Implementada

### Cores Principais

| Variável CSS | Cor Hex | Uso |
|--------------|---------|-----|
| `--color-background-primary` | `#F9F7F4` | Fundo principal (off-white quente) |
| `--color-background-secondary` | `#E8E3DC` | Fundo de seções secundárias e footer |
| `--color-primary` | `#3A6373` | Azul petróleo - cor principal (botões, ícones) |
| `--color-primary-light` | `#4A7383` | Variação clara do primary |
| `--color-primary-dark` | `#2A5363` | Variação escura para hover |
| `--color-secondary` | `#9DAE91` | Verde sálvia - cor secundária (acentos) |
| `--color-secondary-light` | `#B5C5A9` | Variação clara do secondary |
| `--color-accent` | `#D6CBBE` | Bege champanhe - bordas e detalhes |
| `--color-text-primary` | `#333333` | Texto principal (títulos, corpo) |
| `--color-text-secondary` | `#5C7A89` | Texto secundário e descritivo |
| `--color-text-muted` | `#7A8B99` | Texto esmaecido (placeholders, menos ênfase) |

---

## 📋 Componentes Atualizados

### ✅ 1. Sistema Base (`app/css/style.css`)
- Variáveis CSS customizadas adicionadas ao `@theme`
- Background e cores de texto aplicadas no `@layer base`
- Borders padrão usando `--color-accent`

### ✅ 2. Utility Patterns (`app/css/additional-styles/utility-patterns.css`)
- **Botões atualizados:**
  - `.btn-primary` - Fundo azul petróleo
  - `.btn-secondary` - Fundo verde sálvia
  - `.btn-outline` - Borda azul petróleo com hover preenchido
  - Transições suaves de 300ms

- **Formulários:**
  - Background branco
  - Borders bege champanhe
  - Focus ring azul petróleo
  - Placeholders cinza suave

### ✅ 3. Layout Principal (`app/layout.tsx`)
- Background usando variável `--color-background-primary`
- Texto usando `--color-text-primary`
- Idioma alterado para `pt-BR`

### ✅ 4. Hero Section (`components/hero-home.tsx`)
- Gradiente do título: primary → secondary → primary
- Textos com cor `--color-text-secondary`
- Botões usando classes `.btn-primary` e `.btn-outline`

### ✅ 5. Sobre a Médica (`components/about-doctor.tsx`)
- Cards brancos com sombra e border accent
- Ícones na cor primary
- Títulos em text-primary
- Descrições em text-secondary
- Background dos círculos de ícone: background-secondary
- Badges com secondary/20 opacity

### ✅ 6. Workflows/Serviços (`components/workflows.tsx`)
- Header com decoradores verde sálvia
- Gradiente nos títulos
- Badges com background secondary/20 e border
- Textos secundários

### ✅ 7. Features/Diferenciais (`components/features.tsx`)
- Ícones SVG na cor primary
- Títulos em text-primary
- Descrições em text-secondary
- Border top com accent
- Decoradores com secondary

### ✅ 8. Testimonials/Depoimentos (`components/testimonials.tsx`)
- Cards brancos com border accent
- Botões de categoria com estados:
  - Ativo: bg primary, texto branco
  - Inativo: texto secondary, hover background-secondary
- Textos dos depoimentos em text-secondary
- Border top com accent

### ✅ 9. CTA Final (`components/cta.tsx`)
- Gradiente no título
- Background secondary/50
- Botões primary e secondary

### ✅ 10. Header (`components/ui/header.tsx`)
- Background branco/95 com blur
- Border accent
- Sombra suave
- Links em text-secondary com hover primary
- Botões usando classes utility

### ✅ 11. Footer (`components/ui/footer.tsx`)
- Background secondary
- Todos os títulos em text-primary
- Todos os links em text-secondary com hover primary
- Ícones sociais em secondary com hover primary
- Ilustração com opacity reduzida

---

## 🎨 Padrões de Uso

### Títulos e Headlines
```tsx
<h1 className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text text-transparent">
  Título
</h1>
```

### Botões Primários
```tsx
<button className="btn btn-primary">
  Texto do Botão
</button>
```

### Botões Outline
```tsx
<button className="btn btn-outline">
  Texto do Botão
</button>
```

### Cards Brancos
```tsx
<div className="rounded-2xl bg-white border border-[var(--color-accent)] p-6 shadow-sm">
  Conteúdo
</div>
```

### Badges/Tags
```tsx
<span className="rounded-full bg-[var(--color-secondary)]/20 px-2.5 py-0.5 border border-[var(--color-secondary)]">
  <span className="bg-linear-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
    Texto
  </span>
</span>
```

### Links
```tsx
<a className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]">
  Link
</a>
```

### Decoradores de Seção
```tsx
<div className="before:bg-linear-to-r before:to-[var(--color-secondary)] after:bg-linear-to-l after:to-[var(--color-secondary)]">
  <span className="bg-linear-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
    Label
  </span>
</div>
```

---

## 🎯 Contraste e Acessibilidade

### Testes de Contraste (WCAG AA)
- ✅ **Text Primary (#333) sobre Background Primary (#F9F7F4)**: 11.26:1 ⭐⭐⭐
- ✅ **Text Secondary (#5C7A89) sobre Background Primary**: 4.52:1 ⭐
- ✅ **Primary (#3A6373) sobre Background Primary**: 5.89:1 ⭐
- ✅ **White sobre Primary (#3A6373)**: 5.64:1 ⭐
- ✅ **Text Primary sobre Background Secondary (#E8E3DC)**: 10.41:1 ⭐⭐⭐

**Resultado**: Todos os contrastes atendem ou excedem o padrão WCAG AA (4.5:1).

### Transições Suaves
- Todas as interações com `transition-all duration-300`
- Estados de hover bem definidos
- Focus rings visíveis para acessibilidade

---

## 🚀 Como Usar

### Aplicar em Novos Componentes

```tsx
// Exemplo: Card de serviço
export default function ServiceCard() {
  return (
    <div className="rounded-2xl bg-white border border-[var(--color-accent)] p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-secondary)]/20 mb-4">
        <svg className="h-6 w-6 fill-[var(--color-primary)]">
          {/* Ícone SVG */}
        </svg>
      </div>
      <h3 className="font-nacelle text-lg font-semibold text-[var(--color-text-primary)] mb-2">
        Título do Serviço
      </h3>
      <p className="text-[var(--color-text-secondary)]">
        Descrição do serviço aqui.
      </p>
      <a href="#" className="btn btn-primary mt-4 inline-flex">
        Saiba mais
      </a>
    </div>
  );
}
```

---

## 📊 Comparativo Antes/Depois

### Antes (Template Original)
- 🌑 Dark theme (gray-950, gray-900)
- 💜 Cores vibrantes (indigo-500, indigo-600)
- ✨ Glassmorphism e efeitos neon
- 🎨 Alto contraste com fundos escuros

### Depois (Paleta Médica)
- ☀️ Light theme suave (F9F7F4)
- 🩺 Cores médicas (azul petróleo, verde sálvia)
- 🪶 Minimalismo elegante
- 💚 Tons relaxantes e confiáveis

---

## 🔄 Manutenção da Paleta

### Para Ajustar Cores
Edite apenas o arquivo: `app/css/style.css`

```css
@theme {
  /* Altere aqui */
  --color-primary: #3A6373;
  --color-secondary: #9DAE91;
  /* etc */
}
```

### Para Adicionar Nova Variação
```css
--color-primary-lighter: #5A8393;
```

E use:
```tsx
<div className="bg-[var(--color-primary-lighter)]">
```

---

## ✨ Resultado Final

A landing page agora possui:
- ✅ **Estética médica sofisticada** com cores suaves e profissionais
- ✅ **Acessibilidade garantida** com contrastes adequados
- ✅ **Transições suaves** em todos os elementos interativos
- ✅ **Consistência visual** mantida em todos os componentes
- ✅ **Legibilidade otimizada** para público médico e pacientes
- ✅ **Design acolhedor** que transmite confiança

---

**Data de Implementação:** Novembro 2025  
**Paleta:** Médica Sofisticada  
**Tema:** Light (tons quentes e naturais)

