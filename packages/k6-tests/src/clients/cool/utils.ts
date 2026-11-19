import { EngineType, SocketType } from './io'

export const encodeData = (p: { engineType: EngineType, socketType?: SocketType, data?: unknown }) => {
  return [p.engineType, p.socketType, JSON.stringify(p.data)]
    .filter((v) => {
      return v !== undefined
    })
    .join('')
}
