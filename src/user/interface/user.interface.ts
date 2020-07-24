import * as mongoose from "mongoose";

export interface User extends mongoose.Document {
	id?: string;
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	phone: string;
	role?: string;
	created: Date;
}
