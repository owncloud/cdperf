import * as console from 'console'
import { EventName, WebSocket } from 'k6/experimental/websockets'

import { Handler } from './handler'
import { EngineType, Instruction, KV, Lifetime, MessageType, SocketType } from './io'
import { buildInstructionId } from './utils'

export class Session extends Handler {
  private instructions: Map<string, Set<Instruction>>

  private socket: WebSocket

  constructor(p: { url: string}) {
    super()
    this.socket = new WebSocket(p.url)
    this.instructions = new Map()
    this.socket.addEventListener('error' as EventName, this.handleError.bind(this))
    this.socket.addEventListener('message' as EventName, this.handleMessage.bind(this))
  }

  protected notify(p: {
    engineType?: EngineType,
    socketType?: SocketType,
    messageType?: MessageType,
    messageData: KV
  }) {
    const id = buildInstructionId(p)

    if (!this.instructions.has(id)) {
      return
    }

    const instructionSet = this.instructions.get(id)!

    instructionSet.forEach((instruction) => {
      const { lifetime, fn } = instruction

      if (lifetime === Lifetime.enum.once) {
        instructionSet.delete(instruction)
      }

      if (typeof fn === 'function') {
        fn({ messageData: p.messageData })
      }
    })

    if (!instructionSet.size) {
      this.instructions.delete(id)
    }
  }

  async publish(p: { data: string | ArrayBuffer }) {
    this.socket.send(p.data)
  }

  subscribe(p: {
    strategy?: Lifetime,
    engineType?: EngineType,
    socketType?: SocketType,
    messageType?: MessageType,
    fn: Instruction['fn'],
  }) {
    const id = buildInstructionId(p)

    if (!this.instructions.has(id)) {
      this.instructions.set(id, new Set())
    }

    this.instructions.get(id)!.add({ lifetime: p.strategy || Lifetime.enum.constant, fn: p.fn })
  }

  disconnect() {
    this.socket.close()
  }

  async waitFor(p: { engineType?: EngineType, socketType?: SocketType, messageType?: MessageType }): Promise<{ messageData: KV }> {
    return new Promise((resolve) => {
      this.subscribe({ ...p, strategy: Lifetime.enum.once, fn: resolve })
    })
  }
}
