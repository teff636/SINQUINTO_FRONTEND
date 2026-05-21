import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'NAV';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: 'HTTP' | 'USER' | 'API' | 'CONSOLE';
  message: string;
  detail?: string;
}

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private logs: LogEntry[] = [];
  private apiUrl = 'http://localhost:8080/api/logs';
  private buffer: LogEntry[] = [];
  private flushInterval = 5000;

  constructor(private httpClient: HttpClient) {
    setInterval(() => this.flush(), this.flushInterval);
  }

  private add(level: LogLevel, category: LogEntry['category'], message: string, detail?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      detail
    };
    this.logs.unshift(entry);
    this.buffer.push(entry);
  }

  private flush() {
    if (this.buffer.length === 0) return;
    const toSend = [...this.buffer];
    this.buffer = [];
    this.httpClient.post(this.apiUrl, toSend).subscribe({
      error: () => console.warn('No se pudieron enviar los logs al backend')
    });
  }

  loadLogsFromServer(): Observable<LogEntry[]> {
    return this.httpClient.get<LogEntry[]>(this.apiUrl);
  }

  httpLog(message: string, detail?: string) { this.add('INFO', 'HTTP', message, detail); }
  httpError(message: string, detail?: string) { this.add('ERROR', 'HTTP', message, detail); }
  api(message: string, detail?: string) { this.add('INFO', 'API', message, detail); }
  user(message: string, detail?: string) { this.add('NAV', 'USER', message, detail); }
  error(message: string, detail?: string) { this.add('ERROR', 'CONSOLE', message, detail); }
  warn(message: string, detail?: string) { this.add('WARN', 'CONSOLE', message, detail); }

  getLogs(): LogEntry[] { return this.logs; }
  clear() { this.logs = []; }
}
