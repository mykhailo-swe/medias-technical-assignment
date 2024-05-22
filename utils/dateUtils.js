const moment = require("moment");

function getStartOfMonth(date) {
  return moment(date).startOf("month").toDate();
}

module.exports = {
  getStartOfMonth,
};
