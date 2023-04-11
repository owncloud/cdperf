import * as api_v0_settings from './api-v0-settings'
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
import * as ocs_v2_apps_cloud_groups from './ocs-v2-apps-cloud-groups'
import * as ocs_v2_apps_cloud_users from './ocs-v2-apps-cloud-users'
import * as ocs_v2_apps_fileSharing_v1_sharees from './ocs-v2-apps-file_sharing-v1-sharees'
import * as ocs_v2_apps_fileSharing_v1_shares from './ocs-v2-apps-file_sharing-v1-shares'

export * from './endpoints'
export const endpoints = {
  api: {
    v0: {
      settings: api_v0_settings
    }
  },
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
    }
  },
  ocs: {
    v2: {
      apps: {
        cloud: {
          groups: ocs_v2_apps_cloud_groups,
          users: ocs_v2_apps_cloud_users
        },
        file_sharing: {
          v1: {
            sharees: ocs_v2_apps_fileSharing_v1_sharees,
            shares: ocs_v2_apps_fileSharing_v1_shares
          }
        }
      }
    }
  }
}
