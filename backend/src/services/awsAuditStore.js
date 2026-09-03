const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
});

async function archiveFraudEvent(result) {
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
}

module.exports = { archiveFraudEvent };