import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  category: string;

  @IsString()
  name: string;

  @IsString()
  fiber: string;

  @IsNumber()
  @IsOptional()
  length?: number;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  gsm?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  texture?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsString()
  @IsOptional()
  supplier?: string;

  @IsString()
  @IsOptional()
  productCode?: string;

  @IsString()
  @IsOptional()
  purchaseLocation?: string;

  @IsDateString()
  @IsOptional()
  datePurchased?: string;

  @IsNumber()
  @IsOptional()
  pricePerMeter?: number;

  @IsString()
  @IsOptional()
  knownCertifications?: string;

  @IsString()
  @IsOptional()
  initialNotes?: string;
}