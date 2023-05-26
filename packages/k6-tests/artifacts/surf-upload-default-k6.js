"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _chunkBMGLFW53js = require('./__chunk/chunk-BMGLFW53.js');var m=_chunkBMGLFW53js.a.call(void 0, _chunkBMGLFW53js.d.call(void 0, ));var _crypto = require('k6/crypto');var _execution = require('k6/execution'); var _execution2 = _interopRequireDefault(_execution);var s={..._chunkBMGLFW53js.s.call(void 0, ),assets:{size:parseInt(_chunkBMGLFW53js.e.call(void 0, "ASSET_SIZE","1000"),10),quantity:parseInt(_chunkBMGLFW53js.e.call(void 0, "ASSET_QUANTITY","10"),10)}},S= exports.options ={vus:1,insecureSkipTLSVerify:!0};function D(){let r=_chunkBMGLFW53js.u.call(void 0, {userLogin:s.admin.login,userPassword:s.admin.password});return{actorData:(0,m.times)(S.vus||1,()=>{let[o,e]=[_chunkBMGLFW53js.f.call(void 0, ),_chunkBMGLFW53js.f.call(void 0, )],p=r.user.createUser({userLogin:o,userPassword:e}),[a]=_chunkBMGLFW53js.k.call(void 0, "$.id",p.body);r.user.enableUser({userLogin:o});let i=_chunkBMGLFW53js.u.call(void 0, {userLogin:o,userPassword:e}).me.getMyDrives(),[y=o]=_chunkBMGLFW53js.k.call(void 0, "$.value[?(@.driveType === 'personal')].id",_optionalChain([i, 'optionalAccess', _ => _.body]));return{actorLogin:o,actorPassword:e,actorId:a,actorRoot:y}})}}async function E({actorData:r}){let{actorLogin:t,actorPassword:o,actorRoot:e}=r[_execution2.default.vu.idInTest-1],a=await _chunkBMGLFW53js.m.call(void 0, t).setOrGet("client",async()=>_chunkBMGLFW53js.u.call(void 0, {userLogin:t,userPassword:o})),g=_crypto.randomBytes.call(void 0, s.assets.size*1e3);(0,m.times)(s.assets.quantity,i=>{a.resource.uploadResource({root:e,resourcePath:[_execution2.default.scenario.iterationInTest,t,i].join("-"),resourceBytes:g})})}function U({actorData:r}){let t=_chunkBMGLFW53js.u.call(void 0, {userLogin:s.admin.login,userPassword:s.admin.password});r.forEach(({actorLogin:o})=>{t.user.deleteUser({userLogin:o})})}exports.default = E; exports.options = S; exports.setup = D; exports.teardown = U;
