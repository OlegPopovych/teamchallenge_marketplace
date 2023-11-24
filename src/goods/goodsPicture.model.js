const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GoodsPictureSchema = new Schema({
	card_id: {
		required: true,
		type: String,
	},
	pictureId: {
		required: true,
		type: String,
	},
});

const GoodsPicture = mongoose.model('GoodsPicture', GoodsPictureSchema);

module.exports = GoodsPicture;