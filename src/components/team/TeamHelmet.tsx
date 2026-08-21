import { useId } from 'react';
import { Box } from '@mui/material';

import { TeamBadge } from '@/components/team/TeamBadge';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';

export interface TeamHelmetProps {
  readonly team: string;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  readonly variant?: 'helmet' | 'badge';
  readonly className?: string;
  readonly decorative?: boolean;
}

const sizes = { xs: 24, sm: 36, md: 64, lg: 104 } as const;

export const TeamHelmet = ({
  team,
  size = 'md',
  variant = 'helmet',
  className,
  decorative = false,
}: TeamHelmetProps) => {
  const instanceId = useId().replace(/:/g, '');
  const config = getTeamVisualConfig(team);
  const pixelSize = sizes[size];

  if (variant === 'badge' || size === 'xs' || !config) {
    return (
      <TeamBadge
        team={team}
        size={pixelSize}
        className={className}
        decorative={decorative}
      />
    );
  }

  const gradientId = `helmet-gradient-${instanceId}`;
  const shadowId = `helmet-shadow-${instanceId}`;
  const isCompact = size === 'sm';
  const below = config.helmetAbbreviationPlacement === 'below-helmet';
  const ariaLabel = `${config.teamName} helmet`;

  return (
    <Box
      component="span"
      className={className}
      sx={{
        display: 'inline-flex',
        width: pixelSize,
        height: pixelSize,
        flex: `0 0 ${pixelSize}px`,
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
      }}
    >
      <svg
        viewBox="0 0 120 104"
        width="100%"
        height="100%"
        role={decorative ? undefined : 'img'}
        aria-hidden={decorative ? true : undefined}
        aria-label={decorative ? undefined : ariaLabel}
        data-team-helmet={config.abbreviation}
        data-helmet-size={size}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={config.helmetShellColor} />
            <stop
              offset="0.48"
              stopColor={config.helmetShellColor}
              stopOpacity="0.96"
            />
            <stop offset="1" stopColor="#000000" stopOpacity="0.28" />
          </linearGradient>
          <filter id={shadowId} x="-20%" y="-20%" width="150%" height="160%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.28" />
          </filter>
        </defs>
        <g filter={isCompact ? undefined : `url(#${shadowId})`}>
          <path
            d="M18 57C18 29 35 12 62 12c29 0 45 17 45 45v9H83c-4 0-7 3-7 7v7H54c-8 0-14-6-14-14v-4H18v-5Z"
            fill={`url(#${gradientId})`}
            stroke={config.secondaryColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {!isCompact ? (
            <path
              d="M29 42c6-17 20-24 37-24"
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.2"
              strokeWidth="5"
              strokeLinecap="round"
            />
          ) : null}
          {config.helmetStripeStyle === 'single-center' ? (
            <path
              d="M66 13c8 10 11 26 9 45"
              fill="none"
              stroke={config.accentColor}
              strokeWidth="4"
            />
          ) : null}
          {config.helmetStripeStyle === 'double-center' ? (
            <>
              <path
                d="M62 13c7 12 9 27 8 44"
                fill="none"
                stroke={config.secondaryColor}
                strokeWidth="3"
              />
              <path
                d="M69 14c7 12 9 26 8 43"
                fill="none"
                stroke={config.accentColor}
                strokeWidth="3"
              />
            </>
          ) : null}
          {config.helmetStripeStyle === 'side-accent' ? (
            <path
              d="M25 57c14 2 25 1 36-4"
              fill="none"
              stroke={config.secondaryColor}
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : null}
          <circle
            cx="80"
            cy="67"
            r="6"
            fill={config.helmetFacemaskColor}
            stroke={config.secondaryColor}
            strokeWidth="1.5"
          />
          <path
            d="M82 67h25v8H91v12h18"
            fill="none"
            stroke={config.helmetFacemaskColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {!below ? (
            <text
              x="63"
              y="51"
              fill={config.helmetTextColor}
              fontFamily="Arial Narrow, Roboto Condensed, Inter Tight, Inter, system-ui, sans-serif"
              fontSize={isCompact ? '20' : '22'}
              fontWeight="900"
              letterSpacing={isCompact ? '-1' : '-1.2'}
              textAnchor="middle"
            >
              {config.abbreviation}
            </text>
          ) : null}
        </g>
        {below ? (
          <text
            x="58"
            y="101"
            fill="currentColor"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="17"
            fontWeight="900"
            letterSpacing="-1"
            textAnchor="middle"
          >
            {config.abbreviation}
          </text>
        ) : null}
      </svg>
    </Box>
  );
};
