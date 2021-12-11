import * as aws from "aws-sdk";
import * as xray from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import { createLogger } from "../utils/logger";

const logger = createLogger("TodosAccess");

const xray_aws = xray.captureAWS(aws);

class Todos {
  constructor(
    private readonly db: DocumentClient = new xray_aws.DynamoDB.DocumentClient(),
    private readonly table: string = process.env.TODOS_TABLE,
    private readonly bucket = process.env.ATTACHMENT_S3_BUCKET,
    private readonly userIdIndex: string = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info("Get todos query", {
      userId,
    });
    const result = await this.db
      .query({
        TableName: this.table,
        IndexName: this.userIdIndex,
        KeyConditionExpression: "userId = :u",
        ExpressionAttributeValues: {
          ":u": userId,
        },
      })
      .promise();

    const items = result.Items;
    return items as TodoItem[];
  }

  async createTodos(newItem: TodoItem): Promise<TodoItem> {
    logger.info("Create todo item", {
      ...newItem,
    });
    await this.db
      .put({
        Item: { ...newItem },
        TableName: this.table,
      })
      .promise();
    return newItem;
  }

  async deleteTodo(todoId: string, userId: string): Promise<string> {
    logger.info("Delete todo item", {
      todoId,
      userId,
    });
    await this.db
      .delete({
        TableName: this.table,
        Key: {
          userId,
          todoId,
        },
      })
      .promise();

    return todoId;
  }

  async updateTodo(
    newItem: TodoUpdate,
    todoId: string,
    userId: string
  ): Promise<string> {
    logger.info("Update todo item", {
      ...newItem,
      todoId,
      userId,
    });
    await this.db
      .update({
        TableName: this.table,
        Key: {
          userId,
          todoId,
        },
        ExpressionAttributeNames: {
          "#todo_name": "name",
        },
        ExpressionAttributeValues: {
          ":name": newItem.name,
          ":dueDate": newItem.dueDate,
          ":done": newItem.done,
        },
        UpdateExpression: "SET #todo_name=:name, dueDate=:dueDate, done=:done",
      })
      .promise();

    return todoId;
  }

  async todoExists(todoId: string, userId: string): Promise<boolean> {
    const result = await this.db
      .get({
        Key: {
          todoId,
          userId,
        },
        TableName: this.table,
      })
      .promise();
    return !!result.Item;
  }
  async updateTodoImage(todoId: string, userId: string): Promise<string> {
    logger.info("Update todo image: ", {
      todoId,
      userId,
    });
    const url = `https://${this.bucket}.s3.amazonaws.com/${todoId}`;
    await this.db
      .update({
        TableName: this.table,
        Key: {
          userId: userId,
          todoId: todoId,
        },
        ExpressionAttributeNames: {
          "#todo_attachmentUrl": "attachmentUrl",
        },
        ExpressionAttributeValues: {
          ":attachmentUrl": url,
        },
        UpdateExpression: "SET #todo_attachmentUrl = :attachmentUrl",
        ReturnValues: "ALL_NEW",
      })
      .promise();

    return url;
  }
}

export { Todos };

// TODO: Implement the dataLayer logic
