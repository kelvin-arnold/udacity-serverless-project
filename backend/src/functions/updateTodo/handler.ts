import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from "@libs/lambda";
import { getUserId } from "../utils";
import { updateTodo } from "../../helpers/todos";
import { UpdateTodoRequest } from "../../requests/UpdateTodoRequest";

const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const updatedTodo: UpdateTodoRequest | any = event.body;
  const userId = getUserId(event);
  const response = await updateTodo(
    {
      ...updatedTodo,
    },
    todoId,
    userId
  );
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
