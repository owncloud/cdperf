"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _chunk3A537C5Ijs = require('./__chunk/chunk-3A537C5I.js');var _chunkJNZX5NLLjs = require('./__chunk/chunk-JNZX5NLL.js');var _chunkZIJPPAJ6js = require('./__chunk/chunk-ZIJPPAJ6.js');var P={vus:1,insecureSkipTLSVerify:!0,setupTimeout:"1h"};async function G(){let e=_chunkZIJPPAJ6js.t.call(void 0, ),s=_chunkZIJPPAJ6js.v.call(void 0, {userLogin:e.admin.login,userPassword:e.admin.password});if(e.seed.groups.delete){let t=await s.group.getGroups(),i=JSON.parse(t.body).value,l=_chunkJNZX5NLLjs.a.map(o=>{let r=i.find(({displayName:g})=>o.groupName===g);return r?{groupId:r.id,groupName:r.id}:void 0}).filter(o=>!!o);await Promise.all(l.map(async({groupId:o,groupName:r})=>{await s.group.deleteGroup({groupIdOrName:o||r})}))}if(await _chunk3A537C5Ijs.c.call(void 0, {client:s,resourceName:e.seed.container.name,resourceType:e.seed.container.type,userLogin:e.admin.login,platform:e.platform.type}),e.seed.users.delete){let t=_chunkJNZX5NLLjs.c.call(void 0, {pool:_chunkJNZX5NLLjs.b,n:e.seed.users.total});await Promise.all(t.map(async i=>{await s.user.deleteUser(i)}))}}function c(){}exports.default = c; exports.options = P; exports.setup = G;
