const Token = require("./token.model");
const sendEmail = require("../../utils/sendEmail");
const crypto = require("crypto");

const addGoogleUser = (User) => ({ id, email, firstName, lastName, profilePhoto }) => {
	console.log(id, email, firstName, lastName, profilePhoto)

	const user = new User({
		id, email, firstName, lastName, profilePhoto, source: "google"
	})
	return user.save()
}

const addFacebookUser = (User) => ({ id, email, firstName, lastName, profilePhoto }) => {
	console.log(id, email, firstName, lastName, profilePhoto)

	const user = new User({
		id, email, firstName, lastName, profilePhoto, source: "facebook"
	})
	return user.save()
}

const addLocalUser = (User) => async ({ id, email, firstName, lastName, password }) => {

	let user = await User.findOne({ email });
	console.log(user)
	if (user) {
		throw new Error('User with given email already Exist!');
	}
	user = new User({ id, email, firstName, lastName, password, source: "local" }).save();

	const token = await new Token({ userId: id, token: crypto.randomBytes(32).toString("hex"), }).save();

	const url = `${process.env.BASE_URL}/auth/local/${id}/${token.token}`;

		await sendEmail(email, "Verify Email", url);

}

const getUsers = (User) => () => {
	return User.find({})
}

const getUserByEmail = (User) => async ({ email }) => {
	return await User.findOne({ email })
}

const getUserById = (User) => async ({ id }) => {
	return await User.findOne({ id })
}

module.exports = (User) => {
	return {
		addGoogleUser: addGoogleUser(User),
		addLocalUser: addLocalUser(User),
		getUsers: getUsers(User),
		getUserByEmail: getUserByEmail(User),
		getUserById: getUserById(User),
		addFacebookUser: addFacebookUser(User)
	}
}