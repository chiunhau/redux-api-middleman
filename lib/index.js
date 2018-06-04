'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_TIMEOUT = exports.DEFAULT_MAX_REPLAY_TIMES = exports.CHAIN_API = exports.CALL_API = undefined;
exports.paramsExtractor = paramsExtractor;

var _yaku = require('yaku/lib/yaku.core');

var _yaku2 = _interopRequireDefault(_yaku);

var _createRequestPromise = require('./createRequestPromise');

var _createRequestPromise2 = _interopRequireDefault(_createRequestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CALL_API = exports.CALL_API = Symbol('CALL_API');
var CHAIN_API = exports.CHAIN_API = Symbol('CHAIN_API');
var DEFAULT_MAX_REPLAY_TIMES = exports.DEFAULT_MAX_REPLAY_TIMES = 2;
var DEFAULT_TIMEOUT = exports.DEFAULT_TIMEOUT = 20000; //ms


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

exports.default = function (_ref2) {
  var baseUrl = _ref2.baseUrl,
      _ref2$timeout = _ref2.timeout,
      timeout = _ref2$timeout === undefined ? DEFAULT_TIMEOUT : _ref2$timeout,
      _ref2$errorIntercepto = _ref2.errorInterceptor,
      errorInterceptor = _ref2$errorIntercepto === undefined ? defaultInterceptor : _ref2$errorIntercepto,
      _ref2$generateDefault = _ref2.generateDefaultParams,
      generateDefaultParams = _ref2$generateDefault === undefined ? noopDefaultParams : _ref2$generateDefault,
      _ref2$maxReplayTimes = _ref2.maxReplayTimes,
      maxReplayTimes = _ref2$maxReplayTimes === undefined ? DEFAULT_MAX_REPLAY_TIMES : _ref2$maxReplayTimes;


  var extractParams = paramsExtractor({ baseUrl: baseUrl });

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

        return new _yaku2.default(function (resolve, reject) {

          var promiseCreators = action[CHAIN_API].map(function (createCallApiAction) {
            return (0, _createRequestPromise2.default)({
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
            return promise.then(function (body) {
              return createReqPromise(body);
            });
          }, _yaku2.default.resolve());

          overall.finally(function () {
            resolve();
          }).catch(function (e) {
            reject(e);
          });
        });
      };
    };
  };
};

function paramsExtractor(_ref4) {
  var baseUrl = _ref4.baseUrl;

  return function (callApi) {
    var method = callApi.method,
        path = callApi.path,
        query = callApi.query,
        body = callApi.body,
        headers = callApi.headers,
        url = callApi.url,
        _callApi$camelizeResp = callApi.camelizeResponse,
        camelizeResponse = _callApi$camelizeResp === undefined ? true : _callApi$camelizeResp,
        _callApi$decamelizeRe = callApi.decamelizeRequest,
        decamelizeRequest = _callApi$decamelizeRe === undefined ? true : _callApi$decamelizeRe,
        _callApi$withCredenti = callApi.withCredentials,
        withCredentials = _callApi$withCredenti === undefined ? true : _callApi$withCredenti,
        successType = callApi.successType,
        sendingType = callApi.sendingType,
        errorType = callApi.errorType,
        afterSuccess = callApi.afterSuccess,
        afterError = callApi.afterError;


    url = url || '' + baseUrl + path;

    return {
      method: method,
      url: url,
      query: query,
      body: body,
      headers: headers,
      successType: successType,
      sendingType: sendingType,
      errorType: errorType,
      afterSuccess: afterSuccess,
      camelizeResponse: camelizeResponse,
      decamelizeRequest: decamelizeRequest,
      withCredentials: withCredentials,
      afterError: afterError
    };
  };
}