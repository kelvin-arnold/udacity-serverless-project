import { middyfy } from "@libs/lambda";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { deleteTodo } from "../../helpers/todos";
import { getUserId } from "../utils";

const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  const response = await deleteTodo(todoId, userId);
  return {
    statusCode: 200,
    body: JSON.stringify({ response }),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
};

export const main = middyfy(handler);
