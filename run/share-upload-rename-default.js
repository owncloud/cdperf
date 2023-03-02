"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("./_chunks/index-f4220d5a.js"),t=require("k6/crypto"),r=require("k6/execution");function a(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}require("k6"),require("k6/http"),require("k6/encoding"),require("https://jslib.k6.io/url/1.0.0/index.js");var n=a(r),i={baseURL:__ENV.BASE_URL||"https://localhost:9200",authAdapter:__ENV.AUTH_ADAPTER==e.Adapter.basicAuth?e.Adapter.basicAuth:e.Adapter.openIDConnect,apiVersion:__ENV.API_VERSION==e.Version.legacy?e.Version.legacy:e.Version.latest,testFolder:"share-upload-rename-default",adminUser:{login:__ENV.ADMIN_LOGIN||"admin",password:__ENV.ADMIN_PASSWORD||"admin"},assets:{size:1024,quantity:10},k6:{vus:5,iterations:50,insecureSkipTLSVerify:!0}},o=new e.API(i.baseURL,i.apiVersion),s=i.k6;exports.default=function(r){var a=r.userInfos[n.default.vu.idInTest-1],s=o.user.get(a,i.authAdapter).user,d=[n.default.scenario.iterationInTest,"initial",s.login].join("-");o.dav.create(a.home,d,s.credential);var u=t.randomBytes(1024*i.assets.size);e.times_1(i.assets.quantity,(function(e){o.dav.upload(a.home,[d,e].join("/"),u,s.credential)}));var l=[n.default.scenario.iterationInTest,"final",s.login].join("-");o.dav.move(a.home,d,l,s.credential)},exports.options=s,exports.setup=function(){var t=o.user.get({login:i.adminUser.login,password:i.adminUser.password},i.authAdapter).user,r=e._objectSpread2(e._objectSpread2({},t),{},{home:String(o.me.driveInfo(t.login,t.credential,{selector:'value.#(driveType=="personal").id'}))});return o.dav.create(r.home,i.testFolder,t.credential),{adminInfo:r,userInfos:e.times_1(s.vus||1,(function(){var r=o.user.create({login:e.randomString(),password:e.randomString()},t.credential,i.authAdapter).user,a=o.share.create(i.testFolder,t.credential,r.login);return o.share.accept(a.id,r.credential),e._objectSpread2(e._objectSpread2({},r),{},{home:String(o.me.driveInfo([r.login,i.testFolder].join("/"),r.credential,{selector:'value.#(driveAlias=="mountpoint/'.concat(i.testFolder,'").id')}))})}))}},exports.teardown=function(e){var t=e.adminInfo,r=e.userInfos,a=o.user.get(t,i.authAdapter).user;o.dav.delete(t.home,i.testFolder,a.credential),r.forEach((function(e){return o.user.delete(e.login,a.credential)}))};
