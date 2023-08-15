let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const goodsSchema = new Schema({
	id: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
	author_id: {
		type: String,
		required: true
	},
	dateOfPublication: {
		type: Date,
		default: new Date()
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		default: '',
	},
	price: {
		type: Number,
		required: true
	},
	category: {
		type: String,
		required: true,
	},
	condition: {
		type: String,
		required: true,
	},
	location: {
		type: String,
		required: true,
	},
	active: {
		type: Boolean,
		defatult: true,
	},
	images: {
		type: Array,
		default: []
	}
});

const goodsModel = mongoose.model("goods", goodsSchema, "goods");

module.exports = goodsModel;
