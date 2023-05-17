import { EngineType, MessageType, SocketType } from './io'

export const buildInstructionId = (p: { engineType?: EngineType, socketType?: SocketType, messageType?: MessageType }) => {
  const forbidden = new Set([NaN, null, undefined, false, ''])
  return [p.engineType, p.socketType, p.messageType]
    .map((v) => {
      return forbidden.has(v) ? '#' : v
    })
    .join('--')
}
