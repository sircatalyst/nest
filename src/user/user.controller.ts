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
import { AdminGuard } from 'src/guards/adminGuard';

@Controller('users')
@ApiBearerAuth('JWT')
@UsePipes(new ValidationPipe())
export class UserController {
  constructor(private userService: UserService) {}

  /**   
    * @desc Route for admin to create a user
    */
  @Post()
	@UseGuards(AuthGuard('jwt'), AdminGuard)
  async createUser(@Body() createUserPayload: CreateUserDTO): Promise<any> {
    const { confirm_password, password } = createUserPayload;
    ValidatePasswordForRegister({ confirm_password, password });
    const user = await this.userService.createUser(createUserPayload);
    return { user };
  }

  /**   
    * @desc Route for admin to get a single user
    */
  @Get(':id')
	@UseGuards(AuthGuard('jwt'), AdminGuard)
  async getOneUser(@Param() id: FindOneDTO): Promise<any> {
    const data = await this.userService.findOneUser(id);
    return { data };
  }

  /**   
    * @desc Route for admin to list all users
    */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers(@Query() queryPayload: any): Promise<any> {
    const data = await this.userService.findAllUsers(queryPayload);
    return { data };
  }
  
  /**
    * @desc Route for admin to update a user role
    */
  @Get(':id/role')
	@UseGuards(AuthGuard('jwt'), AdminGuard)
  async makeUserAdmin(
    @Param() id: FindOneDTO
  ): Promise<any> {
    const user = await this.userService.makeUserAdmin(id);
    return { user };
  }

  /**
    * @desc Route for admin to delete a user
    */
  @Delete(':id')
	@UseGuards(AuthGuard('jwt'), AdminGuard)
  async deleteUser(@Param() id: FindOneDTO): Promise<any> {
    const status = await this.userService.deleteAUser(id);
    return { data: { status } };
  }
}
