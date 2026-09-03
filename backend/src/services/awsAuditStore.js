let s3 = null;
let PutObjectCommand = null;
try {
  const s3Sdk = require("@aws-sdk/client-s3");
  s3 = new s3Sdk.S3Client({
    region: process.env.AWS_REGION || "eu-north-1",
  });
  PutObjectCommand = s3Sdk.PutObjectCommand;
} catch (_err) {
  s3 = null;
}

async function archiveFraudEvent(result) {
  if (!s3 || !process.env.S3_BUCKET_NAME || !PutObjectCommand) {
    return null;
  }
  try {
    const key = `fraud-events/${result.txId}.json`;
    const body = JSON.stringify(result, null, 2);

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: "application/json",
      })
    );

    return key;
  } catch (err) {
    console.warn("[S3] Audit archive skipped:", err.message);
    return null;
  }
}

module.exports = { archiveFraudEvent };