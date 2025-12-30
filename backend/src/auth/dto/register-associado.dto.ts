import { IsEmail, IsString, MinLength, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class RegisterAssociadoDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  nome!: string;

  @IsString()
  whatsapp!: string;

  @IsString()
  cep!: string;

  @IsString()
  rua!: string;

  @IsString()
  numero!: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsOptional()
  @IsString()
  bairro?: string;

  @IsString()
  cidade!: string;

  @IsString()
  estado!: string;

  @IsOptional()
  @IsString()
  documentoIdentidadeUrl?: string;

  @IsBoolean()
  jaUsaCannabis!: boolean;

  @IsString()
  patologiaCID!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentosMedicosUrls?: string[];

  @IsBoolean()
  termoAjuizamento!: boolean;

  @IsBoolean()
  consenteLGPD!: boolean;
}
