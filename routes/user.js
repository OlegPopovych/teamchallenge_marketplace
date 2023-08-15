const express = require("express");
const userRoutes = express.Router();
const passport = require("passport");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const User = require("../src/user/user.model");
const Token = require("../src/user/token.model");
const UserService = require("../src/user");

//credential sign up
userRoutes.post("/auth/local/signup", async (req, res) => {
	const { first_name, last_name, email, password } = req.body

	if (!email) {
		res.statusCode = 500;
		res.send({
			message: "Account not created. Email field empty",
		})
		return;
	}

	if (password.length < 8) {
		res.statusCode = 500;
		res.send({
			message: "Account not created. Password must be 7+ characters long",
		})

		return;
	}

	const hashedPassword = await bcrypt.hash(password, 10)

	try {
		await UserService.addLocalUser({
			id: uuid.v4(),
			email,
			firstName: first_name,
			lastName: last_name,
			password: hashedPassword
		}).then(() => {
			res.status(201).send({ message: "An Email sent to your account please verify" });
		})

	} catch (e) {
		res.statusCode = 409;
		res.send({ message: e.message })
	}
});

userRoutes.get("/auth/local/:id/:token/", async (req, res) => {
	try {
		const user = await User.findOne({ id: req.params.id });

		if (!user) return res.status(400).send({ message: "Invalid link" });

		const token = await Token.findOne({
			userId: user.id,
			token: req.params.token,
		});
		if (!token) return res.status(400).send({ message: "Invalid link" });

		try {
			console.log(req.params.id)
			await User.updateOne({ id: req.params.id }, { verified: true });
		} catch (error) {
			throw new Error(error.message)
		}
		try {
			await token.remove();
		} catch (error) {
			throw new Error(error.message)
		}

		res.status(200).send({ message: "Email verified successfully" });
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});


//local sign in
userRoutes.post("/auth/local/signin",
	passport.authenticate("local", {
		// failureRedirect: '/',
		// failureMessage: "
	}),
	function (req, res) {
		let data = {
			id: req.user.id,
			profilePhoto: req.user.profilePhoto,
			lastVisited: req.user.lastVisited,
			email: req.user.email,
			firstName: req.user.firstName,
			lastName: req.user.lastName,
			source: req.user.source,
			verified: req.user.verified
		}
		res.status(200).send(data);
	}
);

userRoutes.get('/login/facebook', passport.authenticate('facebook'));
userRoutes.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"], }));

//callbacks 
userRoutes.get(
	"/auth/google/callback",
	passport.authenticate("google", {
		// failureRedirect: "",
		// successRedirect: "",
	}),
	function (req, res) {
		let data = {
			id: req.user.id,
			lastVisited: req.user.lastVisited,
			email: req.user.email,
			firstName: req.user.firstName,
			lastName: req.user.lastName,
			profilePhoto: req.user.profilePhoto,
			source: req.user.source,
			verified: req.user.verified
		}
		res.status(200).send(data);
	}
);

userRoutes.get(
	"/auth/facebook/callback",
	passport.authenticate("facebook", {
		failureRedirect: "/",
		// successRedirect: ",
	}),
	function (req, res) {
		let data = {
			id: req.user.id,
			lastVisited: req.user.lastVisited,
			email: req.user.email,
			firstName: req.user.firstName,
			lastName: req.user.lastName,
			profilePhoto: req.user.profilePhoto,
			source: req.user.source
		}
		res.status(200).send(data);
	}
);

//logout
userRoutes.get("/auth/logout", (req, res) => {
	req.session.destroy(function () {
		res.clearCookie("connect.sid");
		res.send({ success: true });
	});
});


module.exports = userRoutes;