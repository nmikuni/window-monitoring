export async function postSlackMessage(
  messageText: string,
  slackUrl: string
): Promise<Response> {
  const message = JSON.stringify({ text: messageText });

  const requestInit: RequestInit = {
    body: message,
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  };

  return await fetch(slackUrl, requestInit);
}
