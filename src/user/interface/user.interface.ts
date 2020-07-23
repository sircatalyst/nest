import * as mongoose from "mongoose";

export interface User extends mongoose.Document {
	id?: string;
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	phone: string;
	activated: number;
	activation_code: string;
	verification_code: string;
	reset_password: string;
	password_expire: number;
	used_password: number;
	created: Date;
}
