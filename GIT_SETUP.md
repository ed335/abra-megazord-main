# 🚀 Guia: Clonar para GitHub

## Passo 1: Criar repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. **Nome do repositório**: `abracann-megazord` (ou o nome que preferir)
3. **Descrição**: `Workspace profissional da plataforma medicinal AbraCann`
4. **Visibilidade**: `Private` (ou `Public` se quiser compartilhar)
5. **Não inicialize com README** (já temos um)
6. Clique em **Create repository**

## Passo 2: Inicializar Git localmente

```bash
# Entre no diretório do projeto
cd /Users/leonardosantos/abracann-megazord

# Inicialize o repositório Git
git init

# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "Initial commit: Workspace AbraCann base"
```

## Passo 3: Conectar com GitHub

Copie o comando abaixo (substituindo `seu-usuario` pelo seu username do GitHub):

```bash
git remote add origin https://github.com/seu-usuario/abracann-megazord.git
git branch -M main
git push -u origin main
```

## Passo 4: Verificar

```bash
# Veja o status
git status

# Veja o remote configurado
git remote -v
```

Pronto! Seu repositório está no GitHub! ✨

---

## ⚡ Atalho (Tudo junto)

Se preferir fazer tudo de uma vez:

```bash
cd /Users/leonardosantos/abracann-megazord

git init
git add .
git commit -m "Initial commit: Workspace AbraCann profissional"
git remote add origin https://github.com/seu-usuario/abracann-megazord.git
git branch -M main
git push -u origin main
```

---

## 📝 Próximas ações

1. **Adicionar colaboradores**:
   - Vá para Settings → Collaborators
   - Convide seus colegas de time

2. **Configurar branch protection**:
   - Settings → Branches → Add rule
   - Proteja a branch `main`
   - Exija pull requests para merges

3. **Setup de CI/CD** (opcional):
   - Actions → New workflow
   - Configure para rodar testes no push

4. **Documentação**: 
   - Atualize este README.md com links do GitHub
   - Configure GitHub Pages (opcional)

---

## 🔑 Autenticação via Token (Recomendado)

Se tiver problemas de autenticação, use token:

1. GitHub Settings → Developer settings → Personal access tokens
2. Gere um novo token com permissão `repo`
3. Ao fazer push, use:

```bash
git push -u origin main
# Username: seu-usuario
# Password: seu-token
```

Ou configure permanentemente:

```bash
git config --global credential.helper store
git push -u origin main
# Salva as credenciais para próximas vezes
```

---

## ✅ Checklist

- [ ] Repositório criado no GitHub
- [ ] Git inicializado localmente (`git init`)
- [ ] Arquivos adicionados (`git add .`)
- [ ] Primeiro commit feito (`git commit`)
- [ ] Remote adicionado (`git remote add origin`)
- [ ] Push feito (`git push`)
- [ ] Verificado no GitHub

**Sucesso!** Seu AbraCann agora está versionado e seguro no GitHub! 🎉
