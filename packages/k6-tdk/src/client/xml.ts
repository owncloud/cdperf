import { create } from 'xmlbuilder2'

import { Platform } from '@/values'

const namespace: Readonly<Record<string, string>> = {
  oc: 'http://owncloud.org/ns',
  dav: 'DAV:'
}

const createProlog = () => {
  return create({ version: '1.0', encoding: 'UTF-8' })
}

type PlatformXml<
  OCIS extends Record<string, unknown> = {},
  OCC extends Record<string, unknown> = OCIS,
  NC extends Record<string, unknown> = OCC,
> = {
  [Platform.ownCloudInfiniteScale]: (p: OCIS) => string;
  [Platform.ownCloudServer]: (p: OCC) => string;
  [Platform.nextcloud]: (p: NC) => string;
}

/**
 * resource.*
 */
export const RESOURCE__get_resource_properties: PlatformXml = {
  [Platform.ownCloudInfiniteScale]() {
    return createProlog()
      .ele(namespace.dav, 'propfind')
      .ele(namespace.dav, 'prop')
      .ele(namespace.oc, 'fileid').up()
      .ele(namespace.oc, 'tags').up()
      .end()
  },
  [Platform.ownCloudServer]() {
    return this[Platform.ownCloudInfiniteScale]({})
  },
  [Platform.nextcloud]() {
    return this[Platform.ownCloudServer]({})
  }
}

/**
 * search.*
 */
export const SEARCH__search_for_resources: PlatformXml<
  { searchQuery: string, searchLimit?: number },
  { searchQuery: string, searchLimit?: number },
  { root: string, searchQuery: string, searchLimit?: number }
> = {
  [Platform.ownCloudInfiniteScale](p) {
    const { searchQuery, searchLimit = 100 } = p

    return createProlog()
      .ele(namespace.oc, 'search-files')
      .ele(namespace.dav, 'prop')
      .ele(namespace.oc, 'fileid')
      .up()
      .up()
      .ele(namespace.oc, 'search')
      .ele(namespace.oc, 'pattern')
      .txt(searchQuery)
      .up()
      .ele(namespace.oc, 'limit')
      .txt(searchLimit.toString())
      .end()

  },
  [Platform.ownCloudServer](p) {
    return this[Platform.ownCloudInfiniteScale](p)
  },
  [Platform.nextcloud](p) {
    const { root, searchQuery, searchLimit = 100 } = p
    return createProlog()
      .ele(namespace.dav, 'searchrequest')
      .ele(namespace.dav, 'basicsearch')
      .ele(namespace.dav, 'select')
      .ele(namespace.dav, 'prop')
      .ele(namespace.oc, 'fileid')
      .up()
      .up()
      .up()
      .ele(namespace.dav, 'from')
      .ele(namespace.dav, 'scope')
      .ele(namespace.dav, 'href')
      .txt(`/files/${root}`)
      .up()
      .ele(namespace.dav, 'depth')
      .txt('infinity')
      .up()
      .up()
      .up()
      .ele(namespace.dav, 'where')
      .ele(namespace.dav, 'like')
      .ele(namespace.dav, 'prop')
      .ele(namespace.dav, 'displayname')
      .up()
      .up()
      .ele(namespace.dav, 'literal')
      .txt(searchQuery)
      .up()
      .up()
      .ele(namespace.dav, 'orderby')
      .up()
      .ele(namespace.dav, 'limit')
      .ele(namespace.dav, 'nresults')
      .txt(searchLimit.toString())
      .end()
  }
}

export const SEARCH__search_for_resources_by_tag: PlatformXml<
  { tag: string, searchLimit?: number }
> = {
  [Platform.ownCloudInfiniteScale](p) {
    const { tag, searchLimit = 100 } = p

    return createProlog()
      .ele(namespace.oc, 'search-files')
      .ele(namespace.dav, 'prop')
      .ele(namespace.oc, 'fileid')
      .up()
      .up()
      .ele(namespace.oc, 'search')
      .ele(namespace.oc, 'pattern')
      .txt(`Tags:"${tag}"`)
      .up()
      .ele(namespace.oc, 'limit')
      .txt(searchLimit.toString())
      .end()
  },
  [Platform.ownCloudServer](p) {
    const { tag } = p
    return createProlog()
      .ele(namespace.oc, 'filter-files')
      .ele(namespace.dav, 'prop')
      .ele(namespace.oc, 'fileid')
      .up()
      .up()
      .ele(namespace.oc, 'filter-rules')
      .ele(namespace.oc, 'systemtag')
      .txt(tag)
      .end()
  },
  [Platform.nextcloud](p) {
    return this[Platform.ownCloudServer](p)
  }
}


/**
 * tag.*
 */
export const TAG__get_tags: PlatformXml = {
  [Platform.ownCloudInfiniteScale]() {
    return ''
  },
  [Platform.ownCloudServer]() {
    return createProlog()
      .ele(namespace.dav, 'propfind')
      .ele(namespace.dav, 'prop')
      .ele(namespace.oc, 'display-name')
      .up()
      .ele(namespace.oc, 'user-visible')
      .up()
      .ele(namespace.oc, 'user-assignable')
      .up()
      .ele(namespace.oc, 'id')
      .end()
  },
  [Platform.nextcloud]() {
    return this[Platform.ownCloudServer]({})
  }
}

export const TAG__get_tags_for_resource: PlatformXml = {
  [Platform.ownCloudInfiniteScale]() {
    return createProlog()
      .ele(namespace.dav, 'propfind')
      .ele(namespace.dav, 'prop')
      .ele(namespace.oc, 'fileid').up()
      .ele(namespace.oc, 'tags').up()
      .end()
  },
  [Platform.ownCloudServer]() {
    return TAG__get_tags[Platform.ownCloudServer]({})
  },
  [Platform.nextcloud]() {
    return this[Platform.ownCloudServer]({})
  }
}
