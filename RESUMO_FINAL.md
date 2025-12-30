# ✅ Resumo Rápido de Setup (VM Local)

- **Clone e deps**  
  ```bash
  git clone https://github.com/ed335/abra-megazord.git
  cd abra-megazord
  cd backend && npm install && cd ../web && npm install && cd ..
  ```

- **Infra (DB, pgAdmin, MailHog)**  
  ```bash
  docker-compose up -d
  ```

- **Envs**  
  - Backend `.env`: `DATABASE_URL="postgresql://abracann_user:abracann_password@localhost:5432/abracann_dev"` e ajuste JWT/SMTP/ENCRYPTION.  
  - Front `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3001`.

- **Prisma**  
  ```bash
  cd backend
  npm run prisma:generate
  npm run prisma:migrate -- --name init   # primeira vez
  cd ..
  ```

- **Rodar**  
  - Backend: `cd backend && npm run start:dev`  
  - Frontend: `cd web && npm run dev`

- **Acessar**  
  - Frontend: http://localhost:3000  
  - API: http://localhost:3001/api  
  - pgAdmin: http://localhost:5050 (admin@abracann.local / admin)  
  - MailHog: http://localhost:8025
