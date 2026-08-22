import { Tabs, Tab } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import type { StatsMode } from '../currentUrlState';

export const StatsModeTabs = ({ mode }: { readonly mode: StatsMode }) => {
  const [, setParameters] = useSearchParams();
  return (
    <Tabs
      value={mode}
      onChange={(_event, value: StatsMode) =>
        setParameters(new URLSearchParams({ mode: value }))
      }
      aria-label="Stats data mode"
    >
      <Tab value="current" label="Current Season" />
      <Tab value="historical" label="Historical" />
    </Tabs>
  );
};
