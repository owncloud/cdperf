"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("../_chunks/dav-d6854223.js"),r=require("../_chunks/times-ca8727c2.js");require("k6/encoding"),require("k6/http");var i=require("../_chunks/options-e97d0c46.js");require("k6"),require("k6/metrics");var t=require("../_chunks/shared.lib-6bba0b02.js");require("k6/crypto");var s=r.times_1(1e3,(function(){return{size:1,unit:"KB"}})),u=new e.Factory(e.buildAccount({login:e.ACCOUNTS.EINSTEIN})),o=i.options(e._objectSpread2({tags:{test_id:"propfind-flat",issue_url:"github.com/owncloud/ocis/issues/1018"}},t.options({files:s})));exports.default=function(){return t.propfind({files:s,depth:1,credential:u.credential,account:u.account})},exports.options=o;
