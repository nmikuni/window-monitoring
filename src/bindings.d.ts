export interface Env {
  KV: KVNamespace;
  SLACK_URL: string;
  PRESHARED_KEY: string;
  OPEN_BUTTON_IMSI: string;
  CLOSE_BUTTON_IMSI: string;
  WINDOW_OPEN_THRESHOLD_MS: string;
}

export interface Bindings {
  env: Env;
  KV: KVNamespace;
}

declare global {
  function getMiniflareBindings(): Bindings;
}
