// Silence winston file transports in tests and replace with a noop transport
import { logger } from '@/utils/logger';

// Remove file transports to avoid file writes during tests.
// Winston exposes .clear() to remove transports in newer versions; if not present, we try a safe fallback.
try {
  if (typeof (logger as any).clear === 'function') {
    (logger as any).clear();
  } else if ((logger as any).transports && Array.isArray((logger as any).transports)) {
    // attempt to close and remove transports
    (logger as any).transports.forEach((t: any) => {
      if (typeof t.close === 'function') {
        try {
          t.close();
        } catch (e) {
          // ignore
        }
      }
    });
  }
} catch (e) {
  // swallow any errors while manipulating logger in test environment
}

process.env.NODE_ENV = 'test';
