Message
----

This repo contains both a front- and back end of a fast, secure and simpel to use chat app.

**Perks**
* No external requests made.
* Ping/Pong.
* Group Rooms.
* Keyboard only navigation.
* Lesser modules used.

<h2 id="instl">Local installation</h2>

Download the project as zip or clone it `git clone <url>` and open the project root in a shell.

### Frontend

Change to the front directory `cd ./front` and install required packages `npm install`.

Create a ".env" file with the follwing content (dont miss trailing "/").
```
_API=http://localhost:4000/
_WS=ws://localhost:4000/
```

You can now start the frontend `npm run dev`, view the page on **localhost:4000**

### Backend

Change to the back directory `cd ./back` and install required packages `npm install`.

Create a ".env" file with the follwing content.
```
PORT=5000
DB_URI=mongodb://localhost:27017
DOMAIN=http://localhost:4000
TOK_SECRET=secret # Add your own secret!
```

You will need to install mongodb, or if you are using atlas (cloud) simply update "DB_URI". I used [this]("https://hub.docker.com/_/mongo/") docker image, with the following command `docker run -v ./db_data:/data/db -p 27017:27017 --name my-mongo --restart unless-stopped -d mongo:7`

With a database setup, now seed data to it: `npm run seed`  
This creates 3 users (usr1,-2,-3) and an "admin" user. The password is "1".

Start the server: `npm run dev`

Thats it! Open http://localhost:5000 and you should see a message.

## Deploy steps

Follow the [Local installation](#local-installation), but instead use `npm install --production` and update .env to match your needs.

## Routes
``````
GET    "/"
POST   "/user/register"
POST   "/user/login"
GET    "/user/logout"
GET    "/user/auth"
GET    "/user/users"
GET    "/user/<uid>"
GET    "/user/<name>"
GET    "/convo/get"
POST   "/convo/new"
DELETE "/msg/"
GET    "/msg/c/<cid>"
``````
----

Live frontend: https://medis.ddns.net/message/  
Live backend: https://medis.ddns.net/message/api/
