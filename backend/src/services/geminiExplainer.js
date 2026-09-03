const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function explainTransaction({ tx, fraudScore, decision, modelScores }) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

  const prompt = `You are a fraud analyst AI for PayShield, a payment fraud detection system.
Respond ONLY with valid JSON, no markdown, no backticks, no preamble.

Transaction:
- Amount: ₹${tx.amount} ${tx.currency}
- Merchant: ${tx.merchant}
- Payment method: ${tx.paymentMethod}
- Device: ${tx.deviceId}
- Memo: "${tx.memo}"
- Country: ${tx.country}

Model scores (0-1 scale): ${JSON.stringify(modelScores)}
Fraud score: ${fraudScore}/100
Decision: ${decision}

When mentioning any score or ratio in naturalLanguageExplanation, always express it as a percentage (e.g. "92% typing deviation" not "0.92 typing deviation").

Return JSON in exactly this shape:
{
  "naturalLanguageExplanation": "One short, plain-language sentence (under 20 words) a non-technical user can understand instantly — no jargon, just what happened and why",
  "topFeatures": [
    {"humanReadable": "short specific reason", "shap_value": 0.0}
  ],
  "modelContributions": {"GNN": 0.28, "LSTM": 0.22, "XGBoost": 0.20, "Biometrics": 0.15, "AML": 0.10, "BEC": 0.05},
  "modelFindings": {
    "GNN": "one sentence on what this model found",
    "LSTM": "...",
    "XGBoost": "...",
    "Biometrics": "...",
    "AML": "...",
    "BEC": "..."
  }
}
topFeatures should have 3-5 items, positive shap_value = risk-increasing, negative = risk-reducing.`;

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const raw = result.response.text().trim();
      const cleaned = raw.replace(/^```json\s*|\s*```$/g, "").replace(/^```\s*|\s*```$/g, "");
      return JSON.parse(cleaned);
    } catch (err) {
      const isRetryable = err.message?.includes("503") || err.message?.includes("high demand");
      if (isRetryable && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, attempt * 800));
        continue;
      }
      throw err;
    }
  }
}

module.exports = { explainTransaction };