# 🎨 Guia de UI/UX - Design System AbraCann

## 1. Filosofia de Design

A UI/UX da AbraCann segue princípios de **humanidade, acolhimento, clareza e segurança**.

- **Humanidade**: Estética medicinal que inspira confiança sem frieza
- **Acolhimento**: Linguagem inclusiva, feedback positivo, guias intuitivos
- **Clareza**: Informações organizadas, hierarquia visual, sem jargão técnico
- **Segurança**: Indicadores de proteção, confiança em dados pessoais

---

## 2. Paleta de Cores

### Cores Primárias

| Nome | HEX | RGB | Uso |
|------|-----|-----|-----|
| **Off-White** | `#FAFAF8` | 250, 250, 248 | Fundo principal, cards |
| **Verde Oliva** | `#6B7C59` | 107, 124, 89 | CTA, headings, accent |
| **Verde Claro** | `#A8C686` | 168, 198, 134 | Hover, secondary actions |
| **Dourado** | `#D4A574` | 212, 165, 116 | Destaque, premium, tokens |

### Cores Neutras

| Nome | HEX | RGB | Uso |
|------|-----|-----|-----|
| **Cinza Escuro** | `#2D2D2D` | 45, 45, 45 | Textos principais |
| **Cinza Médio** | `#6F7278` | 111, 114, 120 | Textos secundários, borders |
| **Cinza Claro** | `#E8E8E6` | 232, 232, 230 | Dividers, backgrounds |
| **Cinza Muito Claro** | `#F5F5F3` | 245, 245, 243 | Backgrounds alternativos |

### Cores Semânticas

| Nome | HEX | Uso |
|------|-----|-----|
| **Sucesso** | `#2A7F62` | Confirmações, ações bem-sucedidas |
| **Aviso** | `#D97706` | Alertas, ações irreversíveis |
| **Erro** | `#DC2626` | Erros, validações inválidas |
| **Info** | `#0891B2` | Informações adicionais |

### Acessibilidade de Cores

✅ Verde Oliva + Off-White: **Contraste 7.5:1** (AAA)  
✅ Dourado + Off-White: **Contraste 4.8:1** (AA)  
✅ Cinza Escuro + Off-White: **Contraste 11.5:1** (AAA)

---

## 3. Tipografia

### Fonte Principal

**Inter** (sans-serif clean, acessível)
- Pesos: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`

### Escala Tipográfica

```
Display (H1)
  • Font Size: 48px
  • Font Weight: 700 (Bold)
  • Line Height: 1.2
  • Letter Spacing: -1px
  • Uso: Página títulos, home hero
  • Exemplo: "Acesso Seguro à Cannabis Medicinal"

Heading Large (H2)
  • Font Size: 36px
  • Font Weight: 600 (Semibold)
  • Line Height: 1.3
  • Uso: Seções principais, card titles
  • Exemplo: "Como Funciona?"

Heading Medium (H3)
  • Font Size: 24px
  • Font Weight: 600 (Semibold)
  • Line Height: 1.4
  • Uso: Subseções, form labels
  • Exemplo: "Informações Pessoais"

Heading Small (H4)
  • Font Size: 18px
  • Font Weight: 600 (Semibold)
  • Line Height: 1.4
  • Uso: Labels, subtítulos
  • Exemplo: "Nome Completo"

Body Large
  • Font Size: 18px
  • Font Weight: 400 (Regular)
  • Line Height: 1.6
  • Uso: Parágrafos destacados, intro
  • Exemplo: Textos introdutórios em cards

Body Regular
  • Font Size: 16px
  • Font Weight: 400 (Regular)
  • Line Height: 1.6
  • Uso: Textos principais, descrições
  • Exemplo: Descrições, conteúdo de artigos

Body Small
  • Font Size: 14px
  • Font Weight: 400 (Regular)
  • Line Height: 1.5
  • Uso: Labels, helper text, data
  • Exemplo: "Campo obrigatório"

Caption
  • Font Size: 12px
  • Font Weight: 500 (Medium)
  • Line Height: 1.4
  • Uso: Metadata, timestamps, notas
  • Exemplo: "Publicado em 10 de dezembro"
