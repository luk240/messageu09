import {Request, Response, NextFunction } from "express";
import { IncomingMessage } from "http";
import { db } from "../db";
import jwt from "jsonwebtoken";
import { getCookies } from "./utils/cookie";
import handleErr from "./utils/error";
import { hash } from "./utils/hash";

type M = (...args:[Request, Response, NextFunction]) => void;

/* Without cookies the request would include the token like so:
	curl -H "Authorization: Bearer <tok>" localhost:8080/user/users
Code:
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1]; */
const authenticateTok:M = (req, res, next) => {
	const c = req.headers.cookie;
	if (!c) return res.status(401).send("No cookies");

	const tok = getCookies<{tok:string}>(c).tok;
	if (!tok) return res.sendStatus(401);

	jwt.verify(tok, process.env.TOK_SECRET!, (err, dTok) => {
		if (err) {
			console.log(err);
			return res.status(403).send("Session Expired");
		}
		console.log("TOK_VERIFY", dTok);
		req.tok = dTok as {id:string, iat: number, exp: number};
		next();
	})
}

function wsTokAuth(req:IncomingMessage) {
	var tok:string|null|boolean = "";
	const c = req.headers.cookie;

	if (c) tok = getCookies<{tok:string}>(c).tok;
	/*if (!tok && req.url) { // No-cookie requests (not implemented)
			const url = new URL(req.url, `ws://${req.headers.host}`)
			tok = url.searchParams.get("t")
	}*/
	if (!tok) return false;

	jwt.verify(tok, process.env.TOK_SECRET!, (err, dTok) => {
		if (err) {
			console.log(err);
			return tok = false;
		}
		console.log("WS_TOK_VERIFY", dTok);
		req.tok = dTok as {id:string, iat: number, exp: number};
		tok = true;
	});

	return tok;
}

const bodyIsString:M = async (req, res, next) => {
	try {
		const keys = Object.keys(req.body);
		if (!keys.length) throw Error("Empty request");
		for (let k of keys) {
			if (typeof k !== "string") throw Error("Modified request");
		}

		next();
	}catch(e) {
		res.status(400).json(handleErr(e));
	}
}

const valReg:M = async (req, res, next) => {
	const table = "users";
	let err:{message: string[]} = {message: []}
	let {username, email, password}:{[k:string]: string} = req.body;
	try {
		// Check required fields
		if (!username || !password) {
			if (!username) err.message.push("Missing Username");
			if (!password) err.message.push("Missing Password");
			throw err;
		}

		// Edit
		email = email.toLowerCase();
		username = username.toLowerCase();

		// Validate
		if (!/^[a-z0-9.-_]{2,50}$/.test(username)) err.message.push("Invalid Username");
		if (!/^.{6,50}$/.test(password)) {
			const c = password.length;
			if (!/^.{,5}$/.test(password)) err.message.push(`Password length(${c}) too short`);
			else if (!/^.{51,}$/.test(password)) err.message.push(`Max Password length is 50, your is ${c}`);
			else err.message.push("Couldn't verify Password");
		}
		if (email && !/^[\w.-]{2,50}@[\w]{1,50}.[a-z]{2,9}$/.test(email)) err.message.push("Invalid Email");
		if (err.message.length) throw err;


		// Check if unique (not pushing to "err" to avoid DB parse)
		if (await db.collection(table).findOne({"username": username})) throw {message: ["Username already in use"]};
		if (email && await db.collection(table).findOne({"email": email})) throw {message: ["Email already in use"]};

		req.body = {username, email, password};
		next();
	}catch(e) {
		res.status(400).json({error: handleErr(e)});
	}
}

const valLogin:M = async (req, res, next) => {
	try {
		let err:{message: string[]} = {message: []}
		let {cred, password}:{[k:string]: string} = req.body;

		// Check if = ""
		if (!cred || !password) {
			if (!cred) err.message.push("Missing Username or Email");
			if (!password) err.message.push("Missing Password");
			throw err;
		}

		next();
	}catch(e) {
		res.status(400).json({error: handleErr(e)});
	}
}

const valUpdate:M = async (req, res, next) => {
	const table = "users";
	let {username, name, email, password}:{[k:string]: string} = req.body;
	req.body = {};
	try {

		if (username) {
			username = username.toLowerCase();
			if (!/^[a-z0-9.-_]{2,50}$/.test(username)) throw "Invalid Username";
			if (await db.collection(table).findOne({"username": username})) throw "Username already in use";
			req.body.username = username;
		}

		if (name) req.body.name = name;

		if (email) {
			email = email.toLowerCase();
			if (email && !/^[\w.-]{2,50}@[\w]{1,50}.[a-z]{2,9}$/.test(email)) throw "Invalid Email";
			if (email && await db.collection(table).findOne({"email": email})) throw "Email already in use";
			req.body.email = email;
		}

		if (password) {
			if (!/^.{6,50}$/.test(password)) {
				const c = password.length;
				if (/^.{,5}$/.test(password)) throw `Password length(${c}) too short`;
				else if (/^.{51,}$/.test(password)) throw `Max Password length is 50, your is ${c}`;
				else throw "Couldn't verify Password";
			}
			req.body.password = await hash(password);
		}

		if (Object.keys(req.body).length === 0) throw "Nothing to update";

		next();
	}catch(e) {
		res.status(400).json({error: handleErr(e)});
	}
}

export {authenticateTok, wsTokAuth, valReg, valLogin, bodyIsString, valUpdate};
