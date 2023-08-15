let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const userSchema = new Schema({
	id: {
		type: String,
		default: '',
	},
	email: {
		type: String,
		default: '',
	},
	firstName: {
		type: String,
		default: '',
	},
	lastName: {
		type: String,
		default: '',
	},
	profilePhoto: {
		type: String,
		default: '',
	},
	password: {
		type: String,
		default: '',
	},
	source: {
		type: String,
		required: [true, "source not specified"]
	},
	lastVisited: {
		type: Date,
		default: new Date()
	},
	verified: {
		type: Boolean,
		default: false
	},
});

const userModel = mongoose.model("user", userSchema, "user");

module.exports = userModel;
