import CloseRounded from '@mui/icons-material/CloseRounded';
import FullscreenRounded from '@mui/icons-material/FullscreenRounded';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import ReplayRounded from '@mui/icons-material/ReplayRounded';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { memo, useId, useMemo } from 'react';

import { PlayFeed } from '@/features/games/components/PlayFeed';
import {
  buildPlayAnimation,
  type FieldPoint,
  type PlayAnimationModel,
} from '@/features/games/playVisualization';
import {
  formatDownDistance,
  formatGameClock,
  formatYardLine,
} from '@/features/games/presentation';
import type { Game, GamePlay, GameTeam } from '@/features/games/types';
import { getTeamVisualConfig } from '@/features/teamVisualIdentity/teamVisualConfigs';

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 530;
const PLAYING_FIELD_START = 100;
const PLAYING_FIELD_WIDTH = 1000;
const FIELD_TOP = 35;
const FIELD_HEIGHT = 460;

const pointToSvg = (point: FieldPoint) => ({
  x: PLAYING_FIELD_START + point.x * 10,
  y: FIELD_TOP + (point.y / 100) * FIELD_HEIGHT,
});

const yardToX = (yard: number) => PLAYING_FIELD_START + yard * 10;

const trajectoryPath = (model: PlayAnimationModel): string | undefined => {
  if (model.ballPath === null) return undefined;
  const start = pointToSvg(model.ballPath.start);
  const control = pointToSvg(model.ballPath.control);
  const end = pointToSvg(model.ballPath.end);
  return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
};

const teamColor = (team: GameTeam | null, fallback: string) =>
  (team === null
    ? null
    : getTeamVisualConfig(team.abbreviation)?.primaryColor) ?? fallback;

const playTeams = (game: Game, play: GamePlay) => {
  if (play.possessionTeam?.id === game.homeTeam.id)
    return { offense: game.homeTeam, defense: game.awayTeam };
  if (play.possessionTeam?.id === game.awayTeam.id)
    return { offense: game.awayTeam, defense: game.homeTeam };
  return { offense: null, defense: null };
};

const playStatusLabel = (model: PlayAnimationModel) => {
  if (model.isNoPlay) return 'NO PLAY';
  if (model.isTurnover) return 'TURNOVER';
  if (model.isScoring) return 'SCORE';
  if (model.isPenalty) return 'FLAG';
  return null;
};

const animationCategoryLabel = (model: PlayAnimationModel) =>
  model.category.replaceAll('_', ' ');

