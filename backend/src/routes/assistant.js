const express = require("express");
const Transaction = require("../models/Transaction");
const FraudAlert = require("../models/FraudAlert");

const router = express.Router();

let genAI = null;
try {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (_err) {
  genAI = null;
}

router.post("/ask", async (req, res) => {
  try {
    const { question, txId } = req.body;
    const tx = txId ? Transaction.findById(txId) : null;
    const recentAlerts = FraudAlert.rows.slice(-10);

    if (!genAI) {
      return res.json({
        answer: `PayShield Rule Engine: Transaction ${tx ? tx.txId : "N/A"} evaluated with fraud score ${tx ? tx.fraudScore : 0}/100 and decision ${tx ? tx.decision : "cleared"}.`,
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const prompt = `You are PayShield's fraud investigation assistant, speaking to a security analyst.
${tx ? `Selected transaction: ${JSON.stringify(tx)}` : `No transaction selected. Recent alerts: ${JSON.stringify(recentAlerts)}`}
Analyst question: "${question}"
Answer in exactly 1 short sentence, under 20 words. Be direct — reference the actual data above, no filler. Express any scores or ratios as percentages, not decimals (e.g. "92%" not "0.92").`;

    const result = await model.generateContent(prompt);
    res.json({ answer: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;