import { JSONValue } from 'k6'
import { expect, test } from 'vitest'

import { queryJson, queryXml } from './query'

/* eslint-disable max-len */
// language=JSON
const testJson = `
  {
    "value": [
      {
        "driveAlias": "personal/admin",
        "driveType": "personal",
        "id": "cedbfc9f-e0cc-40ba-920d-310db51236f2$8702a6d9-55af-48d4-97ce-cd952f14ff35",
        "lastModifiedDateTime": "2023-04-16T12:47:52.080894+02:00",
        "name": "Admin",
        "owner": {
          "user": {
            "displayName": "",
            "id": "8702a6d9-55af-48d4-97ce-cd952f14ff35"
          }
        },
        "quota": {
          "remaining": 150751928320,
          "state": "normal",
          "total": 0,
          "used": 0
        },
        "root": {
          "eTag": "\\"cc07ebfccd5a2a749a2f27a65e8dd5ea\\"",
          "id": "cedbfc9f-e0cc-40ba-920d-310db51236f2$8702a6d9-55af-48d4-97ce-cd952f14ff35",
          "webDavUrl": "https://localhost:9200/dav/spaces/cedbfc9f-e0cc-40ba-920d-310db51236f2$8702a6d9-55af-48d4-97ce-cd952f14ff35"
        },
        "webUrl": "https://localhost:9200/f/cedbfc9f-e0cc-40ba-920d-310db51236f2$8702a6d9-55af-48d4-97ce-cd952f14ff35"
      },
      {
        "driveAlias": "virtual/shares",
        "driveType": "virtual",
        "id": "a0ca6a90-a365-4782-871e-d44447bbc668$a0ca6a90-a365-4782-871e-d44447bbc668",
        "name": "Shares",
        "quota": {
          "remaining": 0,
          "state": "exceeded",
          "total": 0,
          "used": 0
        },
        "root": {
          "id": "a0ca6a90-a365-4782-871e-d44447bbc668$a0ca6a90-a365-4782-871e-d44447bbc668",
          "webDavUrl": "https://localhost:9200/dav/spaces/a0ca6a90-a365-4782-871e-d44447bbc668$a0ca6a90-a365-4782-871e-d44447bbc668"
        },
        "webUrl": "https://localhost:9200/f/a0ca6a90-a365-4782-871e-d44447bbc668$a0ca6a90-a365-4782-871e-d44447bbc668"
      }
    ]
  }
`

test.each([
  { expression: 'foo', val: { foo: 1, bar: '2' }, expected:[1] },
  { expression: '$..foo', val: { foo: 1, bar: '2' }, expected:[1] },
  { expression: '$..foo', val: [{ foo: 1, bar: '2' }], expected:[1] },
  {
    expression: "$.value[?(@.driveType === 'personal')].id",
    val: testJson,
    expected:['cedbfc9f-e0cc-40ba-920d-310db51236f2$8702a6d9-55af-48d4-97ce-cd952f14ff35']
  }
])('queryJson($expression) -> $expected', ({ expression, val, expected }) => {
  if (typeof val !== 'string') {
    expect(queryJson(expression, JSON.stringify(val))).toMatchObject(expected)
  }
  expect(queryJson(expression, val as JSONValue)).toMatchObject(expected)
})

