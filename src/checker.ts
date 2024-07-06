import { WindowStatus } from "./Types";
import { Env } from "./bindings";
import { KvClient } from "./cloudflare/KvClient";
import { postSlackMessage } from "./slack/Slack";

export async function checker(event: ScheduledEvent, env: Env) {
  const kvClient = new KvClient(env);

  // Helper function to create responses
  const createResponse = (message: string, status: number): Response => {
    return new Response(message, { status });
  };

  // Get parameters from env
  const windowOpenThresholdMs = env.WINDOW_OPEN_THRESHOLD_MS;
  const slackUrl = env.SLACK_URL;

  // Get parameters from KV
  const [windowStatusStr, lastUpdatedDate] = await Promise.all([
    kvClient.get("windowStatus"),
    kvClient.get("lastUpdatedDate"),
  ]);
  const windowStatus: WindowStatus | null =
    windowStatusStr as WindowStatus | null;

  // Confirm KV and env value are not null
  if (!(windowStatus && lastUpdatedDate && windowOpenThresholdMs && slackUrl)) {
    return createResponse("Internal Server Error", 500);
  }

  if (windowStatus === "close") {
    return;
  }
  const currentDate = Date.now();
  const lastUpdatedDateNumber = Number(lastUpdatedDate);
  if (currentDate - lastUpdatedDateNumber <= Number(windowOpenThresholdMs)) {
    return;
  }
  const messageText =
    "You need to close the window! Last updated date is " +
    new Date(lastUpdatedDateNumber);
  const response = await postSlackMessage(messageText, slackUrl);
  return new Response(await response.text());
}
