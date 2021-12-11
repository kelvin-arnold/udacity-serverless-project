import * as aws from "aws-sdk";
import * as xray from "aws-xray-sdk";
import { createLogger } from "../utils/logger";

const logger = createLogger("TodosAccess");
const xray_aws = xray.captureAWS(aws);

const s3 = new xray_aws.S3({
  signatureVersion: "v4",
});

// TODO: Implement the fileStogare logic

class AttachmentUtils {
  constructor(
    private readonly bucketName: string = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration: string = process.env.SIGNED_URL_EXPIRATION
  ) {}

  async getUploadUrl(todoId: string) {
    logger.info("Upload url", {
      todoId,
    });
    return s3.getSignedUrl("putObject", {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: parseInt(this.urlExpiration),
    });
  }
}

export { AttachmentUtils };
