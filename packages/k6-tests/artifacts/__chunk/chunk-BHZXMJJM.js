"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _chunkCS7A3AHCjs = require('./chunk-CS7A3AHC.js');var _chunkW4UVCWL6js = require('./chunk-W4UVCWL6.js');var _chunkCALZNSJFjs = require('./chunk-CALZNSJF.js');var _chunkYRMRRP62js = require('./chunk-YRMRRP62.js');var d=_chunkYRMRRP62js.a.call(void 0, _chunkYRMRRP62js.d.call(void 0, ));var _k6 = require('k6');var _execution = require('k6/execution'); var _execution2 = _interopRequireDefault(_execution);var F={vus:1,iterations:1,insecureSkipTLSVerify:!0},e={..._chunkYRMRRP62js.s.call(void 0, )},h= exports.b =async()=>{let r=_chunkCALZNSJFjs.d.call(void 0, {pool:_chunkCALZNSJFjs.b,n:_execution2.default.vu.idInTest}),o=_chunkYRMRRP62js.m.call(void 0, r.userLogin),y=await o.setOrGet("resources",async()=>_chunkCS7A3AHCjs.a.call(void 0, {root:e.seed.calendar.root,fromYear:e.seed.calendar.from_year,toYear:e.seed.calendar.to_year}).d.map(t=>_chunkCS7A3AHCjs.b.call(void 0, {v:t}))),s=await o.setOrGet("client",async()=>_chunkYRMRRP62js.t.call(void 0, r)),_=await o.setOrGet("root",async()=>{let t=await _chunkW4UVCWL6js.a.call(void 0, {client:s,userLogin:r.userLogin,platform:e.platform.type,resourceName:e.seed.container.name,resourceType:e.seed.container.type,isOwner:!1});return _k6.sleep.call(void 0, e.sleep.after_request),t.root});s.search.searchForResources({root:_,searchQuery:(0,d.sample)(y).resourceName}),_k6.sleep.call(void 0, e.sleep.after_iteration)},I= exports.c =h;exports.a = F; exports.b = h; exports.c = I;