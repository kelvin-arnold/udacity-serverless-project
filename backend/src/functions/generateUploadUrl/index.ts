import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "post",
        path: "todos/{todoId}/attachment",
        cors: true,
        authorizer: "auth",
      },
    },
  ],
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: ["dynamodb:GetItem", "dynamodb:Update*"],
      Resource:
        "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/${self:provider.environment.TODOS_TABLE}",
    },
    {
      Effect: "Allow",
      Action: ["s3:PutObject", "s3:GetObject"],
      Resource:
        "arn:aws:s3:::${self:provider.environment.ATTACHMENT_S3_BUCKET}/*",
    },
  ],
};
