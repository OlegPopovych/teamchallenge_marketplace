const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GoodsPictureSchema = new Schema({
	cardId: {
		required: true,
		type: String,
	},
	pictureId: {
		required: true,
		type: String,
	},


	// fileId: {
	//     required: true,
	//     type: String,
	// },
	// createdAt: {
	//     default: Date.now(),
	//     type: Date,
	// },
});

const GoodsPicture = mongoose.model('GoodsPicture', GoodsPictureSchema);

module.exports = GoodsPicture;