"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _chunkCALZNSJFjs = require('./chunk-CALZNSJF.js');var _chunkYRMRRP62js = require('./chunk-YRMRRP62.js');var r=_chunkYRMRRP62js.a.call(void 0, _chunkYRMRRP62js.d.call(void 0, ));var _k6 = require('k6');var _execution = require('k6/execution'); var _execution2 = _interopRequireDefault(_execution);var f={vus:1,iterations:1,insecureSkipTLSVerify:!0},y={..._chunkYRMRRP62js.s.call(void 0, )},P= exports.b =async()=>{let o=_chunkCALZNSJFjs.d.call(void 0, {pool:_chunkCALZNSJFjs.b,n:_execution2.default.vu.idInTest}),g=await _chunkYRMRRP62js.m.call(void 0, o.userLogin).setOrGet("client",async()=>_chunkYRMRRP62js.t.call(void 0, o)),n=()=>{let s=_chunkCALZNSJFjs.d.call(void 0, {pool:_chunkCALZNSJFjs.b,n:(0,r.random)(1,Math.min(f.vus||1,_chunkCALZNSJFjs.b.length))});return f.vus===1?s:s.userLogin===o.userLogin?n():s},t="";_execution2.default.scenario.iterationInTest%2?t=n().userLogin:t=(0,r.sample)(_chunkCALZNSJFjs.a).groupName,await g.search.searchForSharees({searchQuery:t,searchItemType:_chunkYRMRRP62js.q.folder}),_k6.sleep.call(void 0, y.sleep.after_iteration)},F= exports.c =P;exports.a = f; exports.b = P; exports.c = F;