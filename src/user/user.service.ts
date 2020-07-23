import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PaginateModel } from 'mongoose';
import * as uuid from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './interface/user.interface';

import {
  UpdateUserProfileDTO,
  CreateUserDTO,
  FindOneDTO,
} from './dto/user.dto';
import 'dotenv/config';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: PaginateModel<User>) {}

  async createUser(createUserPayload: CreateUserDTO): Promise<User> {

    const { email, phone } = createUserPayload;
    const userEmail = await this.userModel.findOne({ email });

    if (userEmail) {
      if (!userEmail.activated) {
        throw new HttpException(
          'User already exists, Please kindly verify your account',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const userPhone = await this.userModel.findOne({ phone });
    if (userPhone) {
      throw new HttpException(
        'User with this phone number already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const activationCode: string = uuid.v4();
    createUserPayload.activated = 0;
    createUserPayload.activation_code = activationCode;
    const createUser = new this.userModel(createUserPayload);
    const createdUser = await createUser.save();

    return this.sanitizeUserResponse(createdUser);
  }

  async findOneUser(param: any): Promise<User> {
    try {
      const { id } = param;
      const user = await this.userModel.findOne({ _id: id });
      if (!user) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }

      return this.sanitizeUserResponse(user);
    } catch (error) {
      if (
        error.message === 'Not Found' ||
        /Cast to ObjectId/g.test(error.message)
      ) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAllUsers(queryPayload: any): Promise<any> {

    const { limit, offset } = queryPayload;
    const offsetPayload: number =
      parseInt(offset, 10) || parseInt(process.env.PAGINATION_OFFSET, 10)|| 0;
    const limitPayload: number =
      parseInt(limit, 10) || parseInt(process.env.PAGINATION_LIMIT, 10) || 10;
    const users = await this.userModel.paginate(
      {},
      { offset: offsetPayload, limit: limitPayload },
    );
    if (!users) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return users;
  }

  async updateUserProfile(
    param: FindOneDTO,
    updatePayload: UpdateUserProfileDTO,
  ): Promise<User> {
    try {
      const { id } = param;
      const { first_name, last_name } = updatePayload;
      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: id },
        { first_name, last_name },
        {
          new: true,
        },
      );
      if (!updatedUser) {
        throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND);
      }

      return this.sanitizeUserResponse(updatedUser);
    } catch (error) {
      if (
        error.message === 'Not Found' ||
        /Cast to ObjectId/g.test(error.message)
      ) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteAUser(param: FindOneDTO): Promise<string> {
    try {
      const { id } = param;
      const user = await this.userModel.findOneAndDelete({ _id: id });
      if (!user) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }
      return 'success';
    } catch (error) {
      if (
        error.message === 'Not Found' ||
        /Cast to ObjectId/g.test(error.message)
      ) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private sanitizeUserResponse(user: any) {
    user = user.toObject();
    delete user.password;
    return user;
  }
}
