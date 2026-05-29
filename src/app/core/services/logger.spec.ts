import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LoggerService } from './logger';

describe('LoggerService (logger.ts)', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggerService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('log should add entry', () => {
    service.log('INFO', 'USER', 'test message');
    expect(service.getLogs().length).toBe(1);
    expect(service.getLogs()[0].message).toBe('test message');
  });

  it('log should store level and category', () => {
    service.log('ERROR', 'HTTP', 'error msg', 'detail');
    const entry = service.getLogs()[0];
    expect(entry.level).toBe('ERROR');
    expect(entry.category).toBe('HTTP');
    expect(entry.detail).toBe('detail');
  });

  it('clear should empty log list', () => {
    service.log('INFO', 'USER', 'test');
    service.clear();
    expect(service.getLogs().length).toBe(0);
  });

  it('loadLogsFromServer should return observable', () => {
    let result: any;
    service.loadLogsFromServer().subscribe(logs => { result = logs; });
    expect(Array.isArray(result)).toBe(true);
  });
});
