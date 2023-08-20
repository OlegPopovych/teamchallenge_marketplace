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
			console.log("request body is: ", req.body)
			crypto.randomBytes(16, (err, buf) => {
				if (err) {
					return reject(err);
				}
				const filename = buf.toString('hex') + path.extname(file.originalname);
				const fileInfo = {
					filename: filename,
					bucketName: 'goodsPictures'
				};
				resolve(fileInfo);
			});
		});
	}
});

const upload = multer({ storage });

goodsRoutes.get("/goods1", async (req, res) => {
	console.log(req)
	res.status(200).send({ message: "goods1 are there!" });
});


goodsRoutes.post("/goods", upload.array('goodsPicture', 3), (req, res, next) => {
	let card_id = uuid.v4();

	if (req.files) {
		let arr = req.files.map(item => {
			return {
				card_id: card_id,
				pictureId: item.id			//item.id результат роботи upload.array
			}
		})

		GoodsPicture.insertMany(arr)
			.then((data) => {
				console.log('pictures added successfully')
			})
			.catch(err => {
				res.status(500).json({
					err,
					success: false,
					message: 'Pictures uploading error!'
				})
			});
	}

	let newGoods = new Goods({
		card_id: card_id,
		author: 'example',
		author_id: 'example',
		title: 'example',
		description: req.body.description,
		price: 'example',
		category: 'example',
		condition: 'example',
		location: 'example',
		images: req.files

	});

	newGoods.save()
		.then((goods) => {
			console.log("created new goods is: ", goods)
			res.status(200).json({
				success: true,
				goods
			});
		})
		.catch(err => {
			console.log(err)
			res.status(500).json({
				err,
				success: false,
				message: 'Error creating the goods!'
			});
		});
})
	.get("/goods", (req, res, next) => {
		Goods.find({})
			.then(goods => {
				res.status(200).json({
					success: true,
					goods,
				});
			})
			.catch(err => res.status(500).json(err));
	})
	;

/* 
				GET: Fetches a particular image and render on browser
		*/
goodsRoutes.route('/image/:id')
	.get((req, res, next) => {
		gfs.find({ id: req.params.id }).toArray((err, files) => {
			if (!files[0] || files.length === 0) {
				return res.status(200).json({
					success: false,
					message: 'No files available',
				});
			}

			if (files[0].contentType === 'image/jpeg' || files[0].contentType === 'image/png' || files[0].contentType === 'image/svg+xml') {
				// render image to browser
				// gfs.openDownloadStreamByName(req.params.id).pipe(res);
				gfs.openDownloadStream(req.params.id).pipe(res);
			} else {
				res.status(404).json({
					err: 'Not an image',
				});
			}
		});
	})
	;

/*
		DELETE: Delete a particular file by an ID
*/
// imageRouter.route('/file/del/:id')
// 	.post((req, res, next) => {
// 		console.log(req.params.id);
// 		gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
// 			if (err) {
// 				return res.status(404).json({ err: err });
// 			}

// 			res.status(200).json({
// 				success: true,
// 				message: `File with ID ${req.params.id} is deleted`,
// 			});
// 		});
// 	});



module.exports = goodsRoutes;