import { useState, type PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { createAppQueryClient } from '@/app/queryClient';
import { ApplicationErrorBoundary } from '@/components/feedback/ApplicationErrorBoundary';
import { AppThemeProvider } from '@/theme/ThemeProvider';

export const AppProviders = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(createAppQueryClient);

  return (
    <AppThemeProvider>
      <ApplicationErrorBoundary>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ApplicationErrorBoundary>
    </AppThemeProvider>
  );
};
