import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LoggerService } from './logger.service';

describe('LoggerService (logger.service.ts)', () => {
  let service: LoggerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggerService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LoggerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('httpLog adds INFO HTTP entry', () => {
    service.httpLog('GET /api/test', '200 OK');
    expect(service.getLogs().length).toBe(1);
    expect(service.getLogs()[0].level).toBe('INFO');
    expect(service.getLogs()[0].category).toBe('HTTP');
  });

  it('httpError adds ERROR HTTP entry', () => {
    service.httpError('GET /fail', '500');
    const entry = service.getLogs()[0];
    expect(entry.level).toBe('ERROR');
  });

  it('api adds INFO API entry', () => {
    service.api('calling service', 'detail');
    expect(service.getLogs()[0].category).toBe('API');
  });

  it('user adds NAV USER entry', () => {
    service.user('navigated to /home');
    expect(service.getLogs()[0].level).toBe('NAV');
    expect(service.getLogs()[0].category).toBe('USER');
  });

  it('error adds ERROR CONSOLE entry', () => {
    service.error('something failed');
    expect(service.getLogs()[0].level).toBe('ERROR');
    expect(service.getLogs()[0].category).toBe('CONSOLE');
  });

  it('warn adds WARN CONSOLE entry', () => {
    service.warn('deprecated usage');
    expect(service.getLogs()[0].level).toBe('WARN');
  });

  it('getLogs returns all entries', () => {
    service.httpLog('a');
    service.httpError('b');
    expect(service.getLogs().length).toBe(2);
  });

  it('clear empties log list', () => {
    service.httpLog('test');
    service.clear();
    expect(service.getLogs().length).toBe(0);
  });

  it('loadLogsFromServer returns Observable', () => {
    let result: any;
    service.loadLogsFromServer().subscribe(logs => { result = logs; });
    const req = httpMock.expectOne(r => r.url.includes('/logs'));
    req.flush([{ level: 'INFO' }]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('getLogs returns entries after adding', () => {
    service.httpLog('entry1');
    service.api('entry2');
    expect(service.getLogs().length).toBe(2);
  });

  it('clear resets buffer state', () => {
    service.httpLog('test');
    service.clear();
    expect(service.getLogs().length).toBe(0);
  });

  it('flush sends buffered logs via POST', () => {
    service.httpLog('flush-test', 'detail');
    (service as any).flush();
    const req = httpMock.expectOne(r => r.url.includes('/logs') && r.method === 'POST');
    expect(req.request.body.length).toBeGreaterThan(0);
    req.flush({});
  });

  it('flush does nothing when buffer is empty', () => {
    (service as any).flush();
    httpMock.expectNone(r => r.method === 'POST');
  });

  it('flush clears buffer after sending', () => {
    service.httpLog('a');
    (service as any).flush();
    const req = httpMock.expectOne(r => r.url.includes('/logs') && r.method === 'POST');
    req.flush({});
    (service as any).flush();
    httpMock.expectNone(r => r.method === 'POST');
  });

  it('flush handles POST error silently', () => {
    service.httpLog('err-test');
    (service as any).flush();
    const req = httpMock.expectOne(r => r.url.includes('/logs') && r.method === 'POST');
    expect(() => req.flush('', { status: 500, statusText: 'Server Error' })).not.toThrow();
  });
});
