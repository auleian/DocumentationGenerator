/**
 * Purely cosmetic, client-only display names for Dashboard cards. DocumentSession
 * has no title field on the backend and none is being added — this is a local
 * convenience layer only, keyed by session id.
 */
export type SessionNicknames = Record<string, string>;

export const SESSION_NICKNAMES_KEY = 'docgen.session-nicknames.v1';

/** Also used to remember the GeneratedDocument id produced for a session, so Review can reload it directly. */
export type SessionExtras = Record<string, { generatedDocumentId?: string }>;

export const SESSION_EXTRAS_KEY = 'docgen.session-extras.v1';
