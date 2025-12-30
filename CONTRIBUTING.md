# 🤝 Contribuindo ao AbraCann

Obrigado por querer contribuir! Este documento descreve como participar do desenvolvimento.

---

## 📋 Código de Conduta

Seja respeitoso, inclusivo e profissional. Discriminação de qualquer tipo não é tolerada.

---

## 🎯 Como Contribuir

### 1. Reportar Bugs

Abra uma issue no GitHub com:
- **Título descritivo**
- **Descrição clara do problema**
- **Passos para reproduzir**
- **Comportamento esperado vs. atual**
- **Screenshots** (se aplicável)
- **Versão do Node.js, SO, navegador**

### 2. Sugerir Features

Abra uma issue (com label `enhancement`) com:
- **Descrição clara da feature**
- **Caso de uso / por que é necessária**
- **Possível implementação** (se tiver ideia)
- **Mockups** (se aplicável)

### 3. Fazer Pull Request

```bash
# 1. Fork o repositório
# (Clique em "Fork" no GitHub)

# 2. Clone seu fork
git clone https://github.com/SEU_USERNAME/abracann.git
cd abracann

# 3. Crie uma branch
git checkout -b feature/nome-da-feature
# ou
git checkout -b bugfix/nome-do-bug

# 4. Faça suas mudanças
# (Edit files...)

# 5. Commit com mensagem descritiva
git add .
git commit -m "feat: adiciona nova feature X"
# ou
git commit -m "fix: corrige bug em Y"

# 6. Push para sua branch
git push origin feature/nome-da-feature

# 7. Abra um Pull Request no GitHub
# - Descreva as mudanças
# - Referencie issues relacionadas (#123)
# - Explique o porquê da mudança
```

---

## 📝 Convenção de Commits

Use o formato [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <descrição>

<corpo>

<footer>
```

### Tipos

- **feat**: Nova feature
- **fix**: Correção de bug
- **docs**: Mudanças em documentação
- **style**: Formatação (sem lógica)
- **refactor**: Refatoração de código
- **test**: Testes
- **chore**: Dependências, build, etc

### Exemplos

```bash
git commit -m "feat(auth): implementa recuperação de senha"
git commit -m "fix(paciente): corrige validação de CPF"
git commit -m "docs: atualiza README"
git commit -m "refactor(api): simplifica tratamento de erros"
git commit -m "test(prescricao): adiciona testes unitários"
```

---

## 🎨 Style Guide

### TypeScript/JavaScript

```typescript
// ✅ BOM
const getUserById = (id: string): User => {
  return users.find(u => u.id === id);
};

// ❌ RUIM
function GetUserById(Id) {
  return users.find(u => u.id === Id)
}
```

Regras:
- `camelCase` para variáveis/funções
- `PascalCase` para classes/componentes
- `SCREAMING_SNAKE_CASE` para constantes
- Sem abreviações (ex: `user` não `usr`)
- Máximo 100 caracteres por linha (frontend) / 120 (backend)

### React/JSX

```typescript
// ✅ BOM
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}: ButtonProps) => {
  return (
    <button className={`btn btn-${variant} btn-${size}`} onClick={onClick}>
      {children}
    </button>
  );
};

// ❌ RUIM
export const Button = (props) => {
  return (
    <button className={props.className} onClick={props.onClick}>
      {props.children}
    </button>
  );
};
```

Regras:
- Components como `PascalCase`
- Props com tipos completos
- Desestruture props
- Use `export const` (não default)

### CSS/Tailwind

```jsx
// ✅ BOM
<div className="flex items-center justify-between gap-4 p-4 bg-off-white rounded-lg border border-cinza-claro">
  <h2 className="text-lg font-semibold text-cinza-escuro">Título</h2>
</div>

// ❌ RUIM
<div style={{display: 'flex', padding: '16px'}}>
  <h2 style={{fontSize: '18px', fontWeight: 'bold'}}>Título</h2>
</div>
```

Regras:
- Use Tailwind classes
- Sem inline styles
- Respeite custom colors (verde-oliva, etc)
- Mobile-first responsive

---

## ✅ Checklist de PR

Antes de submeter um PR, verifique:

- [ ] Code segue o style guide
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Sem console.log em produção
- [ ] Sem hardcoded secrets/passwords
- [ ] TypeScript tipo-cheque passa
- [ ] Lint passa (`npm run lint`)
- [ ] Prettier passa (`npm run format`)
- [ ] Commits seguem convenção

---

## 🧪 Testes

Adicione testes para novas features:

```typescript
// exemplo.test.ts
import { getUserById } from './user.service';

describe('UserService', () => {
  it('deve retornar usuário por ID', () => {
    const user = getUserById('123');
    expect(user).toBeDefined();
    expect(user.id).toBe('123');
  });

  it('deve retornar undefined se não encontrar', () => {
    const user = getUserById('invalid');
    expect(user).toBeUndefined();
  });
});
```

Rodando testes:
```bash
npm test              # Uma vez
npm run test:watch    # Watch mode
npm run test:cov      # Com coverage
```

**Meta de cobertura:** >= 80%

---

## 📚 Documentação

Adicione docs para:
- Novas funcionalidades
- APIs públicas
- Mudanças importantes

Formatos aceitos:
- Markdown em `/docs`
- JSDoc em código
- Comentários claros

---

## 🔍 Review Process

1. **Automático**: GitHub Actions roda testes/lint
2. **Manual**: Pelo menos 1 code review
3. **Feedback**: Resonda aos comentários
4. **Aprovação**: Aprovado por maintainer
5. **Merge**: Squash merge para main

---

## 🚫 O Que NÃO Fazer

- ❌ Não force push para branches compartilhadas
- ❌ Não commite `node_modules`, `.env`, build files
- ❌ Não misture features (1 PR = 1 feature/bug)
- ❌ Não ignore warnings/erros de lint
- ❌ Não mude espaçamento desnecessariamente
- ❌ Não faça PRs em branches de outra pessoa
- ❌ Não ignore feedback de reviews

---

## 💬 Comunicação

- **Issues**: Use para discussões técnicas
- **Discussions**: Use para ideias/perguntas gerais
- **Slack**: Use para chat rápido (se aplicável)
- **Email**: dev@abracann.com para tópicos sensíveis

---

## 📞 Perguntas?

- Leia `/docs` e `/SETUP.md`
- Abra uma issue com `question` label
- Envie email para dev@abracann.com

---

**Obrigado por contribuir! 🙏**

**Última Atualização:** Dezembro 2025
