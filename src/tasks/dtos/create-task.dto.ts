import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsOptional()
  // this tell nest that each item inside object be validated
  @ValidateNested({ each: true })
  // the type tell the type of the item inside the labels arrays
  @Type(() => CreateTaskLabelDto)
  labels?: CreateTaskLabelDto[];
}
