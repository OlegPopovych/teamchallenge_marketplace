const express = require("express");
const goodsRoutes = express.Router();
const passport = require("passport");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

goodsRoutes.get("/goods", async (req, res) => {
	res.status(200).send({ message: "goods are there!" });
});

goodsRoutes.post("/goods", async (req, res) => {
	console.log(req.body)
	res.status(200).send({ message: "thanks for goods!" });
});

module.exports = goodsRoutes;