export const TestRootType = {
  directory: 'directory',
  space: 'space'
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TestRootType = (typeof TestRootType)[keyof typeof TestRootType];

export const Embedded = 'embedded'
