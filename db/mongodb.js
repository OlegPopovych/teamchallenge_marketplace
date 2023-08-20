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

const mongoose = require("mongoose");

const url = process.env.MONGO_URI;

const connect = mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

connect
	.then((db) => {
		console.log("connected to db");
	})
	.catch((err) => {
		console.log(err);
	});

	// module.exports = connect;