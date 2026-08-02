import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { StartupConfigurationError } from '@/app/StartupConfigurationError';
import { readAppEnvironment } from '@/services/api/environment';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Application root element was not found.');
}

const renderApplication = () => {
  try {
    readAppEnvironment(import.meta.env);
    return <App />;
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Review the environment configuration and restart the app.';
    return <StartupConfigurationError message={message} />;
  }
};

createRoot(rootElement).render(<StrictMode>{renderApplication()}</StrictMode>);
