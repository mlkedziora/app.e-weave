// backend/src/task/dto/create-task.dto.ts
import { IsString, IsOptional, IsDateString, IsArray } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  projectId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subtasks?: string[];
}