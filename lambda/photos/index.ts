import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler = async () => {
  const command = new ScanCommand({
    TableName: process.env.TABLE_NAME,
  });

  const response = await documentClient.send(command);

  const photos = (response.Items ?? []).map((item) => ({
    title: item.title,
    imageUrl: `https://${process.env.CLOUDFRONT_DOMAIN}/${item.key}`,
  }));

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(photos),
  };
};
