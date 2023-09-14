let mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
let Schema = mongoose.Schema;

const goodsSchema = new Schema({
	card_id: {
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
		default: 'default description',
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
		// required: true,
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

goodsSchema.plugin(mongoosePaginate);

const goodsModel = mongoose.model("goods", goodsSchema, "goods");

module.exports = goodsModel;
