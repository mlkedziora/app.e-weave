// backend/src/material/dto/create-material-history.dto.ts
import { IsDefined, IsNumber, IsDate, IsOptional, IsString } from 'class-validator';

export class CreateMaterialHistoryDto {
  @IsDefined()
  @IsNumber()
  previousLength: number;

  @IsDefined()
  @IsNumber()
  newLength: number;

  @IsOptional()
  @IsDate()
  changedAt?: Date;

  @IsOptional()
  @IsString()
  taskId?: string;
}