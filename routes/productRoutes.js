const express = require("express");
const { Product } = require("../models");

const router = express.Router();

router.post("/products", async (req, res) => {
  try {
    const { name } = req.body;
    const product = await Product.create({ name });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
