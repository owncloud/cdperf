import { sleep } from 'k6'

import { FileInfo, UserAuth } from './info'
import { EngineType, MessageType, Session, SocketType } from './io'
import {
  authMessage,
  isSaveLockMessage,
  saveChangesMessage,
  tokenMessage
} from './message'
import { docsWorker } from './worker'

export class Client {
  // @ts-ignore
  private session: Session

  private token: string

  private documentId: string

  private userAuth: UserAuth

  private fileInfo: FileInfo

  constructor(p: { url: string, token: string, documentId: string, userAuth: UserAuth, fileInfo: FileInfo }) {
    this.token = p.token
    this.documentId = p.documentId
    this.userAuth = p.userAuth
    this.fileInfo = p.fileInfo
    this.session = new Session({ url: p.url })
  }

  async establishSession(): Promise<void> {
    await docsWorker({ session: this.session })
    await this.session.waitFor({ engineType: EngineType.enum.open })
    await this.session.publish({ data: tokenMessage({ token: this.token }) })
    await this.session.waitFor({ engineType: EngineType.enum.message, socketType: SocketType.enum.connect })
    await this.session.publish({
      data: authMessage({
        token: this.token,
        userAuth: this.userAuth,
        fileInfo: this.fileInfo,
        documentId: this.documentId
      })
    })
    await this.session.waitFor({
      engineType: EngineType.enum.message,
      socketType: SocketType.enum.event,
      messageType: MessageType.enum.documentOpen
    })
  }

  async makeChanges(p: { changes: string }) {
    await this.session.publish({ data: isSaveLockMessage() })
    const { messageData: { saveLock: isLocked } } = await this.session.waitFor({
      engineType: EngineType.enum.message,
      socketType: SocketType.enum.event,
      messageType: MessageType.enum.saveLock
    })

    if (isLocked) {
      sleep(0.5)
      await this.makeChanges(p)
      return
    }

    await this.session.publish({ data: saveChangesMessage(p) })

    await this.session.waitFor({
      engineType: EngineType.enum.message,
      socketType: SocketType.enum.event,
      messageType: MessageType.enum.unSaveLock
    })
  }

  disconnect() {
    this.session.disconnect()
  }
}
