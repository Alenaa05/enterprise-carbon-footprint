import AWS from "aws-sdk";

const client = new AWS.S3({ region: process.env.AWS_REGION || "us-east-1" });

export const s3PutObject = async (bucket: string, key: string, body: Buffer | string) => {
  return client.putObject({ Bucket: bucket, Key: key, Body: body }).promise();
};

export const s3GetObject = async (bucket: string, key: string) => {
  return client.getObject({ Bucket: bucket, Key: key }).promise();
};

export const s3Client = client;
