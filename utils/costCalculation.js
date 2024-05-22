const { Invoice, InvoiceProduct, Cost } = require("../models");
const { Op } = require("sequelize");
const { getStartOfMonth } = require("./dateUtils");

async function calculateCurrentStock(productId) {
  try {
    const incomingInvoiceProducts = await InvoiceProduct.findAll({
      where: {
        productId,
        "$Invoice.type$": "incoming",
      },
      include: [Invoice],
    });

    const outgoingInvoiceProducts = await InvoiceProduct.findAll({
      where: {
        productId,
        "$Invoice.type$": "outgoing",
      },
      include: [Invoice],
    });

    const totalIncomingQuantity = incomingInvoiceProducts.reduce(
      (acc, invProduct) => acc + invProduct.quantity,
      0
    );
    const totalOutgoingQuantity = outgoingInvoiceProducts.reduce(
      (acc, invProduct) => acc + invProduct.quantity,
      0
    );

    return totalIncomingQuantity - totalOutgoingQuantity;
  } catch (error) {
    console.error(
      `Error calculating current stock for productId=${productId}: ${error}`
    );
    throw error;
  }
}

async function calculateAverageCost(productId, currentDate) {
  try {
    const startOfMonth = getStartOfMonth(currentDate);

    const incomingInvoiceProducts = await InvoiceProduct.findAll({
      where: {
        productId,
        "$Invoice.date$": { [Op.gte]: startOfMonth },
        "$Invoice.type$": "incoming",
      },
      include: [Invoice],
    });

    const totalIncomingQuantity = incomingInvoiceProducts.reduce(
      (acc, invProduct) => acc + invProduct.quantity,
      0
    );
    const totalIncomingValue = incomingInvoiceProducts.reduce(
      (acc, invProduct) => acc + invProduct.price * invProduct.quantity,
      0
    );

    const latestCostEntry = await Cost.findOne({
      where: { productId },
      order: [["date", "DESC"]],
    });

    const previousMonthStock = latestCostEntry
      ? latestCostEntry.value *
        (await getPreviousMonthStock(productId, startOfMonth))
      : 0;

    const totalStock =
      (await calculateCurrentStock(productId)) + totalIncomingQuantity;
    const totalValue = previousMonthStock + totalIncomingValue;

    const averageCost = totalStock > 0 ? totalValue / totalStock : 0;

    await Cost.create({
      productId,
      date: startOfMonth,
      value: averageCost,
    });

    return averageCost;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getPreviousMonthStock(productId, startOfMonth) {
  try {
    const incomingInvoiceProducts = await InvoiceProduct.findAll({
      where: {
        productId,
        "$Invoice.date$": { [Op.lt]: startOfMonth },
        "$Invoice.type$": "incoming",
      },
      include: [Invoice],
    });

    const outgoingInvoiceProducts = await InvoiceProduct.findAll({
      where: {
        productId,
        "$Invoice.date$": { [Op.lt]: startOfMonth },
        "$Invoice.type$": "outgoing",
      },
      include: [Invoice],
    });

    const totalIncomingQuantity = incomingInvoiceProducts.reduce(
      (acc, invProduct) => acc + invProduct.quantity,
      0
    );
    const totalOutgoingQuantity = outgoingInvoiceProducts.reduce(
      (acc, invProduct) => acc + invProduct.quantity,
      0
    );

    return totalIncomingQuantity - totalOutgoingQuantity;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function updateCostsForRetroactiveInvoices(productId, invoiceDate) {
  try {
    const startOfMonth = getStartOfMonth(invoiceDate);

    await calculateAverageCost(productId, startOfMonth);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getCostOnDate(productId, targetDate) {
  try {
    const costEntry = await Cost.findOne({
      where: {
        productId,
        date: { [Op.lte]: targetDate },
      },
      order: [["date", "DESC"]],
    });

    if (costEntry) {
      return costEntry.value;
    } else {
      return 0; // or any default value if no cost is found
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  calculateCurrentStock,
  calculateAverageCost,
  getCostOnDate,
  updateCostsForRetroactiveInvoices,
};
