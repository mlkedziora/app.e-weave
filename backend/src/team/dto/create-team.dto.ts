// backend/src/team/dto/create-team.dto.ts
import { IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name: string;
}