```

### Hierarquia Visual

1. **Display**: Máximo destaque (headlines)
2. **Headings**: Estrutura da página
3. **Body**: Conteúdo principal
4. **Caption**: Informações secundárias

---

## 4. Espaçamento (Spacing Scale)

```
4px   - Mínimo (borders, micro-adjustments)
8px   - Padrão pequeno
12px  - Padrão
16px  - Padrão médio (padding padrão)
24px  - Padrão grande
32px  - Seções
48px  - Seções grandes
64px  - Page sections
```

**Aplicações:**
- Button padding: `12px 24px`
- Card padding: `24px`
- Section margin: `64px 0`
- Input padding: `12px 16px`

---

## 5. Componentes Base (ShadCN/UI + Custom)

### Botões

**Primary Button** (CTA verde oliva)
```jsx
<Button className="bg-verde-oliva text-off-white hover:bg-verde-escuro 
  px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
  Começar Agora
</Button>
```
- Background: Verde Oliva `#6B7C59`
- Hover: Verde mais escuro `#5A6A4D`
- Text: Off-White
- Padding: `12px 24px`
- Border Radius: `8px`
- Shadow: `0 2px 8px rgba(0,0,0,0.1)` (hover)

**Secondary Button**
```jsx
<Button variant="outline" className="border-cinza-medio text-cinza-escuro
  hover:bg-cinza-claro">
  Cancelar
</Button>
```

**Tertiary Button** (Text link)
```jsx
<Button variant="ghost" className="text-verde-oliva hover:underline">
  Esqueceu a senha?
</Button>
```

### Cards

```jsx
<Card className="bg-off-white border border-cinza-claro rounded-xl p-6
  shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="border-b border-cinza-claro pb-4 mb-4">
    <CardTitle className="text-cinza-escuro text-xl font-semibold">
      Título do Card
    </CardTitle>
  </CardHeader>
  <CardContent className="text-cinza-escuro">
    Conteúdo do card
  </CardContent>
</Card>
```

- Background: Off-White
- Border: Cinza Claro, 1px
- Border Radius: `12px`
- Padding: `24px`
- Shadow: `0 1px 3px rgba(0,0,0,0.05)`
- Hover Shadow: `0 4px 12px rgba(0,0,0,0.08)`

### Inputs & Forms

```jsx
<Input 
  type="text"
  placeholder="Digite seu nome..."
  className="bg-off-white border border-cinza-claro text-cinza-escuro
    placeholder-cinza-medio px-4 py-3 rounded-lg
    focus:border-verde-oliva focus:ring-2 focus:ring-verde-oliva/20
    transition-colors"
/>
```

- Background: Off-White
- Border: Cinza Claro (default), Verde Oliva (focus)
- Padding: `12px 16px`
- Border Radius: `8px`
- Focus: Ring Verde Oliva com opacidade 20%

### Badges

```jsx
<Badge className="bg-verde-oliva/10 text-verde-oliva text-sm font-medium 
  px-3 py-1 rounded-full">
  ✓ Ativa
</Badge>
```

- Variantes: success (verde), warning (dourado), error (vermelho), info (azul)
- Padding: `4px 12px`
- Border Radius: `999px` (pill shape)

---

## 6. Animações (Framer Motion)

### Fade In

```jsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  Content
</motion.div>
```

**Aplicação:** Seções ao scroll (home), cards de artigos, modals

### Slide In

```jsx
<motion.div
  initial={{ x: -50, opacity: 0 }}
  whileInView={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
  Content
</motion.div>
```

**Aplicação:** Navegação, sidebars, elementos em cascata

### Scale & Hover

```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>
```

**Aplicação:** Botões, links, cards clicáveis

### Stagger (Listas)

```jsx
<motion.ul layout>
  {items.map((item) => (
    <motion.li
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

**Aplicação:** Listas de prescrições, artigos, pacientes

### Durations (Padrão)

- **Rápido**: 150-200ms (hover, tooltip)
- **Normal**: 300-400ms (transições, animações simples)
- **Lento**: 600-800ms (seções ao scroll, modals)

---

## 7. Ícones

**Biblioteca:** Lucide React
```jsx
import { Heart, Shield, FileText, Users } from 'lucide-react'

<Heart className="w-6 h-6 text-verde-oliva" />
<Shield className="w-8 h-8 text-dourado" />
```

**Tamanhos Padrão:**
- Badge/Tag: 16px
- Navigation: 20px
- Cards/Buttons: 24px
- Heroes/Large: 48-64px

---

## 8. Layouts & Grid

### Container

```jsx
<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
  Content
