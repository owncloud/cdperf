"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _chunkJIKIJ2QAjs = require('./chunk-JIKIJ2QA.js');var _chunk4OUGER52js = require('./chunk-4OUGER52.js');var _chunkD6O6GW4Cjs = require('./chunk-D6O6GW4C.js');var _chunkA7YP6BZQjs = require('./chunk-A7YP6BZQ.js');var r=_chunkA7YP6BZQjs.a.call(void 0, _chunkA7YP6BZQjs.d.call(void 0, ));var _k6 = require('k6');var _execution = require('k6/execution'); var _execution2 = _interopRequireDefault(_execution);var S={vus:1,iterations:1,insecureSkipTLSVerify:!0},e={..._chunkA7YP6BZQjs.s.call(void 0, )},O= exports.b =async()=>{let t=_chunkD6O6GW4Cjs.d.call(void 0, {pool:_chunkD6O6GW4Cjs.b,n:_execution2.default.vu.idInTest}),o=_chunkA7YP6BZQjs.m.call(void 0, t.userLogin),s=await o.setOrGet("client",async()=>_chunkA7YP6BZQjs.u.call(void 0, t)),y=await o.setOrGet("resourcePaths",async()=>_chunkJIKIJ2QAjs.a.call(void 0, {root:e.seed.calendar.root,fromYear:e.seed.calendar.from_year,toYear:e.seed.calendar.to_year}).d),P=await o.setOrGet("root",async()=>{let a=await _chunk4OUGER52js.a.call(void 0, {client:s,userLogin:t.userLogin,platform:e.platform.type,resourceName:e.seed.container.name,resourceType:e.seed.container.type,isOwner:!1});return _k6.sleep.call(void 0, e.sleep.after_request),[a.root,a.path].filter(Boolean).join("/")});await Promise.all((0,r.times)(_execution2.default.scenario.iterationInTest%10===0?4:1,async()=>{await s.resource.getResourceProperties({root:P,resourcePath:(0,r.sample)(y)})})),_k6.sleep.call(void 0, e.sleep.after_iteration)},V= exports.c =O;exports.a = S; exports.b = O; exports.c = V;