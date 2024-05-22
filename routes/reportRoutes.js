const express = require("express");
const { getCostOnDate } = require("../utils/costCalculation");
const { generateReport } = require("../utils/reportGeneration");

const router = express.Router();

router.get("/cost/:id", async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  try {
    const cost = await getCostOnDate(id, date || new Date());
    res.json({ cost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/report", async (req, res) => {
  const { from, to } = req.query;

  try {
    const report = await generateReport(new Date(from), new Date(to));
    res.json({ report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
