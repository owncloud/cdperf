import { sleep } from 'k6'
import { ErrorEvent } from 'k6/experimental/websockets'

import { FileInfo, UserAuth } from './info'
import { EngineType, MessageType, Session, SocketType } from './io'
import { docsWorker } from './worker'

export class Client {
  // @ts-ignore
  private session: Session

  private token: string

  private documentId: string

  private userAuth: UserAuth

  private fileInfo: FileInfo

  private wopiSrc: string

  constructor(p: { url: string, access_token: string, documentId: string, userAuth: UserAuth, fileInfo: FileInfo }) {

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { access_token, access_token_ttl } = p

    const appUrl = new URL(p.url)
    const wopiSrc = app_url.searchParams.get('WOPISrc')

    const wopiUrl = new URL(wopiSrc)
    wopiUrl.searchParams.set('access_token', access_token)
    wopiUrl.searchParams.set('access_token_ttl', access_token_ttl)

    const wssUrl = new URL(`wss://${appUrl.hostname}:${app_url.port}/cool/${encodeURIComponent(wopiUrl)}/ws`)
    wssUrl.searchParams.set('WOPISrc', wopiSrc)
    wssUrl.searchParams.set('compat', '/ws')

    this.token = p.token
    this.documentId = p.documentId
    this.userAuth = p.userAuth
    this.fileInfo = p.fileInfo
    this.wopiSrc = wopiSrc
    this.session = new Session({ url: wss_url })
  }

  onError(h: (event?: ErrorEvent) => void) {
    this.session.onError(h)
  }

  async establishSession(): Promise<void> {
    await docsWorker({ session: this.session })
    await this.session.waitFor({ engineType: EngineType.enum.open })
    await this.session.publish({ data: `load url=${this.wopiSrc} accessibilityState=false` +
                                 ' deviceFormFactor=desktop darkTheme=false timezone=America/Montreal' })
    await this.session.waitFor({ engineType: EngineType.enum.message, socketType: SocketType.enum.connect })
  }

  async makeChanges(p: { changes: Array<string> }) {
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

    p.changes.forEach(async (change) => {
      await this.session.publish({ data: change })
    })

    await this.session.publish({ data: 'save dontTerminateEdit=0 dontSaveIfUnmodified=0' })

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
