-- CreateEnum
CREATE TYPE "PerfilIntake" AS ENUM ('PACIENTE_NOVO', 'EM_TRATAMENTO', 'CUIDADOR');

-- CreateTable
CREATE TABLE "Intake" (
    "id" TEXT NOT NULL,
    "perfil" "PerfilIntake" NOT NULL,
    "condicaoPrincipal" TEXT,
    "objetivoPrincipal" TEXT,
    "gravidade" INTEGER,
    "tratamentosPrevios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "comorbidades" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notas" TEXT,
    "preferenciaAcompanhamento" TEXT,
    "melhorHorario" TEXT,
    "contatoEmail" TEXT NOT NULL,
    "contatoWhatsapp" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "consentiu" BOOLEAN NOT NULL DEFAULT false,
    "origem" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Intake_perfil_idx" ON "Intake"("perfil");
CREATE INDEX "Intake_contatoEmail_idx" ON "Intake"("contatoEmail");
CREATE INDEX "Intake_cidade_estado_idx" ON "Intake"("cidade", "estado");
