const express = require("express");
const { Invoice, InvoiceProduct } = require("../models");
const {
  calculateAverageCost,
  calculateCurrentStock,
  updateCostsForRetroactiveInvoices,
} = require("../utils/costCalculation");

const router = express.Router();

router.post("/arrivals", async (req, res) => {
  const { date, products } = req.body;
  try {
    const newInvoice = await Invoice.create({ date, type: "incoming" });

    const invoiceProducts = products.map((product) => ({
      documentId: newInvoice.id,
      productId: product.productId,
      price: product.price,
      quantity: product.quantity,
    }));

    await InvoiceProduct.bulkCreate(invoiceProducts);

    const responseInvoice = {
      id: newInvoice.id,
      date: newInvoice.date,
      products: products.map((product) => ({
        productId: product.productId,
        price: product.price,
        quantity: product.quantity,
      })),
    };

    res.json({
      message: "Incoming invoice processed successfully",
      invoice: responseInvoice,
    });

    for (const product of products) {
      await calculateAverageCost(product.productId, date);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  const { date, products } = req.body;
  try {
    const newInvoice = await Invoice.create({ date, type: "outgoing" });

    for (const product of products) {
      const currentStock = await calculateCurrentStock(product.productId);
      if (currentStock < product.quantity) {
        return res.status(400).json({
          error: `Not enough stock for product ID ${product.productId}`,
        });
      }
    }

    const invoiceProducts = products.map((product) => ({
      documentId: newInvoice.id,
      productId: product.productId,
      price: product.price,
      quantity: product.quantity,
    }));

    await InvoiceProduct.bulkCreate(invoiceProducts);

    const responseInvoice = {
      id: newInvoice.id,
      date: newInvoice.date,
      products: products.map((product) => ({
        productId: product.productId,
        price: product.price,
        quantity: product.quantity,
      })),
    };

    res.json({
      message: "Outgoing invoice processed successfully",
      invoice: responseInvoice,
    });

    for (const product of products) {
      await calculateAverageCost(product.productId, date);
    }

    if (new Date(date) < new Date()) {
      for (const product of products) {
        await updateCostsForRetroactiveInvoices(product.productId, date);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
