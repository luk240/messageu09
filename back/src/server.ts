import { makeApp } from "./app/app";
import { dbConn } from "./db";
import dotenv from "dotenv";
import wsInit from "./ws";

dotenv.config(); // Load .env to procces.env
dbConn();

const port = process.env.PORT || 5000;
const app = makeApp();
const server = app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});
wsInit(server);