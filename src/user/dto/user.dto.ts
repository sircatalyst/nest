import {
  IsString,
  MinLength,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  MaxLength,
  IsHexadecimal,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'email' })
  email: string;

  @IsNotEmpty()
  @MinLength(7, { message: 'password must be at least seven characters' })
  @ApiProperty({ type: String, description: 'password' })
  password: string;

  @IsNotEmpty()
  @MinLength(7, {
    message: 'confirm_password must be at least seven characters',
  })
  @ApiProperty({ type: String, description: 'confirm_password' })
  confirm_password: string;

  @IsPhoneNumber('NG')
  @MinLength(11)
  @MaxLength(14)
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'phone' })
  phone: string;

  @MinLength(3)
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'first_name' })
  first_name: string;

  @MinLength(3)
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'last_name' })
  last_name: string;

  activated?: number;
  activation_code?: string;
  reset_password?: string;
  password_expire?: string;
  used_password?: number;
}

export class UpdateUserProfileDTO {
  @MinLength(3)
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'first_name' })
  first_name: string;

  @MinLength(3)
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'last_name' })
  last_name: string;
}

export class FindOneDTO {
  @IsHexadecimal({ message: 'id must be a valid mongo id' })
  @ApiProperty({ type: String, description: 'id' })
  id: string;
}
