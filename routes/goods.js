const express = require("express");
const goodsRoutes = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const path = require('path');
const multer = require('multer');
const uuid = require("uuid");
const url = process.env.MONGO_URI;
const Goods = require('../src/goods/goods.model');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const validation = require('../utils/additional_data_processing').validationGoodsAddData;

const conn = mongoose.createConnection(url, { useNewUrlParser: true, useUnifiedTopology: true });

let gfs;

conn.once('open', () => {
	// initialize stream
	gfs = new mongoose.mongo.GridFSBucket(conn.db, {
		bucketName: "goodsPictures"
	})
});

const deleteImg = (arr) => {
	for (let item of arr) {

		gfs.delete(new mongoose.Types.ObjectId(item.id), (err) => {
			if (err) {
				console.log(`ERROR image ${item.id} did not delete. Error: ${err}`)
			}
		})

		console.log(`File with ID ${item.id} is deleted`)
	}
}

/*
		GridFs Configuration
*/

// create storage engine
const storage = new GridFsStorage({
	url: url,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
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
				return reject(new TypeError(`Validation files error`));
			}
		});
	}
});

const upload = multer({
	storage,
	limits: { fileSize: 6291456 },
	fileFilter: function (req, file, cb) {
		cb(null, validation(req.body))
	}
});

goodsRoutes.post("/goods", upload.array('goodsPicture', 4), (req, res) => {
	let card_id = uuid.v4();

	if (req.files) {
		// let arr = req.files.map(item => {
		// 	return {
		// 		card_id: card_id,
		// 		pictureId: item.id			//item.id результат роботи upload.array
		// 	}
		// })

		// if (req.files.length > 0) {
		// 	GoodsPicture.insertMany(arr) //save pictures in db
		// 		.then((data) => {
		// 			console.log('GoodsPicture added successfully')
		// 		})
		// 		.catch(err => {
		// 			console.log("GoodsPicture error", err)
		// 		});
		// }

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

		newGoods.save()  //save new goods in db
			.then((goods) => {
				console.log("created new goods is: ", goods)

				res.status(200).json({
					success: true,
					goods
				});
			})
			.catch(err => {
				console.log("newGoods err.message: ", err.message)

				res.status(400).json({
					success: false,
					message: `Validation error, ${err.message}`
				});
			});
	}
})

	.get("/goods/:card_id", (req, res) => {
		Goods.find({ card_id: req.params.card_id })
			.then(goods => {
				if (goods.length === 0) {
					res.status(204).send();
					return;
				}

				res.status(200).json({
					success: true,
					goods,
				});
			})
			.catch(err => res.status(500).json(err));
	})

	.get("/pages/goods", (req, res) => {
		const { page, limit, title, category, filer_float_price_from, filer_float_price_to, filer_float_data_from, filer_float_data_to } = req.query;

		const options = {
			page: page ? page : 1,
			limit: limit ? limit : 3,
		};

		let condition = {};

		if (title) {
			condition.title = { $regex: new RegExp(title), $options: "i" };
		}

		if (category) {
			condition.category = category;
		}

		if (filer_float_price_from) {
			condition.price = { $gte: filer_float_price_from };
		}

		if (filer_float_price_to) {
			condition.price = { $lte: filer_float_price_to };
		}

		if (filer_float_data_from) {
			condition.dateOfPublication = { $gte: new Date(filer_float_data_from) }; //include and greater then
		}

		if (filer_float_data_to) {
			condition.dateOfPublication = { $lt: new Date(filer_float_data_to) }; //lower then
		}

		Goods.paginate(condition, options)
			.then(data => {
				if (data.docs.length === 0) {
					res.status(204).send();
				}

				res.status(200).json({
					success: true,
					data,
				});
			})
			.catch(err => res.status(500).json(err));
	})

	.delete("/goods/:card_id", (req, res) => {
		console.log(req.params.card_id)

		Goods.find({ card_id: req.params.card_id })
			.then(goods => {
				if (goods.length === 0) {
					res.status(204).send();
					return;
				}
				Goods.findOneAndDelete({ card_id: req.params.card_id })
					.then(data => {
						if (!data) {
							res.status(500).send({
								message: `Cannot delete Tutorial with card_id=${req.params.card_id}. Maybe goods was not found!`,
							});
						} else {
							res.send({
								success: true,
								message: `Goods with card_id=${req.params.card_id} was deleted successfully!`,
							});
						}
					})

				deleteImg(goods[0].images)
			})
			.catch(err => { res.status(500).json(err) });
	})

	// .put("/goods/update/:card_id/:author_id", (req, res, next) => {
	// 	Goods.find({})
	// 		.then(goods => {
	// 			// let preViewArr = goods.map(item => {
	// 			// 	return {
	// 			// 		card_id: item.card_id,
	// 			// 		author: 'example',
	// 			// 		author_id: 'example',
	// 			// 		title: 'example',
	// 			// 		description: req.body.description,
	// 			// 		price: 'example',
	// 			// 		category: 'example',
	// 			// 		condition: 'example',
	// 			// 		location: 'example',
	// 			// 		images: req.files[0]
	// 			// 	}
	// 			// })
	// 			res.status(200).json({
	// 				success: true,
	// 				goods,
	// 			});
	// 		})
	// 		.catch(err => {
	// 			console.log(err),
	// 				res.status(500).json(err)
	// 		}
	// 		);
	// })
	;

/*
 GET: Fetches a particular image and render on browser
*/
goodsRoutes.route('/image/:filename')
	.get((req, res) => {
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
// goodsRoutes.route('/image/del/:id')
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
