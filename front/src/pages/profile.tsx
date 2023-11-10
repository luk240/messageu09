import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserContext } from "../app";
import { formPost } from "../utils/fetch";
import { logout } from "../utils/fetch";
import "./profile.css";

export default function Profile() {
	const user = useContext(UserContext);
	const navigate = useNavigate();
	const [err, setErr] = useState<string|null|false>(null);

	const handleSubmit = (e:React.FormEvent<HTMLFormElement>) => {
		setErr(null);
		formPost(e, "user/update/").then((data) => {
			if (data == "OK") setErr(false);
			else setErr(data.error);
		});
	}

	async function logout_() {
		const res = await logout();
		if (res.ok) navigate("/login?y");
		else return "Try again"
	}

	return (<>
		<header>
			<Link to="/">Back</Link>
			<button onClick={logout_}>Logout</button>
		</header>
		<div id="profile">
			<h1>Profile</h1>
			<form onSubmit={handleSubmit}>
				<label>Username:
					<input name="username" type="text" placeholder={user.username}/>
				</label>
				<label>Display Name:
					<input name="name" type="text" placeholder={user.name}/>
				</label>
				<label>Email:
					<input name="email" type="text" placeholder={user.email}/>
				</label>
				<label>Password:
					<input name="password" type="password"/>
				</label>
				<button type="submit">Update</button>
			</form>
			{err !== null && <div className={`form-err${!err ? " form-ok" : ""}`}>
				<p>{err || "Updated"}</p>
			</div>}
		</div>
	</>)
}
