import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
  
  @ApiProperty({ default: 10, description: 'How manys rows do you need' })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ default: 0, description: 'How manys rows do want to skip' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number;
}