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
  UseInterceptors,
  UploadedFile,
  Res,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { storageOptions, fileFilter } from 'src/middleware/multer';

@Controller('auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

   /**   
    * @desc Route for users to register
    */
  @Post('register')
  async register(@Body() registerPayload: CreateUserDTO): Promise<any> {
    const { confirm_password, password } = registerPayload;
    ValidatePasswordForRegister({ confirm_password, password });
    const data = await this.userService.createUser(registerPayload);
    return { data };
  }

   /**   
    * @desc Route for users to register
    */
  @Post('login')
  @HttpCode(200)
  async login(@Body() loginPayload: LoginDTO): Promise<any> {
    const user = await this.authService.login(loginPayload);
    const token = await this.authService.createToken(user);
    return { data: user, token };
  }

  /**   
    * @desc Route for users to update profile
    */
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

  /**   
    * @desc Route for users to add image
    */
  @Post('avatar')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 100000, //1mb
      },
      fileFilter: fileFilter,
      storage: storageOptions,
    }),
  )
  async uploadAvatar(@UploadedFile() file): Promise<any> {
    return file;
  }
}
