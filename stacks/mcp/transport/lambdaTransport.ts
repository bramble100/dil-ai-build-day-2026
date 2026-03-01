import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';

/**
 * Custom MCP transport that bridges the AWS Lambda request/response model
 * to the MCP SDK's Transport interface.
 *
 * Each Lambda invocation creates a new LambdaTransport instance.
 * The McpServer instance is reused across warm invocations (module-level),
 * but its internal _transport reference is cleared after each close().
 *
 * Flow per request:
 *   1. McpServer.connect(transport)  → internally calls transport.start()
 *   2. transport.start()             → feeds incoming message to the server via onmessage
 *   3. McpServer processes message   → calls transport.send(response)
 *   4. transport.send()              → resolves this.response Promise
 *   5. Handler awaits response       → returns it as Lambda result
 *   6. transport.close()             → server clears its _transport ref for next invocation
 */
export class LambdaTransport implements Transport {
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  private readonly incoming: JSONRPCMessage;
  private resolved = false;

  private readonly _resolve: (msg: JSONRPCMessage) => void;
  private readonly _reject: (err: Error) => void;

  /** Resolves with the first JSON-RPC message the server sends back. */
  readonly response: Promise<JSONRPCMessage>;

  constructor(incoming: JSONRPCMessage) {
    this.incoming = incoming;

    let resolve!: (msg: JSONRPCMessage) => void;
    let reject!: (err: Error) => void;
    this.response = new Promise<JSONRPCMessage>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this._resolve = resolve;
    this._reject = reject;
  }

  /** Called by McpServer.connect() — feeds the Lambda event body into the server. */
  async start(): Promise<void> {
    this.onmessage?.(this.incoming);
  }

  /** Called by the SDK when it has a response ready. Captures the first message only. */
  async send(message: JSONRPCMessage): Promise<void> {
    if (!this.resolved) {
      this.resolved = true;
      this._resolve(message);
    }
  }

  /** Closes the transport — triggers the server to clear its internal _transport ref. */
  async close(): Promise<void> {
    this.onclose?.();
  }
}
