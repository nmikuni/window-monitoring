import { Env } from "./bindings";
import { recorder } from "./recorder";
import { checker } from "./checker";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return recorder(request, env);
  },
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(checker(event, env));
  },
};
