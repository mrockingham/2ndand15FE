import { z } from 'zod';

export const MAX_POWER_RANKINGS_IMPORT_BYTES = 1_048_576;

export class PowerRankingsImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PowerRankingsImportError';
  }
}

/** Minimal client-side shape check before sending to the backend PREVIEW
 * endpoint -- catches obviously malformed content early, but the backend
 * PREVIEW response is the authoritative validation surface. */
const importShapeSchema = z.object({
  season: z.number().int().min(1920).max(2100),
  edition: z.string().min(1),
  asOf: z.string().min(1),
  rankings: z.array(z.record(z.string(), z.unknown())).min(1),
});

export const parsePowerRankingsImportJson = (rawText: string): unknown => {
  const text = rawText.trim();
  if (text === '')
    throw new PowerRankingsImportError(
      'Paste or select a JSON file to import.',
    );
  if (new Blob([text]).size > MAX_POWER_RANKINGS_IMPORT_BYTES)
    throw new PowerRankingsImportError(
      'Power Rankings imports may not exceed 1 MiB.',
    );
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new PowerRankingsImportError('The import content is not valid JSON.');
  }
  const result = importShapeSchema.safeParse(parsed);
  if (!result.success)
    throw new PowerRankingsImportError(
      'The JSON must include season, edition, asOf, and a non-empty rankings array.',
    );
  return parsed;
};
