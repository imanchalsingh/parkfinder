import { AsyncLocalStorage } from "node:async_hooks";

export const asyncLocalStorage = new AsyncLocalStorage();

// Save the original console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

function formatArgsWithRequestId(args) {
  const store = asyncLocalStorage.getStore();
  const requestId = store?.requestId;
  
  if (requestId) {
    if (typeof args[0] === "string") {
      args[0] = `[ReqID: ${requestId}] ${args[0]}`;
    } else {
      args.unshift(`[ReqID: ${requestId}]`);
    }
  }
  return args;
}

export function setupLogger() {
  console.log = function (...args) {
    originalLog.apply(console, formatArgsWithRequestId(args));
  };

  console.error = function (...args) {
    originalError.apply(console, formatArgsWithRequestId(args));
  };

  console.warn = function (...args) {
    originalWarn.apply(console, formatArgsWithRequestId(args));
  };

  console.info = function (...args) {
    originalInfo.apply(console, formatArgsWithRequestId(args));
  };
}
