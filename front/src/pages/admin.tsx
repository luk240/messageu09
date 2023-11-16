import { useEffect, useState, useContext } from "react"
import { getUsers, rmUser } from "../utils/fetch";
import { UserContext } from "../app";

export default function Admin() {
	const [users, setUsers] = useState<any[]>([]);
	const user = useContext(UserContext);

	useEffect(() => {
		getUsers().then((data) => {
			setUsers(data);
		});
	}, []);

	return (<>
		<h1>Admin Panel</h1>
		{users.length && user.admin === 1 &&
			users.map(u => (
				<div>
					<h2>{u.username}</h2>
					<button onClick={() => rmUser(u._id)}>
						Delete this user
					</button>
					<hr/>
				</div>
		))}
	</>
	)
}