const TacticalField = memo(
  ({
    play,
    offense,
    defense,
    replayVersion,
    expanded = false,
  }: {
    readonly play: GamePlay;
    readonly offense: GameTeam | null;
    readonly defense: GameTeam | null;
    readonly replayVersion: number;
    readonly expanded?: boolean;
  }) => {
    const theme = useTheme();
    const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const model = useMemo(() => buildPlayAnimation(play), [play]);
    const patternId = useId().replaceAll(':', '');
    const offenseColor = teamColor(offense, theme.palette.primary.dark);
    const defenseColor = teamColor(defense, theme.palette.grey[800]);
    const path = trajectoryPath(model);
    const status = playStatusLabel(model);
    const factualLocation =
      model.startBallPosition === null && model.endBallPosition === null
        ? 'Field position unavailable.'
        : `${model.startBallPosition === null ? 'Unknown start' : formatYardLine(model.startBallPosition)} to ${model.endBallPosition === null ? 'unknown end' : formatYardLine(model.endBallPosition)}.`;
    const durationSeconds = model.durationMs / 1000;

    return (
      <Box>
        <Box
          key={`${play.id}-${replayVersion}-${reduceMotion ? 'reduced' : 'motion'}`}
          data-testid="tactical-field"
          sx={{
            overflow: 'hidden',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'appSurfaces.borderStrong',
            bgcolor: '#123D2C',
            boxShadow: 'inset 0 0 34px rgba(0, 0, 0, 0.34)',
          }}
        >
          <svg
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            width="100%"
            role="img"
            aria-label={`${animationCategoryLabel(model)} schematic play visualization. ${factualLocation} Player movement is schematic, not tracking data.`}
            style={{
              display: 'block',
              aspectRatio: expanded ? '12 / 5' : '12 / 5.3',
            }}
          >
            <defs>
              <pattern
                id={patternId}
                width="100"
                height={FIELD_HEIGHT}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M 0 0 V ${FIELD_HEIGHT}`}
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="2"
                />
              </pattern>
            </defs>
            <rect
              width={VIEWBOX_WIDTH}
              height={VIEWBOX_HEIGHT}
              fill="#123D2C"
            />
            <rect
              x="0"
              y={FIELD_TOP}
              width={PLAYING_FIELD_START}
              height={FIELD_HEIGHT}
              fill={offenseColor}
              opacity="0.82"
            />
            <rect
              x={PLAYING_FIELD_START + PLAYING_FIELD_WIDTH}
              y={FIELD_TOP}
              width={PLAYING_FIELD_START}
              height={FIELD_HEIGHT}
              fill={defenseColor}
              opacity="0.82"
            />
            <rect
              x={PLAYING_FIELD_START}
              y={FIELD_TOP}
              width={PLAYING_FIELD_WIDTH}
              height={FIELD_HEIGHT}
              fill={`url(#${patternId})`}
            />
            <rect
              x="1"
              y={FIELD_TOP}
              width={VIEWBOX_WIDTH - 2}
              height={FIELD_HEIGHT}
              fill="none"
              stroke="rgba(255,255,255,0.72)"
              strokeWidth="3"
            />

            {Array.from({ length: 9 }, (_, index) => (index + 1) * 10).map(
              (yard) => (
                <g key={yard}>
                  <text
                    x={yardToX(yard)}
                    y="66"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.72)"
                    fontSize="22"
                    fontWeight="800"
                  >
                    {yard <= 50 ? yard : 100 - yard}
                  </text>
                  <text
                    x={yardToX(yard)}
                    y="478"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.72)"
                    fontSize="22"
                    fontWeight="800"
                    transform={`rotate(180 ${yardToX(yard)} 478)`}
                  >
                    {yard <= 50 ? yard : 100 - yard}
                  </text>
                </g>
              ),
            )}
            <line
              x1={yardToX(50)}
              x2={yardToX(50)}
              y1={FIELD_TOP}
              y2={FIELD_TOP + FIELD_HEIGHT}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="4"
            />
            <text
              x="50"
              y="270"
              textAnchor="middle"
              dominantBaseline="middle"
              transform="rotate(-90 50 270)"
              fill="white"
              fontSize="25"
              fontWeight="900"
              letterSpacing="2"
            >
              {offense?.abbreviation ?? 'OWN'}
            </text>
            <text
              x="1150"
              y="270"
              textAnchor="middle"
              dominantBaseline="middle"
              transform="rotate(90 1150 270)"
              fill="white"
              fontSize="25"
              fontWeight="900"
              letterSpacing="2"
            >
              {defense?.abbreviation ?? 'OPP'}
            </text>
            {model.category === 'FIELD_GOAL' ? (
              <g
                data-testid="field-goal-uprights"
                stroke="#FFD54F"
                strokeWidth="6"
                fill="none"
              >
                <path d="M 1125 300 V 210 M 1175 300 V 210 M 1125 250 H 1175 M 1150 250 V 330" />
              </g>
            ) : null}

            {model.lineOfScrimmage === null ? null : (
              <g data-testid="line-of-scrimmage">
                <line
                  x1={yardToX(model.lineOfScrimmage)}
                  x2={yardToX(model.lineOfScrimmage)}
                  y1={FIELD_TOP}
                  y2={FIELD_TOP + FIELD_HEIGHT}
                  stroke={theme.palette.info.light}
                  strokeWidth="6"
                />
                <text
                  x={yardToX(model.lineOfScrimmage)}
                  y="22"
                  textAnchor="middle"
                  fill={theme.palette.info.light}
                  fontSize="18"
                  fontWeight="900"
                >
                  LOS
                </text>
              </g>
            )}
            {model.firstDownMarker === null ? null : (
              <g data-testid="first-down-marker">
                <line
                  x1={yardToX(model.firstDownMarker)}
                  x2={yardToX(model.firstDownMarker)}
                  y1={FIELD_TOP}
                  y2={FIELD_TOP + FIELD_HEIGHT}
                  stroke={theme.palette.warning.main}
                  strokeWidth="5"
                />
                <text
                  x={yardToX(model.firstDownMarker)}
                  y="22"
                  textAnchor="middle"
                  fill={theme.palette.warning.light}
                  fontSize="18"
                  fontWeight="900"
                >
                  1ST
                </text>
              </g>
            )}

            {model.startBallPosition === null ? null : (
              <circle
                data-testid="starting-ball-location"
                cx={yardToX(model.startBallPosition)}
                cy="270"
                r="10"
                fill="none"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="4"
              />
            )}
            {model.endBallPosition === null ? null : (
              <circle
                data-testid="ending-ball-location"
                cx={yardToX(model.endBallPosition)}
                cy="270"
                r="7"
                fill={theme.palette.warning.light}
                stroke="#271A08"
                strokeWidth="2"
              />
            )}

            {model.markers.map((marker) => {
              const start = pointToSvg(marker.start);
              const end = pointToSvg(marker.end);
              const x = reduceMotion ? end.x : start.x;
              const y = reduceMotion ? end.y : start.y;
              const fill =
                marker.side === 'offense' ? offenseColor : 'rgba(8,18,28,0.9)';
              const stroke =
                marker.side === 'offense' ? '#FFFFFF' : theme.palette.grey[100];
              return (
                <g
                  key={marker.id}
                  data-marker-side={marker.side}
                  data-primary={marker.primary || undefined}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={marker.primary ? 15 : 12}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={marker.primary ? 4 : 3}
                  >
                    {!reduceMotion && model.durationMs > 0 ? (
                      <>
                        <animate
                          attributeName="cx"
                          from={start.x}
                          to={end.x}
                          dur={`${durationSeconds}s`}
                          fill="freeze"
                        />
                        <animate
                          attributeName="cy"
                          from={start.y}
                          to={end.y}
                          dur={`${durationSeconds}s`}
                          fill="freeze"
                        />
                      </>
                    ) : null}
                  </circle>
                  <text
                    x={x}
                    y={y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="15"
                    fontWeight="900"
                    pointerEvents="none"
                  >
                    {marker.symbol}
                    {!reduceMotion && model.durationMs > 0 ? (
                      <>
                        <animate
                          attributeName="x"
                          from={start.x}
                          to={end.x}
                          dur={`${durationSeconds}s`}
                          fill="freeze"
                        />
                        <animate
                          attributeName="y"
                          from={start.y + 1}
                          to={end.y + 1}
                          dur={`${durationSeconds}s`}
                          fill="freeze"
                        />
                      </>
                    ) : null}
                  </text>
                </g>
              );
            })}

            {path === undefined ? null : (
              <>
                {model.ballPath?.showTrajectory ? (
                  <path
                    data-testid="ball-trajectory"
                    d={path}
                    fill="none"
                    stroke="rgba(255,255,255,0.66)"
                    strokeWidth="4"
                    strokeDasharray="10 12"
                    strokeLinecap="round"
                  />
                ) : null}
                <g data-testid="animated-football">
                  <ellipse
                    cx={reduceMotion ? pointToSvg(model.ballPath!.end).x : 0}
                    cy={reduceMotion ? pointToSvg(model.ballPath!.end).y : 0}
                    rx="10"
                    ry="6"
                    fill="#8B4A24"
                    stroke="white"
                    strokeWidth="2"
                  />
                  {!reduceMotion && model.durationMs > 0 ? (
                    <>
                      <animateMotion
                        dur={`${durationSeconds}s`}
                        path={path}
                        fill="freeze"
                      />
                      {model.category === 'PASS_INCOMPLETE' ? (
                        <animate
                          attributeName="opacity"
                          from="1"
                          to="0"
                          begin={`${durationSeconds * 0.72}s`}
                          dur={`${durationSeconds * 0.2}s`}
                          fill="freeze"
                        />
                      ) : null}
                    </>
                  ) : null}
                </g>
              </>
            )}

            {status === null ? null : (
              <g
                data-testid="play-result-overlay"
                opacity={reduceMotion || model.durationMs === 0 ? 1 : 0}
              >
                <rect
                  x="475"
                  y="225"
                  width="250"
                  height="72"
                  rx="12"
                  fill="rgba(8,18,28,0.9)"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="2"
                />
                <text
                  x="600"
                  y="270"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="30"
                  fontWeight="950"
                  letterSpacing="2"
                >
                  {status}
                </text>
                {!reduceMotion && model.durationMs > 0 ? (
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin={`${durationSeconds * 0.72}s`}
                    dur={`${durationSeconds * 0.16}s`}
                    fill="freeze"
                  />
                ) : null}
              </g>
            )}
          </svg>
        </Box>
        {model.locationMode === 'generic' ? (
          <Typography variant="caption" color="text.secondary">
            Exact field movement is unavailable; the centered animation is
            generic.
          </Typography>
        ) : null}
      </Box>
    );
  },
  (previous, next) =>
    previous.play.id === next.play.id &&
    previous.play.sequence === next.play.sequence &&
    previous.play.period === next.play.period &&
    previous.play.clock === next.play.clock &&
    previous.play.type === next.play.type &&
    previous.play.description === next.play.description &&
    previous.play.start.down === next.play.start.down &&
    previous.play.start.distance === next.play.start.distance &&
    previous.play.start.yardLine === next.play.start.yardLine &&
    previous.play.end.down === next.play.end.down &&
    previous.play.end.distance === next.play.end.distance &&
    previous.play.end.yardLine === next.play.end.yardLine &&
    previous.play.flags.scoring === next.play.flags.scoring &&
    previous.play.flags.penalty === next.play.flags.penalty &&
    previous.play.flags.turnover === next.play.flags.turnover &&
    previous.offense?.id === next.offense?.id &&
    previous.defense?.id === next.defense?.id &&
    previous.replayVersion === next.replayVersion &&
    previous.expanded === next.expanded,
);

