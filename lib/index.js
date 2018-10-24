"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DEFAULT_TIMEOUT = exports.DEFAULT_MAX_REPLAY_TIMES = exports.CHAIN_API = exports.CALL_API = void 0;

var _yaku = _interopRequireDefault(require("yaku/lib/yaku.core"));

var _createRequestPromise = _interopRequireDefault(require("./createRequestPromise"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CALL_API = Symbol('CALL_API');
exports.CALL_API = CALL_API;
var CHAIN_API = Symbol('CHAIN_API');
exports.CHAIN_API = CHAIN_API;
var DEFAULT_MAX_REPLAY_TIMES = 2;
exports.DEFAULT_MAX_REPLAY_TIMES = DEFAULT_MAX_REPLAY_TIMES;
var DEFAULT_TIMEOUT = 20000; // ms

exports.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

var defaultInterceptor = function defaultInterceptor(_ref) {
  var proceedError = _ref.proceedError,
      err = _ref.err,
      replay = _ref.replay,
      getState = _ref.getState;
  proceedError();
};

var noopDefaultParams = function noopDefaultParams() {
  return {};
};

var _default = function _default(_ref2) {
  var baseUrl = _ref2.baseUrl,
      _ref2$timeout = _ref2.timeout,
      timeout = _ref2$timeout === void 0 ? DEFAULT_TIMEOUT : _ref2$timeout,
      _ref2$errorIntercepto = _ref2.errorInterceptor,
      errorInterceptor = _ref2$errorIntercepto === void 0 ? defaultInterceptor : _ref2$errorIntercepto,
      _ref2$generateDefault = _ref2.generateDefaultParams,
      generateDefaultParams = _ref2$generateDefault === void 0 ? noopDefaultParams : _ref2$generateDefault,
      _ref2$maxReplayTimes = _ref2.maxReplayTimes,
      maxReplayTimes = _ref2$maxReplayTimes === void 0 ? DEFAULT_MAX_REPLAY_TIMES : _ref2$maxReplayTimes;
  var extractParams = (0, _utils.paramsExtractor)({
    baseUrl: baseUrl
  });
  return function (_ref3) {
    var dispatch = _ref3.dispatch,
        getState = _ref3.getState;
    return function (next) {
      return function (action) {
        if (action[CALL_API]) {
          return dispatch(_defineProperty({}, CHAIN_API, [function () {
            return action;
          }]));
        }

        if (!action[CHAIN_API]) {
          return next(action);
        }

        return new _yaku.default(function (resolve, reject) {
          var promiseCreators = action[CHAIN_API].map(function (createCallApiAction) {
            return (0, _createRequestPromise.default)({
              timeout: timeout,
              generateDefaultParams: generateDefaultParams,
              createCallApiAction: createCallApiAction,
              getState: getState,
              dispatch: dispatch,
              errorInterceptor: errorInterceptor,
              extractParams: extractParams,
              maxReplayTimes: maxReplayTimes
            });
          });
          var overall = promiseCreators.reduce(function (promise, createReqPromise) {
            return promise.then(createReqPromise);
          }, _yaku.default.resolve());
          overall.finally(resolve).catch(reject);
        });
      };
    };
  };
};

exports.default = _default;