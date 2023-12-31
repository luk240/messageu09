import { db } from "../../db";
import { ObjectId } from "mongodb";
import { hash, unhash } from "../utils/hash";


interface IUserDao {
	regUser(user: model.IUser): Promise<string>;
	getUser(id: string): Promise<model.IUser|null>;
	getAllUsers(): Promise<model.IUser[]>;
}

class UserDao implements IUserDao {
	public readonly db = db.collection<model.IUser>("users");

	async regUser(user: model.IUser) {
		user.password = await hash(user.password);
		const res = await this.db.insertOne(user);

		console.log(`${user.username} registered: ${res.acknowledged}`);
		console.log(res.insertedId, res.insertedId.toString());
		return res.insertedId.toString();
	}

	async loginUser({cred, password}:{cred: string, password: string,}) {
		const user = await this.db.findOne({$or: [{"username": cred}, {"email": cred}]});
		if (user && await unhash(password, user.password)) return user;
		throw Error("Bad credentials")
	}

	async updateUser(id:string, body:Object) {
		const res = await this.db.updateOne({"_id": new ObjectId(id)}, { $set: body });
		console.log(res);
	}

	async getUser(id: string) {
		const result = await this.db.findOne({"_id": new ObjectId(id)});
		if (!result) throw Error("Could not find user");
		return result;
	}

	async getUserName(id:string) {
		const user = await this.getUser(id);
		return user.name;
	}

	async getAllUsers() {
		const cursor = this.db.find({});
		const users = await cursor.toArray();
		return users;
	}

	async rmUser(id:string) {
		this.db.deleteOne({_id: ObjectId(id)});
		return "User was removed";
	}

	async searchUsers(id:string, exp:string) {
		if (/[^a-z0-9.-_]/.test(exp) || exp.length < 2) throw Error("Invalid expression");
		exp.replace(/\./g, "\\.");
		const r = new RegExp(`^${exp}.*`, "i");

		const cursor = this.db.find({ "_id": {$ne: new ObjectId(id)}, "username": {$regex: r} }, { projection: {"_id": 0, "id": "$_id", "username": 1} });
		const users = await cursor.toArray();
		return users;
	}
}

export default new UserDao();