TacticalField.displayName = 'TacticalField';

const PlaySummary = ({ play }: { readonly play: GamePlay }) => {
  const clock = formatGameClock(play.clock) ?? 'Time unavailable';
  const downDistance = formatDownDistance(play.start.down, play.start.distance);
  const start =
    play.start.yardLine === null ? null : formatYardLine(play.start.yardLine);
  const end =
    play.end.yardLine === null ? null : formatYardLine(play.end.yardLine);
  const situation = [downDistance, start].filter(Boolean).join(' · ');

  return (
    <Stack spacing={0.75} data-testid="visualized-play-summary">
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
      >
        <Chip
          size="small"
          variant="outlined"
          label={play.type.replace('_', ' ')}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontVariantNumeric: 'tabular-nums' }}
        >
          Q{play.period} · {clock}
        </Typography>
        {play.possessionTeam === null ? null : (
          <Typography variant="caption" sx={{ fontWeight: 850 }}>
            {play.possessionTeam.abbreviation} BALL
          </Typography>
        )}
      </Stack>
      {situation.length === 0 ? null : (
        <Typography sx={{ fontWeight: 850 }}>{situation}</Typography>
      )}
      <Typography>{play.description}</Typography>
      {start === null && end === null ? null : (
        <Typography variant="caption" color="text.secondary">
          Field result: {start ?? 'Unknown start'} → {end ?? 'Unknown end'}
        </Typography>
      )}
    </Stack>
  );
};

