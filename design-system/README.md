# 🎨 Design System - AbraCann

Sistema de design unificado para a plataforma medicinal AbraCann, incluindo tokens, componentes reutilizáveis e guias de padrões.

---

## 📋 Índice

1. [Tokens](#tokens)
2. [Componentes](#componentes)
3. [Padrões](#padrões)
4. [Acessibilidade](#acessibilidade)

---

## 🎨 Tokens

### Cores

**Paleta Principal**
```json
{
  "off-white": "#FAFAF8",
  "verde-oliva": "#6B7C59",
  "verde-claro": "#A8C686",
  "dourado": "#D4A574"
}
```

**Paleta Neutra**
```json
{
  "cinza-escuro": "#2D2D2D",
  "cinza-medio": "#6F7278",
  "cinza-claro": "#E8E8E6",
  "cinza-muito-claro": "#F5F5F3"
}
```

**Paleta Semântica**
```json
{
  "sucesso": "#2A7F62",
  "aviso": "#D97706",
  "erro": "#DC2626",
  "info": "#0891B2"
}
```

### Tipografia

**Escala**
- `display`: 48px (bold)
- `h2`: 36px (semibold)
- `h3`: 24px (semibold)
- `h4`: 18px (semibold)
- `body-lg`: 18px (regular)
- `body`: 16px (regular)
- `body-sm`: 14px (regular)
- `caption`: 12px (medium)

**Família**
- Principal: Inter (sans-serif)
- Fallback: System fonts

### Espaçamento

```
xs: 4px
sm: 8px
md: 12px
base: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

### Sombras

```
sm: 0 1px 3px rgba(0,0,0,0.05)
md: 0 4px 12px rgba(0,0,0,0.08)
lg: 0 10px 25px rgba(0,0,0,0.1)
```

### Border Radius

```
sm: 4px
md: 8px
lg: 12px
xl: 16px
```

---

## 🧩 Componentes

### Button

**Variantes**
- Primary (Verde Oliva)
- Secondary (Outline)
- Tertiary (Ghost/Text)

**Tamanhos**
- Small (sm)
- Medium (md)
- Large (lg)

**Estados**
- Default
- Hover (shadow maior, scale 1.02)
- Active (pressed)
- Disabled (opacity 50%)
- Loading (spinner)

### Card

**Características**
- Background: Off-White
- Border: 1px Cinza Claro
- Border Radius: 12px
- Padding: 24px
- Hover: Shadow md

**Variantes**
- Simples (padrão)
- Com Header
- Com Footer
- Interativo (com hover)

### Input

**Características**
- Background: Off-White
- Border: 1px Cinza Claro
- Focus: Ring Verde Oliva
- Padding: 12px 16px
- Border Radius: 8px

**Variantes**
- Text
- Email
- Password
- Textarea
- Select
- Checkbox
- Radio

### Badge

**Características**
- Padding: 4px 12px
- Border Radius: 999px (pill)
- Font Size: 12px
- Font Weight: 500

**Variantes**
- Success (Verde)
- Warning (Dourado)
- Error (Vermelho)
- Info (Azul)

### Modal / Dialog

**Características**
- Overlay escuro (80% opacidade)
- Animation: Fade in + Scale
- Close button (X)
- Keyboard support (Escape)

---

## 🎯 Padrões

### Navegação

**Header**
- Logo esquerda
- Menu centro (desktop)
- CTA/Profile direita
- Hamburger (mobile)

**Footer**
- Logo + descrição
- Links rápidos (4 colunas)
- Contato
- Legal (privacidade, termos)
- Copyright

### Formulário (Wizard)

**Características**
- Progress bar visual
- Labels obrigatórios
- Helper text
- Validação em tempo real
- Mensagens de erro
- CTA para próxima etapa

### Lista

**Características**
- Cards empilhados
- Separadores sutis
- Hover state
- Paginação ou infinite scroll
- Skeleton loading

---

## ♿ Acessibilidade

### WCAG 2.1 AA Compliance

**Cores**
- Contraste >= 4.5:1 (texto/background)
- Verde Oliva + Off-White: 7.5:1 (AAA)
- Sem dependência de cor apenas

**Tipografia**
- Mínimo 12px
- Line height >= 1.5
- Letter spacing adequado

**Interatividade**
- Focus visível (outline 2px)
- Touch targets >= 44x44px
- Teclado navegação completa
- ARIA labels em elementos ocultos

**Animações**
- Respeitar `prefers-reduced-motion`
- Duração <= 200ms para transições
- Sem flashe > 3 vezes por segundo

---

## 📦 Como Usar

### Em React/Next.js

```tsx
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';

export default function Example() {
  return (
    <Card>
      <h2>Título</h2>
      <p>Conteúdo do card</p>
      <Button variant="primary" size="lg">
        Ação
      </Button>
    </Card>
  );
}
```

### Tailwind Classes

```tsx
// Colors
<div className="bg-verde-oliva text-off-white" />

// Typography
<h1 className="text-display font-bold" />
<p className="text-body text-cinza-medio" />

// Spacing
<div className="p-lg m-xl" />

// Shadows
<div className="shadow-md hover:shadow-lg" />
```

---

## 🎬 Animações

### Fade In
```jsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

### Slide In
```jsx
<motion.div
  initial={{ x: -50, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Scale Hover
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.98 }}
>
  Click me
</motion.button>
```

---

## 🌙 Modo Escuro (Futuro)

Paleta proposta:
```json
{
  "background": "#1A1A18",
  "card": "#2D2D2B",
  "text-primary": "#F5F5F3",
  "text-secondary": "#B8B8B6",
  "verde-oliva-light": "#A8C686"
}
```

---

## 📸 Capturas de Componentes

[Adicionar screenshots dos componentes principais]

---

## 🔗 Referências

- [Guia UI/UX](../docs/uiux.md)
- [Arquitetura](../docs/arquitetura.md)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Radix UI](https://www.radix-ui.com)

---

**Versão:** 1.0  
**Última Atualização:** Dezembro 2025
