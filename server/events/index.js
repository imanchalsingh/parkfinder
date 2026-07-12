import { setupEmailListeners } from './listeners/email.listener.js';
import { setupLoggingListeners } from './listeners/logging.listener.js';

export const initializeEventSubscribers = () => {
  setupEmailListeners();
  setupLoggingListeners();
  console.log('[EventBus] Event listeners initialized');
};
