require("dotenv").config();
const User = require("./src/user/user.model");
const Token = require("./src/user/token.model");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const UserService = require("./src/user");

const userRoutes = require("./routes/user");
const goodsRoutes = require("./routes/goods");

require("./db/mongodb");
require("./src/auth_config/passport");
require("./src/auth_config/local");
require("./src/auth_config/google");
require("./src/auth_config/facebook");

// const mongodbUri = process.env.MONGO_URI;

// mongoose.connect(
// 	mongodbUri,
// 	{
// 		useUnifiedTopology: true,
// 		useNewUrlParser: true,
// 		useFindAndModify: false,
// 		useCreateIndex: true,
// 	},
// 	(error) => {
// 		if (error) console.log("DB connection ERROR: ", error);
// 	}
// );

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

// //credential sign up
// app.post("/auth/local/signup", async (req, res) => {
// 	const { first_name, last_name, email, password } = req.body

// 	if (!email) {
// 		res.statusCode = 500;
// 		res.send({
// 			message: "Account not created. Email field empty",
// 		})
// 		return;
// 	}

// 	if (password.length < 8) {
// 		res.statusCode = 500;
// 		res.send({
// 			message: "Account not created. Password must be 7+ characters long",
// 		})
// 		return;
// 	}

// 	const hashedPassword = await bcrypt.hash(password, 10)

// 	try {
// 		await UserService.addLocalUser({
// 			id: uuid.v4(),
// 			email,
// 			firstName: first_name,
// 			lastName: last_name,
// 			password: hashedPassword
// 		}).then(() => {
// 			res.status(201).send({ message: "An Email sent to your account please verify" });
// 		})

// 	} catch (e) {
// 		res.statusCode = 409;
// 		res.send({ message: e.message })
// 	}
// });

// app.get("/auth/local/:id/:token/", async (req, res) => {
// 	try {
// 		const user = await User.findOne({ id: req.params.id });
// 		if (!user) return res.status(400).send({ message: "Invalid link" });

// 		const token = await Token.findOne({
// 			userId: user.id,
// 			token: req.params.token,
// 		});
// 		if (!token) return res.status(400).send({ message: "Invalid link" });

// 		try {
// 			console.log(req.params.id)
// 			await User.updateOne({ id: req.params.id }, { verified: true });
// 		} catch (error) {
// 			throw new Error(error.message)
// 		}
// 		try {
// 			await token.remove();
// 		} catch (error) {
// 			throw new Error(error.message)
// 		}



// 		res.status(200).send({ message: "Email verified successfully" });
// 	} catch (error) {
// 		res.status(500).send({ message: "Internal Server Error" });
// 	}
// });



//protected route
app.get("/profile", isLoggedIn, (req, res) => {
	res.send({ user: req.user });
});

// //local sign in
// app.post("/auth/local/signin",
// 	passport.authenticate("local", {
// 		// failureRedirect: '/',
// 		// failureMessage: "
// 	}),
// 	function (req, res) {
// 		let data = {
// 			id: req.user.id,
// 			lastVisited: req.user.lastVisited,
// 			email: req.user.email,
// 			firstName: req.user.firstName,
// 			lastName: req.user.lastName,
// 			source: req.user.source
// 		}
// 		res.status(200).send(data);
// 	}
// );

//start auth socials
// app.get('/login/facebook', passport.authenticate('facebook'));
// app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], }));

// //callbacks 
// app.get(
// 	"/auth/google/callback",
// 	passport.authenticate("google", {
// 		// failureRedirect: "",
// 		// successRedirect: "",
// 	}),
// 	function (req, res) {
// 		let data = {
// 			id: req.user.id,
// 			lastVisited: req.user.lastVisited,
// 			email: req.user.email,
// 			firstName: req.user.firstName,
// 			lastName: req.user.lastName,
// 			profilePhoto: req.user.profilePhoto,
// 			source: req.user.source
// 		}
// 		res.status(200).send(data);
// 	}
// );

// app.get(
// 	"/auth/facebook/callback",
// 	passport.authenticate("facebook", {
// 		failureRedirect: "/",
// 		// successRedirect: ",
// 	}),
// 	function (req, res) {
// 		let data = {
// 			id: req.user.id,
// 			lastVisited: req.user.lastVisited,
// 			email: req.user.email,
// 			firstName: req.user.firstName,
// 			lastName: req.user.lastName,
// 			profilePhoto: req.user.profilePhoto,
// 			source: req.user.source
// 		}
// 		res.status(200).send(data);
// 	}
// );

// //logout
// app.get("/auth/logout", (req, res) => {
// 	req.session.destroy(function () {
// 		res.clearCookie("connect.sid");
// 		res.send({ success: true });
// 	});
// });

var port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

app.listen(port, function () {
	console.log(`SaaSBase Authentication Server listening on port ${port}`);
});