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

const conn = mongoose.createConnection(url, { useNewUrlParser: true, useUnifiedTopology: true });

let gfs;

conn.once('open', () => {
	// initialize stream
	gfs = new mongoose.mongo.GridFSBucket(conn.db, {
		bucketName: "goodsPictures"
	})
});

/* 
		GridFs Configuration
*/

// create storage engine
const storage = new GridFsStorage({
	url: url,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			console.log(file)

			if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
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
			} else {
				return reject('wrong format');
			}

		});
	}
});

const upload = multer({ storage, limits: { fileSize: 6291456 } });

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
		author: req.body.author,
		author_id: req.body.author_id,
		title: req.body.title,
		description: req.body.description,
		price: parseInt(req.body.price),
		category: req.body.category,
		condition: req.body.condition,
		location: req.body.location,
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
				// let preViewArr = goods.map(item => {
				// 	return {
				// 		card_id: item.card_id,
				// 		author: 'example',
				// 		author_id: 'example',
				// 		title: 'example',
				// 		description: req.body.description,
				// 		price: 'example',
				// 		category: 'example',
				// 		condition: 'example',
				// 		location: 'example',
				// 		images: req.files[0]
				// 	}
				// })
				res.status(200).json({
					success: true,
					goods,
				});
			})
			.catch(err => {
				console.log(err),
				res.status(500).json(err)
			}
				);
	})
	.get("/goods/:card_id", (req, res, next) => {
		Goods.find({card_id: req.params.card_id})
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
goodsRoutes.route('/image/:filename')
	.get((req, res, next) => {
		gfs.find({ filename: req.params.filename }).toArray((err, files) => {
			if (!files[0] || files.length === 0) {
				return res.status(200).json({
					success: false,
					message: 'No files available',
				});
			}

			if (files[0].contentType === 'image/jpeg' || files[0].contentType === 'image/png' || files[0].contentType === 'image/svg+xml') {
				// render image to browser
				gfs.openDownloadStreamByName(req.params.filename).pipe(res);
			} else {
				res.status(404).json({
					err: 'Not an image',
				});
			}
		});
	});

	


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