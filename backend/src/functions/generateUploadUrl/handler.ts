import { v4 as uuidv4 } from "uuid";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from "@libs/lambda";
import {
  generateUploadUrl,
  todoExists,
  updateTodoImage,
} from "../../helpers/todos";
import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";

const logger = createLogger("TodosAccess");

const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId;
  const validTodoId = await todoExists(todoId, userId);
  if (!validTodoId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Todo does not exist",
      }),
    };
  }

  const uploadUrl = await generateUploadUrl(todoId);
  logger.info("uploadUrl", { uploadUrl });
  await updateTodoImage(todoId, userId);

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
