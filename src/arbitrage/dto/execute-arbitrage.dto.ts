import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class ExecuteArbitrageDto {
  @IsString()
  @IsNotEmpty()
  sourceNetwork: string;

  @IsString()
  @IsNotEmpty()
  targetNetwork: string;

  @IsString()
  @IsNotEmpty()
  tokenSymbol: string;

  @IsNumber()
  @Min(0)
  amount: number;
}
