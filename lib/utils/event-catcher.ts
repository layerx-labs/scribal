import { EventCatcherConfig } from "index";

export default class EventCatcher {
  constructor(
    private config: EventCatcherConfig
  ) { }

  send(options: { eventIndex: string, source?: string, error?: Error }) {
    const base = this.config?.serverUrl;

    if (!this.config || !base) {
      return console.info('EventCatcher not properly configured');
    }

    const url = `${base}/events`;
    const { eventIndex, source, error } = options;

    fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        eventIndex,
        source: source || 'Log Service',
        errorMessage: error?.message ?? error?.toString(),
      }),
    })
      .then((res) => {
        if (res.status !== 201)
          return console.error('[Event Catcher Error]', 'Response', res.statusText);

        res
          .json()
          .then()
          .catch((err) => console.error('[Event Catcher Error]', 'JSON-Parsing', err));
      })
      .catch((err) => {
        console.error('[Event Catcher Error]', 'Global', err);
      });
  }
}