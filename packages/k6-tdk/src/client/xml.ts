import { create } from 'xmlbuilder2'

const namespace: Readonly<Record<string, string>> = {
  oc: 'http://owncloud.org/ns',
  dav: 'DAV:'
}

const createProlog = () => {
  return create({ version: '1.0', encoding: 'UTF-8' })
}


/**
 * resource.*
 */
export const RESOURCE__get_resource_properties = () => {
  return createProlog()
    .ele(namespace.dav, 'propfind')
    .ele(namespace.dav, 'prop')
    .ele(namespace.oc, 'fileid').up()
    .ele(namespace.oc, 'tags').up()
    .ele(namespace.dav, 'lockdiscovery').up()
    .end()
}

/**
 * search.*
 */
export const SEARCH__search_for_resources = (p: { searchQuery: string, searchLimit?: number }) => {
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
}


export const SEARCH__search_for_resources_by_tag = (p: { tag: string, searchLimit?: number }) => {
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
}
