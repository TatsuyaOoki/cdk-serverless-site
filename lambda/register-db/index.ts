import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> => {
  const body = JSON.parse(event.body ?? "{}");

  const id = crypto.randomUUID();

  const command = new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      id,
      title: body.fileName,
      key: body.key,
      createdAt: new Date().toISOString(),
    },
  });

  await documentClient.send(command);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "DB登録完了",
    }),
  };
};
