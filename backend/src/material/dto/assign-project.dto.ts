// backend/src/material/dto/assign-project.dto.ts
import { IsString, IsArray, IsOptional } from 'class-validator';

export class AssignProjectDto {
  @IsString()
  projectId: string;

  @IsArray()
  @IsOptional()
  taskIds?: string[];
}