require("dotenv").config();
const express = require("express");
require('./controllers/GoogleAuthController');
require('./controllers/FacebookAuthController');
const session = require('express-session');
const passport = require('passport');
const https = require("https");
const path = require("path");
const fs = require("fs");


const app = express();

app.use(
        session({
                secret: `mysecret`,
                resave:  false,
                saveUninitialized: true,
                cookie: {secure: true},
        })
);

app.use(passport.initialize());
app.use(passport.session());
//google

//facebook

const cors = require("cors");
const corsOptions = require("./ConfigFolder/CorsOptions");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT ||5000;

const { DbConnect } = require("./ConfigFolder/DBConn");

const credentials = require("./middleware/credentials");
const verifyJWt = require("./middleware/verifyJWT");

app.use(credentials); //fix error with fetch method

app.use(cors(corsOptions));

//middle ware for json
app.use(express.json());

//cookies middle ware
app.use(cookieParser());

//external router
app.use("/register", require("./router/register"));
app.use("/login", require("./router/login"));
app.use("/community", require("./router/community"));
app.use("/community-gallery", require("./router/community-gallery"));
app.use("/managment-team", require("./router/managment-team"));
app.use("/admins", require("./router/admins"));
app.use("/news", require("./router/news"));
app.use("/acheivments", require("./router/acheivments"));
app.use("/matches", require("./router/matches"));
app.use("/teams", require("./router/teams"));
app.use("/roaster", require("./router/roaster"));
app.use("/getall",require("./router/getall"));
app.use("/products",require("./router/products"));
app.use("/categories",require("./router/categories"));
app.use("/cart",require("./router/cart"));
app.use("/banner",require("./router/banner"));
app.use("/jersey",require("./router/jersey"));
app.use("/",require("./router/facebook"));
app.use("/",require("./router/google"));
app.use("/",require("./router/payment"));
app.use("/",require("./router/order"));
app.use(verifyJWt); //protect all the following routes
app.use("/verify", require("./router/verify"));
// to catch all or page is unknown
app.all("*", (req, res) => {
	res.status(404);
});

const connection = DbConnect();

connection.getConnection((err, _) => {
	if (err) {
		console.error(`server couldnt run \n ${err}`);
	} else {
		const sslServer = https.createServer(
			{
				key: fs.readFileSync(
					"/etc/letsencrypt/live/api.gamax.co/privkey.pem"
				),
				cert: fs.readFileSync("/etc/letsencrypt/live/api.gamax.co/cert.pem"),
				ca: fs.readFileSync("/etc/letsencrypt/live/api.gamax.co/fullchain.pem"),
			},
			app
		);

		sslServer.listen(PORT, () =>
			console.log(`Server running on port ${PORT}`)
		);
	}
});
