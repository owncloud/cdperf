"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _chunkK5FLUF2Vjs = require('./chunk-K5FLUF2V.js');var _chunkVGN6T2MUjs = require('./chunk-VGN6T2MU.js');var T=_chunkVGN6T2MUjs.a.call(void 0, _chunkVGN6T2MUjs.d.call(void 0, ));var a={...(0,T.omit)(_chunkK5FLUF2Vjs.a,"iterations","duration"),scenarios:{add_remove_tag_100:{executor:"ramping-vus",startVUs:0,exec:"add_remove_tag_100",env:{SLEEP_AFTER_ITERATION:_chunkVGN6T2MUjs.e.call(void 0, "TEST_KOKO_PLATFORM_100_RAMPING_SLEEP_AFTER_ITERATION","60s")},stages:[{target:parseInt(_chunkVGN6T2MUjs.e.call(void 0, "TEST_KOKO_PLATFORM_100_RAMPING_STAGES_VUS","250"),10),duration:_chunkVGN6T2MUjs.e.call(void 0, "TEST_KOKO_PLATFORM_100_RAMPING_STAGES_UP_DURATION","20m")},{target:parseInt(_chunkVGN6T2MUjs.e.call(void 0, "TEST_KOKO_PLATFORM_100_RAMPING_STAGES_VUS","250"),10),duration:_chunkVGN6T2MUjs.e.call(void 0, "TEST_KOKO_PLATFORM_100_RAMPING_STAGES_PEAK_DURATION","30m")},{target:0,duration:_chunkVGN6T2MUjs.e.call(void 0, "TEST_KOKO_PLATFORM_100_RAMPING_STAGES_DOWN_DURATION","10m")}]}}};exports.a = a;