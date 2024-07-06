# Window Open Close Checker

This is the demo application for following purpose

- Record when you open or close the window
- Notify when the window is open for a while

## Components

- Cloudflare Workers
- Soracom (SORACOM LTE-M Button x 2, SORACOM Beam)
- Slack

## Architecture

```
                                         +----------------------------------+
                                         |Cloudflare_Workers                |
                                         |                                  |
                                         | +-------+  +-----------------+   |
                                         | |Trigger+->|     checker     +---+---------------+
                                         | +-------+  +-------+---------+   |               |
                                         |                    |             |               |
                                         |                  +-v-+           |   +-----------v----------+
                                         |                  |KV |           |   |Slack_Incoming_Webhook|
                                         |                  +-^-+           |   +-----------^----------+
                                         |                    |             |               |
+----------------------+  +------------+ |           +--------+---------+   |               |
| SORACOM_LTE-m_Button +->|SORACOM_Beam+-+---------->|     recorder     +---+---------------+
+----------------------+  +------------+ |           +------------------+   |
                                         |                                  |
                                         +----------------------------------+
```

## Prerequisite 

This demo application was built for specific IoT Device ([SORACOM LTE-M Button plus](https://soracom.jp/store/5206/), which is only sold in Japan) and [Soracom](https://soracom.io/) ([JP website](https://soracom.jp/)) service.

Especially, authentication in [recorder](./src/recorder.ts) uses Soracom Beam signature verification (doc: [EN](https://developers.soracom.io/en/docs/beam/signature-verification/) / [JA](https://users.soracom.io/ja-jp/docs/beam/verify-signature/)).

In addition, you need to set env car in the wrangler.toml refering to [wrangler.toml.example](./wrangler.toml.example)

## How to build

You can build this application with [Wrangler](https://developers.cloudflare.com/workers/wrangler/). Here's the sample setup

```bash
npx wrangler publish 
npx wrangler secret put -c wrangler.toml --name window-monitoring PRESHARED_KEY
npx wrangler secret put -c wrangler.toml --name window-monitoring SLACK_URL
npx wrangler kv:namespace create "WINDOW_KV"
# note: ${id} is the namespace ID of KV. 
wrangler kv:key put windowStatus "open" --namespace-id ${id}
wrangler kv:key put lastUpdatedDate "1720127994858" --namespace-id ${id}
# note: set bindings to your wrangler.toml
```

If you want to test Workers locally, you also need to set up KV for preview namespace.

```bash
npx wrangler kv:namespace create "WINDOW_KV" --preview
# note: ${id} is the namespace ID of KV.
npx wrangler kv:key put windowStatus "open" --namespace-id ${id}
npx wrangler kv:key put lastUpdatedDate "1720127994858" --namespace-id ${id}
```
