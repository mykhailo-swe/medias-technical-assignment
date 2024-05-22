"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Invoice.hasMany(models.InvoiceProduct, { foreignKey: "documentId" });
    }
  }
  Invoice.init(
    {
      date: DataTypes.DATE,
      type: DataTypes.ENUM("incoming", "outgoing"),
    },
    {
      sequelize,
      modelName: "Invoice",
    }
  );
  return Invoice;
};
