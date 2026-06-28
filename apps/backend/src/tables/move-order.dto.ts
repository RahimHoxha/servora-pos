import { IsNumber } from "class-validator";

export class MoveOrderDto {
  @IsNumber()
  fromTableNumber: number;

  @IsNumber()
  toTableNumber: number;
}
