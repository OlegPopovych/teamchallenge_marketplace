require("dotenv").config();

const cors = require("cors");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");

const userRoutes = require("./routes/user");
const goodsRoutes = require("./routes/goods");

require("./db/mongodb");
require("./src/auth_config/passport");
require("./src/auth_config/local");
require("./src/auth_config/google");
require("./src/auth_config/facebook");

const whitelist = process.env.WHITELISTED_DOMAINS
	? process.env.WHITELISTED_DOMAINS.split(",")
	: [];

const corsOptions = {
	origin: function (origin, callback) {
		if (!origin || whitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},

	credentials: true,
};

app.enable('trust proxy');

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

app.use(cookieParser());
app.use(
	session({
		secret: "secr3t1",
		resave: false,
		saveUninitialized: true,
		cookie: { maxAge: 1800000 }
	})
);


app.use(passport.initialize());
app.use(passport.session());

const isLoggedIn = (req, res, next) => {
	req.user ? next() : res.sendStatus(401);
};


app.use(userRoutes);
app.use(goodsRoutes);
// app.use(isLoggedIn, goodsRoutes);


//protected route example
app.get("/test", isLoggedIn, (req, res) => {
	res.send({ user: req.user });
});

app.use((err, req, res) => {
	console.error(err.message)
	if (err instanceof TypeError) {
		res.status(400).send({
			success: false,
			message: err.message
		})
	}
	// res.status(500).send(err)
})

var port = process.env.PORT || process.env.VCAP_APP_PORT || 3005;

app.listen(port, function () {
	console.log(`SaaSBase Authentication Server listening on port ${port}`);
});
