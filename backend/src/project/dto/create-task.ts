import { IsString, IsDateString, IsArray, IsOptional } from 'class-validator';

export class CreateTask {
  @IsString()
  name: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsArray()
  @IsOptional()
  subtasks?: string[]; // Simple strings for subtask names; use CreateSubtaskDto[] if more complex

  @IsString()
  @IsOptional()
  assigneeId?: string; // TeamMember ID
}