export const TacticalPlayVisualizer = ({
  game,
  play,
  replayMode,
  replayVersion,
  onReplay,
  onExpand,
  onReturnToLive,
}: {
  readonly game: Game;
  readonly play: GamePlay;
  readonly replayMode: boolean;
  readonly replayVersion: number;
  readonly onReplay: () => void;
  readonly onExpand: () => void;
  readonly onReturnToLive: () => void;
}) => {
  const { offense, defense } = playTeams(game, play);
  const isLive = game.status === 'IN_PROGRESS' || game.status === 'HALFTIME';
  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
      >
        <Chip
          size="small"
          color={replayMode ? 'secondary' : isLive ? 'success' : 'default'}
          label={replayMode ? 'REPLAY' : isLive ? 'LIVE PLAY' : 'LATEST PLAY'}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Player movement is a schematic visualization based on play-by-play data.">
          <IconButton
            size="small"
            aria-label="About schematic play visualization"
          >
            <InfoOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        {isLive && replayMode ? (
          <Button size="small" onClick={onReturnToLive}>
            Return to Live
          </Button>
        ) : null}
        <Button size="small" startIcon={<ReplayRounded />} onClick={onReplay}>
          Replay
        </Button>
        <Button
          size="small"
          startIcon={<FullscreenRounded />}
          onClick={onExpand}
        >
          Expand
        </Button>
      </Stack>
      <TacticalField
        play={play}
        offense={offense}
        defense={defense}
        replayVersion={replayVersion}
      />
      <PlaySummary play={play} />
      <Typography variant="caption" color="text.secondary">
        Field position and play result use stored play-by-play data. Formation
        and player movement are schematic.
      </Typography>
    </Stack>
  );
};

