export type ContactMessageStatus = 'NEW' | 'READ' | 'RESOLVED' | 'SPAM';

export interface ContactSubmitRequest {
  readonly name: string;
  readonly email: string;
  readonly subject?: string;
  readonly message: string;
  readonly website?: string;
}

export interface ContactMessageRecord {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly subject: string | null;
  readonly message: string;
  readonly status: ContactMessageStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ContactMessageListFilters {
  readonly limit?: number;
  readonly status?: ContactMessageStatus;
}

export interface ContactMessagePage {
  readonly messages: readonly ContactMessageRecord[];
  readonly nextCursor: string | null;
}

export interface MessageResponse {
  readonly message: string;
}
