import {defineConfig} from 'vitepress';
import * as glob from 'fast-glob';
import * as path from 'path';
import {createRequire} from 'module'
import {upperFirst, lowerCase} from 'lodash'

// @ts-ignore
const require = createRequire(import.meta.url)
const pkg = require('../package.json')

const sidebarK6Tests = () => {
  const testItems = Object.values(glob.sync('**/*.md', {
      cwd: path.join(path.dirname(require.resolve('../packages/k6-tests/package.json')), 'src')
    }).reduce((acc, p) => {
      const [category, name] = p.split('/')

      if (!acc[category]) {
        acc[category] = {
          text: upperFirst(category),
          collapsed: false,
          items: []
        }
      }

      const pathInfo = path.parse(p)
      acc[category].items.push({text: lowerCase(name), link: path.join('/k6-tests/', pathInfo.dir, pathInfo.name)},)

      return acc
    }, {})
  )
  return {
    '/k6-tests/': [
      {
        text: 'Introduction',
        collapsed: false,
        items: [
          {text: 'Welcome', link: '/k6-tests/'},
          {text: 'Considerations', link: '/k6-tests/considerations'},
          {text: 'Hot to run', link: '/k6-tests/run'},
          {text: 'Available options', link: '/k6-tests/options'},
        ]
      },
      ...testItems,
    ],
  }
}

const vitePressConfig = defineConfig({
  lang: 'en-US',
  title: 'cdPerf',
  description: 'ownCloud cloud testing toolbox.',
  lastUpdated: true,
  cleanUrls: true,
  base: '/cdperf/',
  srcExclude: [
    'README.md'
  ],
  head: [
    ['meta', {name: 'theme-color', content: '#3c8772'}],
  ],

  rewrites: {
    'docs/(.*)': '(.*)',
    'packages/:pkg/:ds(docs|src)/(.*)': ':pkg/(.*)',
  },

  themeConfig: {
    nav: [
      {
        text: 'Infinite Scale',
        link: 'https://github.com/owncloud/ocis'
      },
      {
        text: 'Web',
        link: 'https://github.com/owncloud/web'
      },
      {
        text: 'ownCloud',
        link: 'https://owncloud.com/'
      },
      {
        text: pkg.version,
        items: [
          {
            text: 'Contributing',
            link: 'https://github.com/owncloud/cdperf/blob/main/.github/contributing.md'
          }
        ]
      }
    ],

    sidebar: {
      ...sidebarK6Tests()
    },

    socialLinks: [
      {icon: 'github', link: 'https://github.com/owncloud/cdperf'}
    ],

    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: `Copyright (c) ${new Date().getFullYear()} ownCloud GmbH <https://owncloud.com>`
    },
  }
})

export default vitePressConfig
