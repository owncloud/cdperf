import { ErrorEvent, MessageEvent } from 'k6/experimental/websockets'
import { z } from 'zod'

import { EngineType, KV, MessageType, SocketType } from './io'

export abstract class Handler {
  protected abstract notify(p: { engineType?: EngineType, socketType?: SocketType, messageType?: MessageType, messageData: KV })

  // eslint-disable-next-line class-methods-use-this
  protected handleError(event: MessageEvent | ErrorEvent) {
    console.error(event)
  }

  protected handleMessage(event: MessageEvent | ErrorEvent) {
    if ('error' in event) {
      this.handleError(event)
      return
    }

    const message = 'data' in event ? event : undefined
    if (!message) {
      return
    }

    const engineParsedType = z.coerce.number().safeParse(message.data[0])
    const engineType = engineParsedType.success ? SocketType.parse(engineParsedType.data) : undefined

    const socketParsedType = z.coerce.number().safeParse(message.data[1])
    const socketType = socketParsedType.success ? SocketType.parse(socketParsedType.data) : undefined

    const parsedResponse = String(message.data).match(/\[.+\]/)
    const [, messageData = {}] = parsedResponse ? JSON.parse(parsedResponse[0]) : []
    const messageParsedType = MessageType.safeParse(messageData.type)
    const messageType = messageParsedType.success ? messageParsedType.data : undefined

    this.notify({ engineType, socketType, messageType, messageData })
  }
}