// language=XML
const testXml = `<?xml version="1.0" encoding="UTF-8"?>
  <d:multistatus xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns" xmlns:s="http://sabredav.org/ns">
    <d:response>
      <d:href>/remote.php/dav/spaces/cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0/</d:href>
      <d:propstat>
        <d:prop>
          <oc:permissions>RDNVCKZ</oc:permissions>
          <oc:favorite>0</oc:favorite>
          <oc:fileid>cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0!d338188d-1906-4f51-834c-990a7eb675d0</oc:fileid>
          <oc:file-parent>cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0</oc:file-parent>
          <oc:name>hsmogxsuep</oc:name>
          <oc:owner-id>hsmogxsuep</oc:owner-id>
          <oc:owner-display-name>hsmogxsuep</oc:owner-display-name>
          <oc:privatelink>https://localhost:9200/f/cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0%21d338188d-1906-4f51-834c-990a7eb675d0</oc:privatelink>
          <oc:size>0</oc:size>
          <d:getlastmodified>Mon, 17 Apr 2023 09: 50: 28 GMT</d:getlastmodified>
          <d:getetag>"84d523610f6a61566f3414eb7f31bc1e"</d:getetag>
          <d:resourcetype>
            <d:collection />
          </d:resourcetype>
          <oc:tags />
        </d:prop>
        <d:status>HTTP/1.1 200 OK</d:status>
      </d:propstat>
      <d:propstat>
        <d:prop>
          <oc:shareroot />
          <oc:share-types />
          <d:getcontentlength />
          <d:getcontenttype />
          <oc:downloadURL />
        </d:prop>
        <d:status>HTTP/1.1 404 Not Found</d:status>
      </d:propstat>
    </d:response>
    <d:response>
      <d:href>/remote.php/dav/spaces/cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0/foo/</d:href>
      <d:propstat>
        <d:prop>
          <oc:permissions>RDNVCKZ</oc:permissions>
          <oc:favorite>0</oc:favorite>
          <oc:fileid>cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0!10d93193-cbd1-4559-b039-b3399dbf1844</oc:fileid>
          <oc:file-parent>cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0!d338188d-1906-4f51-834c-990a7eb675d0</oc:file-parent>
          <oc:name>foo</oc:name>
          <oc:owner-id>hsmogxsuep</oc:owner-id>
          <oc:owner-display-name>hsmogxsuep</oc:owner-display-name>
          <oc:share-types>
            <oc:share-type>0</oc:share-type>
          </oc:share-types>
          <oc:privatelink>https:
            //localhost:9200/f/cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0%2110d93193-cbd1-4559-b039-b3399dbf1844</oc:privatelink>
          <oc:size>0</oc:size>
          <d:getlastmodified>Sat, 08 Apr 2023 11: 34: 35 GMT</d:getlastmodified>
          <d:getetag>"9e3e4ee260281b2411b23d0c32cadfca"</d:getetag>
          <d:resourcetype>
            <d:collection />
          </d:resourcetype>
          <oc:tags>foo bar, fff</oc:tags>
        </d:prop>
        <d:status>HTTP/1.1 200 OK</d:status>
      </d:propstat>
      <d:propstat>
        <d:prop>
          <oc:shareroot />
          <d:getcontentlength />
          <d:getcontenttype />
          <oc:downloadURL />
        </d:prop>
        <d:status>HTTP/1.1 404 Not Found</d:status>
      </d:propstat>
    </d:response>
    <d:response>
      <d:href>/remote.php/dav/spaces/cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0/bar/</d:href>
      <d:propstat>
        <d:prop>
          <oc:permissions>RDNVCKZ</oc:permissions>
          <oc:favorite>0</oc:favorite>
          <oc:fileid>cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0!8b1a7644-ba04-43fe-a9c7-9009eb42f2c8</oc:fileid>
          <oc:file-parent>cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0!d338188d-1906-4f51-834c-990a7eb675d0</oc:file-parent>
          <oc:name>bar</oc:name>
          <oc:owner-id>hsmogxsuep</oc:owner-id>
          <oc:owner-display-name>hsmogxsuep</oc:owner-display-name>
          <oc:privatelink>https://localhost:9200/f/cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0%218b1a7644-ba04-43fe-a9c7-9009eb42f2c8</oc:privatelink>
          <oc:size>0</oc:size>
          <d:getlastmodified>Mon, 17 Apr 2023 09: 50: 28 GMT</d:getlastmodified>
          <d:getetag>"5f58a726e07ecc6fe629dc1ae7a4b588"</d:getetag>
          <d:resourcetype>
            <d:collection />
          </d:resourcetype>
          <oc:tags />
        </d:prop>
        <d:status>HTTP/1.1 200 OK</d:status>
      </d:propstat>
      <d:propstat>
        <d:prop>
          <oc:shareroot />
          <oc:share-types />
          <d:getcontentlength />
          <d:getcontenttype />
          <oc:downloadURL />
        </d:prop>
        <d:status>HTTP/1.1 404 Not Found</d:status>
      </d:propstat>
    </d:response>
  </d:multistatus>
`

test.each([
  {
    expression: "$..['d:href']",
    val: testXml,
    expected:[
      '/remote.php/dav/spaces/cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0/',
      '/remote.php/dav/spaces/cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0/foo/',
      '/remote.php/dav/spaces/cedbfc9f-e0cc-40ba-920d-310db51236f2$d338188d-1906-4f51-834c-990a7eb675d0/bar/'
    ]
  }
])('queryXml($expression) -> $expected', ({ expression, val, expected }) => {
   expect(queryXml(expression, val)).toMatchObject(expected)
})
