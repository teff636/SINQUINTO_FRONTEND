import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface LogEntry {
  timestamp: Date;
  level: string;
  category: string;
  message: string;
  detail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logs: LogEntry[] = [];

  constructor(private readonly http: HttpClient) {}

  log(level: string, category: string, message: string, detail?: string) {
    this.logs.push({ timestamp: new Date(), level, category, message, detail });
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clear() {
    this.logs = [];
  }

  loadLogsFromServer(): Observable<LogEntry[]> {
    return of(this.logs);
  }
}