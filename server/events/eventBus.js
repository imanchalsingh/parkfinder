import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
  constructor() {
    super();
    // We can handle unhandled promise rejections in listeners here if needed
    // EventEmitter doesn't await async listeners by default.
    // If an async listener throws, it might cause an unhandled rejection.
    // Setting captureRejections could be useful but we'll manually try-catch in listeners.
  }
}

const eventBus = new EventBus();

// Export the singleton instance
export default eventBus;
