"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _chunkKYC6K2NUjs = require('./chunk-KYC6K2NU.js');var _chunkZIJPPAJ6js = require('./chunk-ZIJPPAJ6.js');var T=_chunkZIJPPAJ6js.a.call(void 0, _chunkZIJPPAJ6js.d.call(void 0, ));var A={...(0,T.omit)(_chunkKYC6K2NUjs.a,"iterations","duration"),scenarios:{navigate_file_tree_020:{executor:"ramping-vus",startVUs:0,exec:"navigate_file_tree_020",env:{SLEEP_AFTER_ITERATION:_chunkZIJPPAJ6js.e.call(void 0, "TEST_KOKO_PLATFORM_020_RAMPING_SLEEP_AFTER_ITERATION","2s")},stages:[{target:parseInt(_chunkZIJPPAJ6js.e.call(void 0, "TEST_KOKO_PLATFORM_020_RAMPING_STAGES_VUS","1000"),10),duration:_chunkZIJPPAJ6js.e.call(void 0, "TEST_KOKO_PLATFORM_020_RAMPING_STAGES_UP_DURATION","20m")},{target:parseInt(_chunkZIJPPAJ6js.e.call(void 0, "TEST_KOKO_PLATFORM_020_RAMPING_STAGES_VUS","1000"),10),duration:_chunkZIJPPAJ6js.e.call(void 0, "TEST_KOKO_PLATFORM_020_RAMPING_STAGES_PEAK_DURATION","30m")},{target:0,duration:_chunkZIJPPAJ6js.e.call(void 0, "TEST_KOKO_PLATFORM_020_RAMPING_STAGES_DOWN_DURATION","10m")}]}}};exports.a = A;
