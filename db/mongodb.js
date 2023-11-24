const mongoose = require("mongoose");

const url = process.env.MONGO_URI;

const connect = mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

connect
	.then(() => {
		console.log("connected to db");
	})
	.catch((err) => {
		console.log(err);
	});
