"use strict";var r=require("./dav-d6854223.js");var t=function(t){return"function"==typeof t?t:r.identity_1},e=/^\s+|\s+$/g,n=/^[-+]0x[0-9a-f]+$/i,i=/^0b[01]+$/i,a=/^0o[0-7]+$/i,u=parseInt;var f=function(t){if("number"==typeof t)return t;if(r.isSymbol_1(t))return NaN;if(r.isObject_1(t)){var f="function"==typeof t.valueOf?t.valueOf():t;t=r.isObject_1(f)?f+"":f}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(e,"");var s=i.test(t);return s||a.test(t)?u(t.slice(2),s?2:8):n.test(t)?NaN:+t};var s=function(r){return r?(r=f(r))===1/0||r===-1/0?17976931348623157e292*(r<0?-1:1):r==r?r:0:0===r?r:0};var o=function(r){var t=s(r),e=t%1;return t==t?e?t-e:t:0},v=Math.min;var c=function(e,n){if((e=o(e))<1||e>9007199254740991)return[];var i=4294967295,a=v(e,4294967295);n=t(n),e-=4294967295;for(var u=r._baseTimes(a,n);++i<e;)n(i);return u};exports.times_1=c;
