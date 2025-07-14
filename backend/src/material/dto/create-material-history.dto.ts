import { IsDefined, IsNumber, IsDate, IsOptional } from 'class-validator';

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
}