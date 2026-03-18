import { Paths, writeAsStringAsync } from 'expo-file-system';

export type LogCategory = 'PLAYER' | 'ENGINE' | 'RENDER' | 'PERF';

export interface LogEntry {
  ts: number;
  category: LogCategory;
  message: string;
  data?: unknown;
}

class Logger {
  private buffer: LogEntry[] = [];
  private maxBuffer = 500;
  private sessionStart = Date.now();
  private enabled = __DEV__;

  log(category: LogCategory, message: string, data?: unknown): void {
    if (!this.enabled) return;
    const entry: LogEntry = {
      ts: Date.now() - this.sessionStart,
      category,
      message,
      data,
    };
    this.buffer.push(entry);
    if (this.buffer.length > this.maxBuffer) {
      this.buffer.shift();
    }
  }

  perf(label: string, ms: number): void {
    this.log('PERF', label, { ms });
    if (ms > 16) {
      this.log('PERF', `⚠️ SLOW: ${label}`, { ms });
    }
  }

  getBuffer(): LogEntry[] {
    return [...this.buffer];
  }

  async exportToFile(): Promise<string> {
    const lines = this.buffer.map((e) => {
      const t = (e.ts / 1000).toFixed(3);
      const d = e.data ? JSON.stringify(e.data) : '';
      return `[${t}s][${e.category}] ${e.message} ${d}`;
    });

    const content = [
      'TunePath Debug Log',
      `Session: ${new Date().toISOString()}`,
      `Entries: ${lines.length}`,
      '─'.repeat(50),
      ...lines,
    ].join('\n');

    const base = Paths.document.uri;
    const path = base + `tunepath-log-${Date.now()}.txt`;

    await writeAsStringAsync(path, content);
    return path;
  }

  clear(): void {
    this.buffer = [];
    this.sessionStart = Date.now();
  }
}

export const logger = new Logger();

