import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import { middyfy } from "@libs/lambda";
import { JwtPayload } from "../../auth/JwtPayload";
import { Unauthorized } from "http-errors";
import { verify } from "jsonwebtoken";

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJMtjxFp8CkJoZMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1idWtqd3A4Ni51cy5hdXRoMC5jb20wHhcNMjExMjAyMDIxMzQ3WhcN
MzUwODExMDIxMzQ3WjAkMSIwIAYDVQQDExlkZXYtYnVrandwODYudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArughRWVdNf5usNfj
X+BJwDI1P4ya58JFf//jTeqMlzD+M0NzCdy6LfhaP9jrW2MvbEuQhO1+A2/1PNmC
W3vpn2MwbkdIE6OV6pipxl7o2o6AHJ3gRtmzx5OpSPsu50e8CJPaKJ0u+B1cC5by
LL4zWhIB4GTYboJBCFhdFY+SG7W/NWuxVsXe3fycMECaNZQ03Se5+FUXGVPGklLJ
R2QRtsYLJZ+2y1ZJYvCBNIFXf83sN6I759tKSiQYrpSiigDGmdCpvomhcKkCmJh2
p0w8m8MYjsAkIcPAgxQIkRQhoR2O2d/psOpjNTvMBCpreAXeFl4IV2eJHqz97fhV
n3xwEQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBREoKuRLFjM
H3cbBuXS1fqWXMQXlTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AFSJItyy6mBjkkfkYLjA21fWrfxqFS6NEjnZ5MgKPu5iLzufzDktryR6OVU354V1
8FeW6jKIOqkERtZL7FIzfYFE9bbD7vOh0PuZen4EQ6lNE1Hl4kxKfJm/sKTrddC0
ZFl2u0hoBpAxMwLVUZoKIRmCZTQ3d5VD14rkJ737MMd62LR5xuSj1tAVNEhFLzNT
sZqaZIc1UUoZrYhLhiqez+b+nQYqBwMG0C01mEtDo6cBZSkEWMOknjclme/lf7rD
S/vnI6RmP3SgCNW/hknoPNfQ/bkRoreJs4LYZVfQWjATRQ2r9C2J7fbZR/sDCl4l
kpEmhc4BtzuDZ5ojj1mWKn0=
-----END CERTIFICATE-----`;

const auth = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  console.info("Authorizing a user", event);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    console.info("User was authorized", jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e) {
    console.info("Auth handle error: ", e);
    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
};

function verifyToken(authHeader: string): JwtPayload {
  const token = getToken(authHeader);
  return verify(token, cert, { algorithms: ["RS256"] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error("No authentication header");

  if (!authHeader.toLowerCase().startsWith("bearer "))
    throw new Unauthorized("Invalid authentication");

  const split = authHeader.split(" ");
  const token = split[1];

  return token;
}

export const main = middyfy(auth);
