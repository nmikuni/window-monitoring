import { WindowStatus } from "./Types";
import { Env } from "./bindings";
import { KvClient } from "./cloudflare/KvClient";
import { postSlackMessage } from "./slack/Slack";
import { calculateSoracomSignature } from "./soracom/Beam";

export async function recorder(request: Request, env: Env) {
  // Helper function to create responses
  const createResponse = (message: string, status: number): Response => {
    return new Response(message, { status });
  };

  // Only allow POST request
  if (request.method !== "POST") {
    return createResponse("Method Not Allowed", 405);
  }

  // Authenticate with header
  const requestHeaders: Headers = request.headers;

  const preSharedKey = env.PRESHARED_KEY;
  const openButtonImsi = env.OPEN_BUTTON_IMSI;
  const closeButtonImsi = env.CLOSE_BUTTON_IMSI;
  const slackUrl = env.SLACK_URL;

  if (!(preSharedKey && openButtonImsi && closeButtonImsi && slackUrl)) {
    return createResponse("Internal Server Error", 500);
  }

  const givenSignature = requestHeaders.get("x-soracom-signature");
  const calculatedSignature = calculateSoracomSignature(
    requestHeaders,
    preSharedKey
  );

  if (calculatedSignature !== givenSignature) {
    return createResponse("Invalid signature", 403);
  }

  // Only allow "application/json" content-type
  if (requestHeaders.get("content-type") !== "application/json") {
    return createResponse("Unsupported Media Type", 415);
  }

  // Only allow the IMSI is OPEN_BUTTON_IMSI or CLOSE_BUTTON_IMSI
  const imsi = requestHeaders.get("x-soracom-imsi");
  if (imsi !== openButtonImsi && imsi !== closeButtonImsi) {
    return createResponse("Forbidden", 403);
  }

  // Identify the window opened or closed by IMSI
  const windowStatus: WindowStatus = imsi === openButtonImsi ? "open" : "close";

  // Record the date as lastUpdatedDate
  const currentDate = Date.now();
  const kvClient = new KvClient(env);
  await Promise.all([
    kvClient.put("windowStatus", windowStatus),
    kvClient.put("lastUpdatedDate", currentDate.toString()),
  ]);

  // Post data to Slack using data from client
  const messageText =
    windowStatus === "open" ? "The window opened." : "The window closed.";
  const response = await postSlackMessage(messageText, slackUrl);
  const responseText = await response.text();

  return new Response(responseText, { status: response.status });
}
