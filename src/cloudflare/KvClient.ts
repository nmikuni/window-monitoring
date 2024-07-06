import { Env } from "../bindings";
const keyList = ["windowStatus", "lastUpdatedDate"];

export class KvClient {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async get(key: string): Promise<string | null> {
    // Only allow to get the value of the key in the list
    if (keyList.includes(key)) {
      return await this.env.KV.get(key);
    } else {
      return null;
    }
  }

  async put(key: string, value: string): Promise<void> {
    // Only allow to put the value of the key in the list
    if (keyList.includes(key)) {
      return this.env.KV.put(key, value);
    } else {
      return;
    }
  }
}
