export const Version = {
  legacy: 'legacy',
  latest: 'latest',
} as const;

export type Version = (typeof Version)[keyof typeof Version];
