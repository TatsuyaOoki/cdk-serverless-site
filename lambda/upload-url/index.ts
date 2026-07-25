import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({});

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const body = JSON.parse(event.body ?? "{}");

  const key = `photos/${crypto.randomUUID()}-${body.fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ContentType: body.contentType, // 画像のContent-Typeも指定
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: 300,
  });

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uploadUrl,
      imageUrl: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${key}`,
      key,
    }),
  };
};
