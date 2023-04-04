export const Version = {
  ocis: 'ocis',
  occ: 'occ',
  nc: 'nc',
} as const;

export type Version = (typeof Version)[keyof typeof Version];
