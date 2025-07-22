// backend/src/member/dto/create-team-member.dto.ts
import { IsString, IsDateString, IsOptional, IsArray, IsEmail } from 'class-validator';

export class CreateTeamMemberDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  position: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsArray()
  @IsOptional()
  projectIds?: string[]; // New: Array of Project IDs to assign
}