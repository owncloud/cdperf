import * as dav from './dav'
import * as dav_files from './dav-files'
import * as dav_spaces from './dav-spaces'
import * as dav_systemtags from './dav-systemtags'
import * as dav_systemtagsRelations from './dav-systemtags_relations'
import * as graph_v1_applications from './graph-v1-applications'
import * as graph_v1_drives from './graph-v1-drives'
import * as graph_v1_extensions_orgLibreGraph_tags from './graph-v1-extensions-org_libre_graph-tags'
import * as graph_v1_groups from './graph-v1-groups'
import * as graph_v1_me from './graph-v1-me'
import * as graph_v1_users from './graph-v1-users'
import * as graph_v1beta1_drive_invite from './graph-v1beta1-drive-invite'

export * from './endpoints'
export const endpoints = {
  dav: {
    ...dav,
    files: dav_files,
    spaces: dav_spaces,
    systemtags: dav_systemtags,
    systemtags_relations: dav_systemtagsRelations
  },
  graph: {
    v1: {
      applications: graph_v1_applications,
      drives: graph_v1_drives,
      extensions: {
        org_libre_graph: {
          tags: graph_v1_extensions_orgLibreGraph_tags
        }
      },
      groups: graph_v1_groups,
      me: graph_v1_me,
      users: graph_v1_users
    },
    v1beta1: {
      invite: graph_v1beta1_drive_invite
    }
  }
}
