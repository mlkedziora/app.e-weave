// backend/src/task/dto/assign-task.dto.ts
import { IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignTaskDto {
  @Type(() => String)
  @IsString()
  assigneeId: string;
}