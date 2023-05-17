import { FileInfo, UserAuth } from './info'
import { EngineType, MessageType, Session, SocketType } from './io'
import {
  authMessage,
  isSaveLockMessage,
  saveChangesMessage,
  tokenMessage
} from './message'
import { docsRom } from './rom'

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
    this.session = new Session({ url: p.url, rom: docsRom })
  }

  async establishSession(): Promise<void> {
    await this.session.waitFor({ engineType: EngineType.enum.open })
    this.session.publish({ data: tokenMessage({ token: this.token }) })
    await this.session.waitFor({ engineType: EngineType.enum.message, socketType: SocketType.enum.connect })
    this.session.publish({
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
      messageType: MessageType.enum.auth
    })
  }

  async makeChanges(p: { changes: string }) {
    this.session.publish({ data: isSaveLockMessage() })
    await this.session.waitFor({
      engineType: EngineType.enum.message,
      socketType: SocketType.enum.event,
      messageType: MessageType.enum.saveLock
    })
    this.session.publish({ data: saveChangesMessage(p) })
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
