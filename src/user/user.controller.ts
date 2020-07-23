import {
  Controller,
  UsePipes,
  ValidationPipe,
  Get,
  Patch,
  UseGuards,
  Param,
  Body,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { ValidatePasswordForRegister } from '../utils/validation';
import {
  CreateUserDTO,
  UpdateUserProfileDTO,
  FindOneDTO,
} from './dto/user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@ApiBearerAuth('JWT')
@UsePipes(new ValidationPipe())
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createUser(@Body() createUserPayload: CreateUserDTO): Promise<any> {
    const { confirm_password, password } = createUserPayload;
    ValidatePasswordForRegister({ confirm_password, password });
    const user = await this.userService.createUser(createUserPayload);
    return { user };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getOneUser(@Param() id: FindOneDTO): Promise<any> {
    const data = await this.userService.findOneUser(id);
    return { data };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers(@Query() queryPayload: any): Promise<any> {
    const data = await this.userService.findAllUsers(queryPayload);
    return { data };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateUserProfile(
    @Param() id: FindOneDTO,
    @Body() updatePayload: UpdateUserProfileDTO,
  ): Promise<any> {
    const user = await this.userService.updateUserProfile(id, updatePayload);
    return { user };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Param() id: FindOneDTO): Promise<any> {
    const status = await this.userService.deleteAUser(id);
    return { data: { status } };
  }
}
