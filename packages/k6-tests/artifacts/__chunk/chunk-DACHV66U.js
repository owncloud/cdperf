"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _chunkZVK6C7LCjs = require('./chunk-ZVK6C7LC.js');var _chunk3A537C5Ijs = require('./chunk-3A537C5I.js');var _chunkJNZX5NLLjs = require('./chunk-JNZX5NLL.js');var _chunkZIJPPAJ6js = require('./chunk-ZIJPPAJ6.js');var d=_chunkZIJPPAJ6js.a.call(void 0, _chunkZIJPPAJ6js.d.call(void 0, ));var _k6 = require('k6');var _execution = require('k6/execution'); var _execution2 = _interopRequireDefault(_execution);var F={vus:1,iterations:1,insecureSkipTLSVerify:!0},e={..._chunkZIJPPAJ6js.t.call(void 0, )},h= exports.b =async()=>{let r=_chunkJNZX5NLLjs.d.call(void 0, {pool:_chunkJNZX5NLLjs.b,n:_execution2.default.vu.idInTest}),o=_chunkZIJPPAJ6js.n.call(void 0, r.userLogin),y=await o.setOrGet("resources",async()=>_chunkZVK6C7LCjs.a.call(void 0, {root:e.seed.calendar.root,fromYear:e.seed.calendar.from_year,toYear:e.seed.calendar.to_year}).d.map(t=>_chunkZVK6C7LCjs.b.call(void 0, {v:t}))),s=await o.setOrGet("client",async()=>_chunkZIJPPAJ6js.v.call(void 0, r)),_=await o.setOrGet("root",async()=>{let t=await _chunk3A537C5Ijs.a.call(void 0, {client:s,userLogin:r.userLogin,platform:e.platform.type,resourceName:e.seed.container.name,resourceType:e.seed.container.type,isOwner:!1});return _k6.sleep.call(void 0, e.sleep.after_request),t.root});s.search.searchForResources({root:_,searchQuery:(0,d.sample)(y).resourceName}),_k6.sleep.call(void 0, e.sleep.after_iteration)},I= exports.c =h;exports.a = F; exports.b = h; exports.c = I;
