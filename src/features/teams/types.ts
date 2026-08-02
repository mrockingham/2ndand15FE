export interface Team {
  readonly id: string;
  readonly league: 'NFL';
  readonly city: string;
  readonly name: string;
  readonly fullName: string;
  readonly abbreviation: string;
  readonly conference: 'AFC' | 'NFC';
  readonly division: 'East' | 'North' | 'South' | 'West';
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly logoUrl: string | null;
  readonly logoSource: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TeamListResponse {
  readonly data: readonly Team[];
}

export type ConferenceFilter = 'ALL' | Team['conference'];
