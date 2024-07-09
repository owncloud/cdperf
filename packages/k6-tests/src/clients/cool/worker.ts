import { EngineType, MessageType, Session, SocketType } from './io'

export const docsWorker = async (p: { session: Session }): Promise<void> => {

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
