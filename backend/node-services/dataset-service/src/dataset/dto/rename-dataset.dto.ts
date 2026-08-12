import { IsString, IsNotEmpty, MinLength, MaxLength } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class RenameDatasetDto {
  @ApiProperty({ example: "My Renamed Dataset", minLength: 3, maxLength: 100 })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: "Dataset name is required" })
  @MinLength(3, { message: "Dataset name must be at least 3 characters" })
  @MaxLength(100, { message: "Dataset name must not exceed 100 characters" })
  name: string;
}