export const ExpandedPlayVisualizerDialog = ({
  open,
  game,
  play,
  plays,
  selectedPlayId,
  replayMode,
  replayVersion,
  onClose,
  onSelectPlay,
  onReplay,
  onReturnToLive,
}: {
  readonly open: boolean;
  readonly game: Game;
  readonly play: GamePlay;
  readonly plays: readonly GamePlay[];
  readonly selectedPlayId: string | null;
  readonly replayMode: boolean;
  readonly replayVersion: number;
  readonly onClose: () => void;
  readonly onSelectPlay: (playId: string) => void;
  readonly onReplay: () => void;
  readonly onReturnToLive: () => void;
}) => {
  const { offense, defense } = playTeams(game, play);
  const isLive = game.status === 'IN_PROGRESS' || game.status === 'HALFTIME';
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      aria-labelledby="expanded-play-heading"
    >
      <DialogTitle id="expanded-play-heading">
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <Box>
            <Typography variant="overline" color="primary.main">
              PLAY VISUALIZATION
            </Typography>
            <Typography
              component="span"
              variant="h5"
              sx={{ display: 'block', fontWeight: 900 }}
            >
              Q{play.period} ·{' '}
              {formatGameClock(play.clock) ?? 'Time unavailable'}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            onClick={onClose}
            aria-label="Close expanded play visualization"
          >
            <CloseRounded />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              lg: 'minmax(0, 2fr) minmax(320px, 0.8fr)',
            },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Stack spacing={1.5} sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Chip
                size="small"
                label={
                  replayMode ? 'REPLAY' : isLive ? 'LIVE PLAY' : 'LATEST PLAY'
                }
              />
              <Button
                size="small"
                startIcon={<ReplayRounded />}
                onClick={onReplay}
              >
                Replay
              </Button>
              {isLive && replayMode ? (
                <Button size="small" onClick={onReturnToLive}>
                  Return to Live
                </Button>
              ) : null}
            </Stack>
            <TacticalField
              play={play}
              offense={offense}
              defense={defense}
              replayVersion={replayVersion}
              expanded
            />
            <PlaySummary play={play} />
          </Stack>
          <Box
            sx={{
              minWidth: 0,
              maxHeight: { lg: '72vh' },
              overflowY: { lg: 'auto' },
            }}
          >
            <PlayFeed
              plays={plays}
              selectedPlayId={selectedPlayId}
              onSelectPlay={onSelectPlay}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