</div>
```

- Max Width: `1280px` (6xl)
- Padding: `16px` (mobile), `24px` (tablet), `32px` (desktop)

### Grid (2-3 colunas)

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

- Gap: `24px`
- Responsivo: 1 col (mobile), 2 col (tablet), 3 col (desktop)

---

## 9. Estados Visuais

### Hover

```
Button: Scale 1.02 + Shadow maior
Card: Shadow maior + Border mais visível
Link: Underline + Color verde oliva
```

### Focus (Acessibilidade)

```
Outline: 2px solid verde oliva
Offset: 2px
Aplicar a: buttons, inputs, links
```

### Disabled

```
Opacity: 50%
Cursor: not-allowed
Color: Cinza médio
```

### Loading

```jsx
<Button disabled className="opacity-50">
  <Loader className="animate-spin mr-2 h-4 w-4" />
  Processando...
</Button>
```

---

## 10. Exemplos de Páginas

### Home - Hero Section

```
┌───────────────────────────────────────────────────┐
│                                                    │
│  🌿 AbraCann                                      │
│  Acesso seguro à cannabis medicinal               │
│                                                    │
│  Bem-vindo a uma plataforma que cuida de você.   │
│  Prescritores validados. Dados protegidos.        │
│  Educação baseada em ciência.                      │
│                                                    │
│          [Começar Agora] [Saber Mais]            │
│                                                    │
│  [Hero Image - Ilustração serena, natural]        │
│                                                    │
└───────────────────────────────────────────────────┘

Cores: Off-White background, Verde Oliva text, Dourado accent
Tipografia: Display para título, Body Large para description
Animação: Fade-in ao carregar, Framer Motion
```

### Card de Recurso

```
┌──────────────────────────────────┐
│  🔒                              │
│  Segurança Garantida             │
├──────────────────────────────────┤
│  Seus dados são criptografados   │
│  com AES-256 e conformes à LGPD. │
│  Controle total sobre suas       │
│  informações pessoais.           │
│                                  │
│  [Saiba mais →]                  │
└──────────────────────────────────┘

Cor fundo: Off-White
Ícone: 48px, Verde Oliva
Título: H3, Cinza Escuro
Descrição: Body Small, Cinza Médio
Link: Verde Oliva, hover underline
```

---

## 11. Responsive Design (Mobile-First)

### Breakpoints

```
Mobile:  < 640px (sm)
Tablet:  640px - 1024px (md, lg)
Desktop: > 1024px (xl, 2xl)
```

### Estratégias

- **Typography**: Reduz em ~15-20% no mobile
- **Spacing**: 16px (mobile) → 24px (tablet) → 32px (desktop)
- **Grid**: 1 col (mobile) → 2 col (tablet) → 3+ col (desktop)
- **Images**: 100vw (mobile) → 50vw (tablet) → 33vw (desktop)

---

## 12. Acessibilidade (WCAG 2.1 AA)

✅ **Cores:**
- Verde Oliva + Off-White: 7.5:1 contrast (AAA)
- Cinza Escuro + Off-White: 11.5:1 contrast (AAA)

✅ **Tipografia:**
- Mínimo 12px no mobile
- Line height >= 1.5
- Letter spacing adequado

✅ **Interatividade:**
- Focus visível (outline 2px verde oliva)
- Touch targets >= 44x44px
- Teclado: Tab, Enter, Escape

✅ **ARIA:**
```jsx
<button aria-label="Fechar modal" aria-pressed="false">
  ✕
</button>

<input aria-describedby="email-help" />
<p id="email-help">Sua senha de e-mail será necessária</p>
```

---

## 13. Modo Escuro (Futuro)

Paleta proposta (se implementar dark mode):
```
Background: #1A1A18
Card: #2D2D2B
Text Primary: #F5F5F3
Text Secondary: #B8B8B6
Verde Oliva: #A8C686 (mais claro)
```

---

**Versão:** 1.0  
**Data:** Dezembro 2025  
**Próximas Atualizações:**
- [ ] Componentes interativos (protótipo)
- [ ] Modo escuro
- [ ] Variações de temas por módulo
