import { z } from 'zod'

export const EngineType = z.nativeEnum({
  open: 0,
  close: 1,
  ping: 2,
  pong: 3,
  message: 4,
  upgrade: 5,
  noop: 6
} as const)
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type EngineType = z.infer<typeof EngineType>;

export const SocketType = z.nativeEnum({
  connect: 0,
  disconnect: 1,
  event: 2,
  ack: 3,
  error: 4,
  binaryEvent: 5,
  binaryAck: 6
} as const)
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type SocketType = z.infer<typeof SocketType>;

export const MessageType = z.enum([
  'auth',
  'authChanges',
  'authChangesAck',
  'saveChanges',
  'saveLock',
  'unSaveLock',
  'isSaveLock'
])
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type MessageType = z.infer<typeof MessageType>;

export const Lifetime = z.enum(['once', 'constant'])
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Lifetime = z.infer<typeof Lifetime>;

export type Instruction = {
  fn: () => void,
  lifetime: Lifetime
}
