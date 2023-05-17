import { EngineType, MessageType, Session, SocketType } from './io'
import { authChangesAckMessage, pongMessage } from './message'

export const docsRom = async (p: { session: Session }): Promise<void> => {
  p.session.subscribe({
    engineType: EngineType.enum.ping,
    fn: () => {
      p.session.publish({ data: pongMessage() })
    }
  })

  p.session.subscribe({
    engineType: EngineType.enum.message,
    socketType: SocketType.enum.event,
    messageType: MessageType.enum.authChanges,
    fn: () => {
      p.session.publish({ data: authChangesAckMessage() })
    }
  })
}
