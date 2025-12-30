import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PerfilIntake } from '@prisma/client';

const toArray = (value: unknown) => {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value].filter(Boolean);
};

const toBool = (value: unknown) =>
  value === true || value === 'true' || value === '1' || value === 1;

export class CreateIntakeDto {
  @IsEnum(PerfilIntake)
  perfil!: PerfilIntake;

  @IsOptional()
  @IsString()
  condicaoPrincipal?: string;

  @IsOptional()
  @IsString()
  objetivoPrincipal?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  gravidade?: number;

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => toArray(value))
  tratamentosPrevios: string[] = [];

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => toArray(value))
  comorbidades: string[] = [];

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsString()
  preferenciaAcompanhamento?: string;

  @IsOptional()
  @IsString()
  melhorHorario?: string;

  @IsEmail()
  contatoEmail!: string;

  @IsOptional()
  @IsString()
  contatoWhatsapp?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsBoolean()
  @Transform(({ value }) => toBool(value))
  consentiu: boolean = false;

  @IsOptional()
  @IsString()
  origem?: string;
}
