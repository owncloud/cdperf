'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('./_chunks/index.js');
var crypto = require('k6/crypto');
var exec = require('k6/execution');
require('k6');
require('k6/http');
require('k6/encoding');
require('https://jslib.k6.io/url/1.0.0/index.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var exec__default = /*#__PURE__*/_interopDefaultLegacy(exec);

/**/
var settings = {
  baseURL: __ENV.BASE_URL || 'https://localhost:9200',
  authAdapter: __ENV.AUTH_ADAPTER == index.Adapter.basicAuth ? index.Adapter.basicAuth : index.Adapter.openIDConnect,
  apiVersion: __ENV.API_VERSION == index.Version.legacy ? index.Version.legacy : index.Version.latest,
  adminUser: {
    login: __ENV.ADMIN_LOGIN || 'admin',
    password: __ENV.ADMIN_PASSWORD || 'admin'
  },
  assets: {
    size: parseInt(__ENV.ASSET_SIZE) || 1024,
    quantity: parseInt(__ENV.ASSET_QUANTITY) || 10
  },
  k6: {
    vus: 5,
    iterations: 50,
    insecureSkipTLSVerify: true
  }
};
var api = new index.API(settings.baseURL, settings.apiVersion);
/**/

var options = settings.k6;
function setup() {
  var _api$user$get = api.user.get({
    login: settings.adminUser.login,
    password: settings.adminUser.password
  }, settings.authAdapter),
      adminInfo = _api$user$get.user;

  var userInfos = index.times_1(options.vus || 1, function () {
    var _api$user$create = api.user.create({
      login: index.randomString(),
      password: index.randomString()
    }, adminInfo.credential, settings.authAdapter),
        user = _api$user$create.user;

    return index._objectSpread2(index._objectSpread2({}, user), {}, {
      home: String(api.me.driveInfo(user.login, user.credential, {
        selector: 'value.#(driveType=="personal").id'
      }))
    });
  });

  return {
    adminInfo: adminInfo,
    userInfos: userInfos
  };
}
function upload (_ref) {
  var userInfos = _ref.userInfos;
  var userInfo = userInfos[exec__default['default'].vu.idInTest - 1];

  var _api$user$get2 = api.user.get(userInfo, settings.authAdapter),
      user = _api$user$get2.user;

  var data = crypto.randomBytes(settings.assets.size * 1024);

  index.times_1(settings.assets.quantity, function (i) {
    api.dav.upload(userInfo.home, [exec__default['default'].scenario.iterationInTest, userInfo.login, i].join('-'), data, user.credential);
  });
}
function teardown(_ref2) {
  var adminInfo = _ref2.adminInfo,
      userInfos = _ref2.userInfos;

  var _api$user$get3 = api.user.get(adminInfo, settings.authAdapter),
      admin = _api$user$get3.user;

  userInfos.forEach(function (info) {
    return api.user["delete"](info.login, admin.credential);
  });
}

exports.default = upload;
exports.options = options;
exports.setup = setup;
exports.teardown = teardown;
