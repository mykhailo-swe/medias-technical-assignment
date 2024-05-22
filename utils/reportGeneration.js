const { Invoice, InvoiceProduct } = require("../models");
const { Op } = require("sequelize");

async function generateReport(fromDate, toDate) {
  try {
    const invoices = await Invoice.findAll({
      where: {
        date: { [Op.between]: [fromDate, toDate] },
      },
      include: [InvoiceProduct],
    });

    const report = invoices.map((invoice) => ({
      id: invoice.id,
      date: invoice.date,
      type: invoice.type,
      products: invoice.InvoiceProducts.map((product) => ({
        productId: product.productId,
        price: product.price,
        quantity: product.quantity,
      })),
    }));

    return report;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = {
  generateReport,
};
