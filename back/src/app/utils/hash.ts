import bcrypt from "bcrypt";

export async function hash(s:string) {
		const salt = await bcrypt.genSalt(9);
		return bcrypt.hash(s, salt);
}
export function unhash(s:string, hash:string) {
	return bcrypt.compare(s, hash)
}
