// import { v4 as uuidv4 } from "uuid";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from "@libs/lambda";
import { CreateTodoRequest } from "../../requests/CreateTodoRequest";
import { getUserId } from "../utils";
import {
  createTodo,
  // generateUploadUrl
} from "../../helpers/todos";

const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest | any = event.body;
  const userId: string = getUserId(event);
  // const imageId = uuidv4();
  // const imageUrl: { attach: string } = await generateUploadUrl(imageId);
  const newItem = await createTodo(newTodo, userId);
  return {
    statusCode: 200,
    body: JSON.stringify({ newItem }),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
};

export const main = middyfy(handler);
