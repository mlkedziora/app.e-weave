// backend/src/material/dto/create-material-history.dto.ts
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMaterialHistoryDto {
  @IsNumber()
  previousLength: number;

  @IsNumber()
  newLength: number;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  teamMemberId?: string;
}