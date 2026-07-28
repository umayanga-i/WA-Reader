/// <reference lib="webworker" />
import { parseWhatsAppChat } from './whatsappParser';
import type { ParseOptions } from './whatsappParser';

export interface WorkerRequest {
  rawText: string;
  options: ParseOptions;
}

export interface WorkerResponse {
  type: 'progress' | 'done' | 'error';
  progress?: number;
  result?: ReturnType<typeof parseWhatsAppChat>;
  error?: string;
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  try {
    const { rawText, options } = e.data;

    // Report progress at ~50% before parsing starts
    const progressMsg: WorkerResponse = { type: 'progress', progress: 30 };
    self.postMessage(progressMsg);

    const result = parseWhatsAppChat(rawText, options);

    const progressMsg2: WorkerResponse = { type: 'progress', progress: 90 };
    self.postMessage(progressMsg2);

    const doneMsg: WorkerResponse = { type: 'done', result };
    self.postMessage(doneMsg);
  } catch (err) {
    const errMsg: WorkerResponse = {
      type: 'error',
      error: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(errMsg);
  }
};
