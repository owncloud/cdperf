import { EngineType, MessageType, Session, SocketType } from './io'
import {
  authChangesAckMessage,
  pongMessage,
  unLockDocumentMessage
} from './message'

export const docsWorker = async (p: { session: Session }): Promise<void> => {
  p.session.subscribe({
    engineType: EngineType.enum.message,
    socketType: SocketType.enum.event,
    messageType: MessageType.enum.authChanges,
    fn: async () => {
      await p.session.publish({ data: authChangesAckMessage() })
    }
  })

  p.session.subscribe({
    engineType: EngineType.enum.message,
    socketType: SocketType.enum.event,
    messageType: MessageType.enum.connectState,
    fn: async () => {
      await p.session.publish({ data: unLockDocumentMessage() })
    }
  })

  p.session.subscribe({
    engineType: EngineType.enum.ping,
    fn: async () => {
      await p.session.publish({ data: pongMessage() })
    }
  })

  p.session.subscribe({
    engineType: EngineType.enum.message,
    socketType: SocketType.enum.event,
    messageType: MessageType.enum.error,
    fn: async ({ messageData }) => {
      console.error(messageData)
    }
  })

  p.session.subscribe({
    engineType: EngineType.enum.message,
    socketType: SocketType.enum.event,
    messageType: MessageType.enum.drop,
    fn: async ({ messageData }) => {
      console.error(messageData)
    }
  })
}
