import { IsString, IsDateString, IsArray, IsOptional } from 'class-validator';
import { CreateTask } from './create-task.js';

export class CreateProjectDto {
  @IsString()
  name: string;

  // imageUrl removed, handled by file upload

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsArray()
  @IsOptional()
  teamMemberIds?: string[]; // Array of TeamMember IDs to assign

  @IsArray()
  @IsOptional()
  materialIds?: string[]; // Array of Material IDs to assign

  @IsArray()
  @IsOptional()
  initialTasks?: CreateTask[]; // Array of initial tasks

  @IsString()
  @IsOptional()
  initialNotes?: string; // Description
}