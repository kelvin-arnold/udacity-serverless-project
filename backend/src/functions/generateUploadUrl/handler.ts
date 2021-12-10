import { v4 as uuidv4 } from "uuid";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from "@libs/lambda";
import { generateUploadUrl, todoExists } from "../../helpers/todos";
import { getUserId } from "../utils";

const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId;
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const validTodoId = await todoExists(todoId, userId);
  if (!validTodoId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Todo does not exist",
      }),
    };
  }
  // const userId = getUserId(event)
  const imageId = uuidv4();
  const uploadUrl = await generateUploadUrl(imageId);

  return {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl }),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  };
};

export const main = middyfy(handler);
