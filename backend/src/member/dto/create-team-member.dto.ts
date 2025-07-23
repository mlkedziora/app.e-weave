// backend/src/member/dto/create-team-member.dto.ts
import { IsString, IsDateString, IsOptional, IsArray, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer'; // Add this import

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

  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value) // Add this to parse JSON string
  @IsArray()
  @IsString({ each: true }) // Add this to validate each item is a string (project ID)
  @IsOptional()
  projectIds?: string[]; // New: Array of Project IDs to assign
}