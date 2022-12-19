"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("../_chunks/dav-d6854223.js"),r=require("../_chunks/times-ca8727c2.js");require("k6/encoding"),require("k6/http");var t=require("../_chunks/options-e97d0c46.js");require("k6"),require("k6/metrics");var n=require("../_chunks/shared.lib-3ac2a002.js");require("k6/crypto");var o=[].concat(e._toConsumableArray(r.times_1(100,(function(){return{size:500,unit:"KB"}}))),e._toConsumableArray(r.times_1(50,(function(){return{size:5,unit:"MB"}}))),e._toConsumableArray(r.times_1(10,(function(){return{size:25,unit:"MB"}})))),i=new e.Factory(e.buildAccount({login:e.ACCOUNTS.EINSTEIN})),s={davUpload:new e.Upload,davDownload:new e.Download,davDelete:new e.Delete},u=t.options(e._objectSpread2({tags:{test_id:"upload-download-delete-many-small",issue_url:"github.com/owncloud/ocis/issues/1018"}},n.options({plays:s,files:o})));exports.default=function(){return n.upDownDelete({files:o,plays:s,credential:i.credential,account:i.account})},exports.options=u;
