import { EventName, WebSocket } from 'k6/experimental/websockets'

import { Handler } from './handler'
import { EngineType, Instruction, Lifetime, MessageType, SocketType } from './io'
import { buildInstructionId } from './utils'

export class Session extends Handler {
  private instructions: Map<string, Instruction>

  private socket: WebSocket

  constructor(p: { url: string, rom: (p: { session: Session }) => void }) {
    super()
    this.socket = new WebSocket(p.url)
    this.instructions = new Map()
    this.socket.addEventListener('error' as EventName, this.handleError.bind(this))
    this.socket.addEventListener('message' as EventName, this.handleMessage.bind(this))

    p.rom({ session: this })
  }

  protected notify(p: { engineType?: EngineType, socketType?: SocketType, messageType?: MessageType }) {
    const key = buildInstructionId(p)

    if (!this.instructions.has(key)) {
      return
    }
    const { lifetime, fn } = this.instructions.get(key)!

    if (lifetime === Lifetime.enum.once) {
      this.instructions.delete(key)
    }

    if (typeof fn === 'function') {
      fn()
    }
  }

  publish(p: { data: string | ArrayBuffer }) {
    this.socket.send(p.data)
  }

  subscribe(p: {
    strategy?: Lifetime,
    engineType?: EngineType,
    socketType?: SocketType,
    messageType?: MessageType,
    fn: () => void,
  }) {
    this.instructions.set(
      buildInstructionId(p),
      { lifetime: p.strategy || Lifetime.enum.constant, fn: p.fn }
    )
  }

  disconnect() {
    this.socket.close()
  }

  async waitFor(p: { engineType?: EngineType, socketType?: SocketType, messageType?: MessageType }): Promise<void> {
    return new Promise((resolve) => {
      this.subscribe({ ...p, strategy: Lifetime.enum.once, fn: resolve })
    })
  }
}
