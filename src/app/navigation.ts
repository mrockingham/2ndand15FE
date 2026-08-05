import type { SvgIconComponent } from '@mui/icons-material';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import NewspaperRounded from '@mui/icons-material/NewspaperRounded';
import QueryStatsRounded from '@mui/icons-material/QueryStatsRounded';
import SportsFootballRounded from '@mui/icons-material/SportsFootballRounded';
import SportsScoreRounded from '@mui/icons-material/SportsScoreRounded';
import GroupsRounded from '@mui/icons-material/GroupsRounded';

export interface NavigationItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export const navigationItems: NavigationItem[] = [
  { label: 'Home', path: '/', icon: HomeRounded },
  { label: 'Games', path: '/games', icon: SportsFootballRounded },
  { label: 'News', path: '/news', icon: NewspaperRounded },
  { label: 'Players', path: '/players', icon: GroupsRounded },
  { label: 'Stats', path: '/stats', icon: QueryStatsRounded },
  { label: 'AI Hub', path: '/ai', icon: AutoAwesomeRounded },
  { label: 'Fantasy', path: '/fantasy', icon: SportsScoreRounded },
];

export const isNavigationPathActive = (
  currentPath: string,
  itemPath: string,
) =>
  itemPath === '/'
    ? currentPath === itemPath
    : currentPath.startsWith(itemPath);
