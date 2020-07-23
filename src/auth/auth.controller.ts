import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
  Param,
  Query,
  Patch,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import {
  LoginDTO,
  ForgetDTO,
  ActivateDTO,
  VerifyBodyDTO,
  ChangePasswordBodyDTO,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import { LoggedInUser } from './../utils/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import {
  ValidatePasswordForRegister,
  ValidatePasswordForChange,
  ValidatePasswordForReset,
} from '../utils/validation';
import { UserService } from '../user/user.service';
import { CreateUserDTO, UpdateUserProfileDTO } from '../user/dto/user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() registerPayload: CreateUserDTO): Promise<any> {
    const { confirm_password, password } = registerPayload;
    ValidatePasswordForRegister({ confirm_password, password });
    const data = await this.userService.createUser(registerPayload);
    return { data };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginPayload: LoginDTO): Promise<any> {
    const user = await this.authService.login(loginPayload);
    const token = await this.authService.createToken(user);
    return { data: user, token };
  }

  @Get('activate')
  async activate(@Query() activation_code: ActivateDTO): Promise<any> {
    const user = await this.authService.activate(activation_code);
    return { data: user };
  }

  @Patch('forget')
  async forget(@Body() forgetPayload: ForgetDTO): Promise<any> {
    const user = await this.authService.forget(forgetPayload);
    return { user };
  }

  @Patch('reset/:reset_password_code')
  async resetPassword(
    @Param('reset_password_code', new ParseUUIDPipe())
    reset_password_code: string,
    @Body() verifyPayload: VerifyBodyDTO,
  ): Promise<any> {
    ValidatePasswordForReset(verifyPayload);
    const user = await this.authService.resetPassword(
      reset_password_code,
      verifyPayload,
    );
    return { data: { status: 'success' } };
  }

  @Patch('change')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  async changePassword(
    @Body() verifyPayload: ChangePasswordBodyDTO,
    @LoggedInUser() loggedInUser: any,
  ): Promise<any> {
    ValidatePasswordForChange(verifyPayload);
    const user = await this.authService.changePassword(
      verifyPayload,
      loggedInUser,
    );
    return { data: { status: 'success' } };
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(
    @Body() updatePayload: UpdateUserProfileDTO,
    @LoggedInUser() user: any,
  ): Promise<any> {
    user.id = user._id;
    const data = await this.userService.updateUserProfile(user, updatePayload);
    return { data };
  }
}
