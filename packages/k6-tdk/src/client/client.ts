export const Version = {
  ocis: 'ocis',
  occ: 'occ',
  nc: 'nc',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Version = (typeof Version)[keyof typeof Version];

export const versionSupported = (currentVersion: Version, ...allowedVersions: Version[]) => {
  return allowedVersions.includes(currentVersion);
};

export const versionGuard = (currentVersion: Version, ...allowedVersions: Version[]) => {
  if (versionSupported(currentVersion, ...allowedVersions)) {
    return;
  }

  throw new Error(`you are using the client version [${currentVersion}] which is not compatible with the test,
  the following versions are compatible: [${allowedVersions.join(', ')}]`);
};
