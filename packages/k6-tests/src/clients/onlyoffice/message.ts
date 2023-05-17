import { FileInfo, UserAuth } from './info'
import { EngineType, MessageType, SocketType } from './io'
import { encodeData } from './utils'

const message = 'message'

export const tokenMessage = (p: { token: string }) => {
  return encodeData({
    engineType: EngineType.enum.message,
    socketType: SocketType.enum.connect,
    data: { token: p.token }
  })
}

export const pongMessage = () => {
  return encodeData({ engineType: EngineType.enum.pong })
}

export const authChangesAckMessage = () => {
  return encodeData({
    engineType: EngineType.enum.message,
    socketType: SocketType.enum.event,
    data: [message, { type: MessageType.enum.authChangesAck }]
  })
}

export const authMessage = (p: { token: string, documentId: string, fileInfo: FileInfo, userAuth: UserAuth }) => {
  return encodeData({
    engineType: EngineType.enum.message,
    socketType: SocketType.enum.event,
    data: [message,
      {
        type: MessageType.enum.auth,
        docid: p.documentId,
        documentCallbackUrl: JSON.stringify(p.userAuth),
        token: 'fghhfgsjdgfjs',
        user: {
          id: p.fileInfo.UserId,
          username: 'John Smith',
          firstname: null,
          lastname: null,
          indexUser: -1
        },
        editorType: 0,
        lastOtherSaveTime: -1,
        block: [],
        sessionId: null,
        sessionTimeConnect: null,
        sessionTimeIdle: 0,
        documentFormatSave: 65,
        view: false,
        isCloseCoAuthoring: false,
        openCmd: {
          c: 'open',
          id: p.documentId,
          userid: p.fileInfo.UserId,
          format: 'docx',
          url: p.userAuth.wopiSrc,
          title: 'new (47).docx',
          lcid: 7,
          nobase64: true,
          convertToOrigin: '.pdf.xps.oxps.djvu'
        },
        lang: 'de',
        mode: 'edit',
        permissions: {
          edit: true,
          copy: true,
          print: true
        },
        IsAnonymousUser: false,
        timezoneOffset: -120,
        coEditingMode: 'fast',
        jwtOpen: p.token,
        supportAuthChangesAck: true
      }
    ]
  })
}

export const saveChangesMessage = (p: { changes: string }) => {
  return encodeData({
    engineType: EngineType.enum.message,
    socketType: SocketType.enum.event,
    data: [message,
      {
        type: MessageType.enum.saveChanges,
        changes: p.changes,
        startSaveChanges: true,
        endSaveChanges: true,
        isCoAuthoring: false,
        isExcel: false,
        deleteIndex: null,
        unlock: false,
        releaseLocks: false
      }
    ]
  })
}

export const isSaveLockMessage = () => {
  return encodeData({
    engineType: EngineType.enum.message,
    socketType: SocketType.enum.event,
    data: [message, { type: MessageType.enum.isSaveLock }]
  })
}
