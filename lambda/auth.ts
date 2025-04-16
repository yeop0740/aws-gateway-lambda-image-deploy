import { APIGatewayProxyEventV2 } from "aws-lambda/trigger/api-gateway-proxy";
import { isNil } from "./util";
import "dotenv/config";

const TOSS_PAYMENTS_API_SECRET_KEY = process.env.TOSS_PAYMENTS_API_SECRET_KEY;
const encryptedSecretKey =
  "Basic " + Buffer.from(TOSS_PAYMENTS_API_SECRET_KEY + ":").toString("base64");

export const handler = async (event: APIGatewayProxyEventV2) => {
  if (isNil(TOSS_PAYMENTS_API_SECRET_KEY)) {
    console.log("environment variable is not found.");

    throw new Error("no config file");
  }

  console.log(event.rawQueryString);
  console.log(JSON.stringify(event));

  const code = event.queryStringParameters?.code;
  const customerKey = event.queryStringParameters?.customerKey;

  if (isNil(code) || isNil(customerKey)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "invalid query string." }),
    };
  }

  try {
    const authResponse = await fetch(
      "https://api.tosspayments.com/v1/brandpay/authorizations/access-token",
      {
        method: "POST",
        headers: {
          Authorization: encryptedSecretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grantType: "AuthorizationCode",
          customerKey,
          code,
        }),
      }
    );
    const result = await authResponse.json();

    if (!result.ok) {
      console.log(result, `{customerKey: ${customerKey}, code: ${code}}`);

      return {
        statusCode: authResponse.status,
      };
    }

    return {
      statusCode: 200,
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
    };
  }
};
