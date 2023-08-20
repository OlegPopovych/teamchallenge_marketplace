const express = require("express");
const goodsRoutes = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const path = require('path');
const passport = require("passport");
const multer = require('multer');
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const url = process.env.MONGO_URI;
const GoodsPicture = require('../src/goods/goodsPicture.model');
const Goods = require('../src/goods/goods.model');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');


const connect = mongoose.createConnection(url, { useNewUrlParser: true, useUnifiedTopology: true });

let gfs;

connect.once('open', () => {
	// initialize stream
	gfs = new mongoose.mongo.GridFSBucket(connect.db, {
		bucketName: "uploads"
	});
});

/* 
		GridFs Configuration
*/

// create storage engine
const storage = new GridFsStorage({
	url: url,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			crypto.randomBytes(16, (err, buf) => {
				if (err) {
					return reject(err);
				}
				const filename = buf.toString('hex') + path.extname(file.originalname);
				const fileInfo = {
					filename: filename,
					bucketName: 'uploads'
				};
				resolve(fileInfo);
			});
		});
	}
});

const upload = multer({ storage });

goodsRoutes.post("/goods1", async (req, res) => {
	console.log(req)
	res.status(200).send({ message: "goods1 are there!" });
});


goodsRoutes.post("/goods2", upload.array('pictures', 3), (req, res, next) => {
	console.log(req.body, req.files)
	res.status(200).send({ message: "goods2 are there!" });
	// if (req.files) {
	// 	let arr = req.files.map(item => {
	// 		return {
	// 			cardId: req.body.cardId,
	// 			pictureId: item.id                 //item.id результат роботи upload.array
	// 		}
	// 	})
	// 	GoodsPicture.insertMany(arr, function (error, docs) { });
	// }
	// res.status(200).json({
	// 	success: true,
	// message: `${req.files.length} files uploaded successfully`,
	// files: req.files
	// });
});


module.exports = goodsRoutes;