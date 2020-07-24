import * as uuid from "uuid";
import * as bcrypt from "bcrypt";
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { Model } from "mongoose";

import { sign } from "jsonwebtoken";
import { InjectModel } from "@nestjs/mongoose";
import { LoginDTO, VerifyBodyDTO, ChangePasswordBodyDTO } from "./dto/auth.dto";
import { User } from "../user/interface/user.interface";
import "dotenv/config";

@Injectable()
export class AuthService {
	constructor(@InjectModel("User") private userModel: Model<User>) {}	

	async login(loginPayload: LoginDTO): Promise<User> {

		const { email, password } = loginPayload;
		const user = await this.userModel.findOne({ email });

		if (!user) {
			throw new HttpException(
				"Invalid Credentials",
				HttpStatus.UNAUTHORIZED
			);
		}

		if (await bcrypt.compare(password, user.password)) {
			return this.sanitizeAuthResponse(user);
		} else {

			throw new HttpException(
				"Invalid Credentials",
				HttpStatus.UNAUTHORIZED
			);
		}
	}

	async changePassword(
		bodyPayload: ChangePasswordBodyDTO,
		user: any
	): Promise<any> {

		const { new_password, old_password } = bodyPayload;

		if (await bcrypt.compare(old_password, user.password)) {
			if (!user.activated) {

				throw new HttpException(
					"Please kindly verify your account to login",
					HttpStatus.UNAUTHORIZED
				);
			}
			const hashedPassword = await bcrypt.hash(new_password, 10);
			const updatedUser = await this.userModel.updateOne(
				{ _id: user._id },
				{
					used_password: 1,
					reset_password: null,
					password: hashedPassword
				}
			);


			return this.sanitizeAuthResponse(user);
		} else {

			throw new HttpException(
				"Invalid Old Password",
				HttpStatus.UNPROCESSABLE_ENTITY
			);
		}
	}

	async createToken(user: any) {
		return sign(user, process.env.SECRET_KEY, { expiresIn: "12h" });
	}

	async sanitizeAuthResponse(user: any) {
		user = user.toObject();
		delete user.password;
		return user;
	}
}
