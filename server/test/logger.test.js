import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Logger Utility', () => {
  let mockConsoleLog;
  let mockConsoleError;
  let setupLogger;
  let asyncLocalStorage;
  let realConsoleLog;
  let realConsoleError;

  beforeEach(async () => {
    vi.resetModules();
    
    realConsoleLog = console.log;
    realConsoleError = console.error;
    
    mockConsoleLog = vi.fn();
    mockConsoleError = vi.fn();
    
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    
    // Import dynamically so it captures our mocks as originalLog and originalError
    const logger = await import('../utils/logger.js?update=' + Date.now()); // cache bust
    setupLogger = logger.setupLogger;
    asyncLocalStorage = logger.asyncLocalStorage;
    
    setupLogger();
  });

  afterEach(() => {
    console.log = realConsoleLog;
    console.error = realConsoleError;
    vi.restoreAllMocks();
  });

  it('prefixes string messages with ReqID when inside asyncLocalStorage context', () => {
    asyncLocalStorage.run({ requestId: 'test-req-123' }, () => {
      console.log('Hello world');
    });

    expect(mockConsoleLog).toHaveBeenCalled();
    const args = mockConsoleLog.mock.calls[0];
    expect(args[0]).toBe('[ReqID: test-req-123] Hello world');
  });

  it('prepends ReqID to object arguments', () => {
    asyncLocalStorage.run({ requestId: 'test-req-456' }, () => {
      console.error({ error: 'Something went wrong' });
    });

    expect(mockConsoleError).toHaveBeenCalled();
    const args = mockConsoleError.mock.calls[0];
    expect(args[0]).toBe('[ReqID: test-req-456]');
    expect(args[1]).toEqual({ error: 'Something went wrong' });
  });

  it('does not prefix if no requestId is in store', () => {
    asyncLocalStorage.run({}, () => {
      console.log('No req id here');
    });

    expect(mockConsoleLog).toHaveBeenCalled();
    const args = mockConsoleLog.mock.calls[0];
    expect(args[0]).toBe('No req id here');
  });

  it('does not prefix if not in asyncLocalStorage context', () => {
    console.log('Outside context');

    expect(mockConsoleLog).toHaveBeenCalled();
    const args = mockConsoleLog.mock.calls[0];
    expect(args[0]).toBe('Outside context');
  });
});
