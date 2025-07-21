import { IsString, IsNumber, IsDate, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  fiber: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  length?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gsm?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  texture?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  productCode?: string;

  @IsOptional()
  @IsString()
  purchaseLocation?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  datePurchased?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricePerMeter?: number;

  @IsOptional()
  @IsString()
  certifications?: string;

  @IsOptional()
  @IsString()
  initialNotes?: string;

  // Image is handled separately (not in DTO, as UploadedFile)
}