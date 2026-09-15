(() => {
  "use strict";

  class PollingWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;

    constructor(url) {
      this.url = url;
      this.readyState = PollingWebSocket.CONNECTING;
      this.onopen = null;
      this.onmessage = null;
      this.onerror = null;
      this.onclose = null;
      this._closed = false;
      this._seen = new Set();
      this._timer = null;
      this._poll();
    }

    async _poll() {
      if (this._closed) return;

      try {
        const httpUrl = this.url
          .replace(/^ws:/, "http:")
          .replace(/^wss:/, "https:")
          .replace(/\/events\/live$/, "/events?limit=500");

        const response = await window.fetch(httpUrl, { cache: "no-store" });
        if (!response.ok) throw new Error(`Polling ${response.status}`);

        const events = await response.json();

        if (this.readyState === PollingWebSocket.CONNECTING) {
          this.readyState = PollingWebSocket.OPEN;
          if (typeof this.onopen === "function") this.onopen({ type: "open" });
        }

        if (Array.isArray(events)) {
          for (const event of events) {
            const key = JSON.stringify(event);
            if (this._seen.has(key)) continue;
            this._seen.add(key);
            if (this._seen.size > 5000) {
              this._seen = new Set(Array.from(this._seen).slice(-2500));
            }
            if (typeof this.onmessage === "function") {
              this.onmessage({ data: JSON.stringify(event) });
            }
          }
        }
      } catch (error) {
        if (typeof this.onerror === "function") this.onerror(error);
      }

      if (!this._closed) {
        this._timer = setTimeout(() => this._poll(), 2000);
      }
    }

    close() {
      if (this._closed) return;
      this._closed = true;
      this.readyState = PollingWebSocket.CLOSING;
      clearTimeout(this._timer);
      this.readyState = PollingWebSocket.CLOSED;
      if (typeof this.onclose === "function") this.onclose({ type: "close" });
    }

    send() {}
  }

  window.WebSocket = PollingWebSocket;
})();
