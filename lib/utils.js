"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.actionWith = actionWith;
exports.addResponseKeyAsSuperAgent = addResponseKeyAsSuperAgent;
exports.generateBody = generateBody;
exports.paramsExtractor = paramsExtractor;
exports.log = void 0;

var _qs = _interopRequireDefault(require("qs"));

var _merge2 = _interopRequireDefault(require("lodash/merge"));

var _cloneDeep2 = _interopRequireDefault(require("lodash/cloneDeep"));

var _ = require("./");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = console;
exports.log = log;

function actionWith(action, toMerge) {
  var ac = (0, _cloneDeep2.default)(action);

  if (ac[_.CALL_API]) {
    delete ac[_.CALL_API];
  }

  return (0, _merge2.default)(ac, toMerge);
}

function addResponseKeyAsSuperAgent(res) {
  return Object.assign({}, res, {
    response: {
      body: res.data
    }
  });
}

function _isUrlencodedContentType(headersObject) {
  var contentTypeKey = Object.keys(headersObject).find(function (key) {
    return key.toLowerCase() === 'content-type';
  });

  if (!contentTypeKey) {
    return false;
  }

  return headersObject[contentTypeKey] === 'application/x-www-form-urlencoded';
}

function generateBody(_ref) {
  var headersObject = _ref.headersObject,
      sendObject = _ref.sendObject;

  var isUrlencoded = _isUrlencodedContentType(headersObject);

  return isUrlencoded ? _qs.default.stringify(sendObject) : sendObject;
}

function paramsExtractor(_ref2) {
  var baseUrl = _ref2.baseUrl;
  return function (callApi) {
    var method = callApi.method,
        path = callApi.path,
        query = callApi.query,
        body = callApi.body,
        headers = callApi.headers,
        url = callApi.url,
        _callApi$camelizeResp = callApi.camelizeResponse,
        camelizeResponse = _callApi$camelizeResp === void 0 ? true : _callApi$camelizeResp,
        _callApi$decamelizeRe = callApi.decamelizeRequest,
        decamelizeRequest = _callApi$decamelizeRe === void 0 ? true : _callApi$decamelizeRe,
        _callApi$withCredenti = callApi.withCredentials,
        withCredentials = _callApi$withCredenti === void 0 ? true : _callApi$withCredenti,
        successType = callApi.successType,
        sendingType = callApi.sendingType,
        errorType = callApi.errorType,
        afterSuccess = callApi.afterSuccess,
        afterError = callApi.afterError;
    url = url || "".concat(baseUrl).concat(path);
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