const express = require("express");
const productRoutes = require("./productRoutes");
const invoiceRoutes = require("./invoiceRoutes");
const reportRoutes = require("./reportRoutes");

const router = express.Router();

router.use(productRoutes);
router.use(invoiceRoutes);
router.use(reportRoutes);

module.exports = router;
