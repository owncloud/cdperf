"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _chunkD6O6GW4Cjs = require('./chunk-D6O6GW4C.js');var _chunkA7YP6BZQjs = require('./chunk-A7YP6BZQ.js');var _k6 = require('k6');var _execution = require('k6/execution'); var _execution2 = _interopRequireDefault(_execution);var S={vus:1,iterations:1,insecureSkipTLSVerify:!0},o={..._chunkA7YP6BZQjs.s.call(void 0, )},d= exports.b =async()=>{let e=_chunkD6O6GW4Cjs.d.call(void 0, {pool:_chunkD6O6GW4Cjs.b,n:_execution2.default.vu.idInTest}),t=await _chunkA7YP6BZQjs.m.call(void 0, e.userLogin).setOrGet("client",async()=>_chunkA7YP6BZQjs.u.call(void 0, e)),v=await t.drive.createDrive({driveName:[e.userLogin.replace(/[^A-Za-z0-9]/g,""),"iteration",_execution2.default.vu.iterationInInstance+1].join("-")}),[i]=_chunkA7YP6BZQjs.k.call(void 0, "$.id",_optionalChain([v, 'optionalAccess', _ => _.body]));_k6.sleep.call(void 0, o.sleep.after_request),await t.drive.deactivateDrive({driveId:i}),_k6.sleep.call(void 0, o.sleep.after_request),await t.drive.deleteDrive({driveId:i}),_k6.sleep.call(void 0, o.sleep.after_iteration)},q= exports.c =d;exports.a = S; exports.b = d; exports.c = q;