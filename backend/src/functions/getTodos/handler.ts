import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from "@libs/lambda";
import { getTodosForUser } from "../../helpers/todos";
import { getUserId } from "../utils";

const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);
  const todos = await getTodosForUser(userId);
  return {
    statusCode: 200,
    body: JSON.stringify(todos),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
};

export const main = middyfy(handler);
