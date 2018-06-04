'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var timeout = _ref.timeout,
      generateDefaultParams = _ref.generateDefaultParams,
      createCallApiAction = _ref.createCallApiAction,
      getState = _ref.getState,
      dispatch = _ref.dispatch,
      errorInterceptor = _ref.errorInterceptor,
      extractParams = _ref.extractParams,
      maxReplayTimes = _ref.maxReplayTimes;

  return function (prevBody) {

    var apiAction = createCallApiAction(prevBody);
    var params = extractParams(apiAction[_.CALL_API]);
    var replayTimes = 0;

    return new _yaku2.default(function (resolve, reject) {

      function sendRequest() {
        var interceptorParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


        if (params.sendingType) {
          dispatch(actionWith(apiAction, { type: params.sendingType }));
        }

        var defaultParams = getExtendedParams();

        var queryObject = Object.assign({}, defaultParams.query, params.query);
        var sendObject = Object.assign({}, defaultParams.body, params.body);
        var headersObject = Object.assign({}, defaultParams.headers, params.headers, interceptorParams.headers);

        if (params.decamelizeRequest) {
          queryObject = (0, _humps.decamelizeKeys)(queryObject);
          sendObject = (0, _humps.decamelizeKeys)(sendObject);
        }

        var omitKeys = params.method.toLowerCase() === 'get' ? ['data'] : [];

        var configs = (0, _omit2.default)({
          headers: headersObject,
          method: params.method,
          url: params.url,
          params: queryObject,
          data: generateBody({ headersObject: headersObject, sendObject: sendObject }),
          withCredentials: params.withCredentials,
          timeout: timeout
        }, omitKeys);

        (0, _axios2.default)(configs).then(function (res) {
          var resBody = params.camelizeResponse ? (0, _humps.camelizeKeys)(res.data) : res.data;
          dispatchSuccessType(resBody);
          processAfterSuccess(resBody);
          resolve(resBody);
        }).catch(function (error) {
          var err = error.response;
          console.log(error);
          function proceedError() {
            handleError(err);
          }
          if (replayTimes === maxReplayTimes) {
            handleError(new Error('reached MAX_REPLAY_TIMES = ' + maxReplayTimes));
          } else {
            replayTimes += 1;
            errorInterceptor({
              proceedError: proceedError,
              err: err,
              getState: getState,
              replay: sendRequest
            });
          }
        });
      }
      sendRequest();

      function handleError(err) {
        dispatchErrorType(err);
        processAfterError();
        reject(new Error(err));
      }

      function dispatchErrorType(err) {
        if (params.errorType) {
          dispatch(actionWith(apiAction, {
            type: params.errorType,
            error: err
          }));
        }
      }
      function processAfterError() {
        if ((0, _isFunction3.default)(params.afterError)) {
          params.afterError({ getState: getState });
        }
      }
      function dispatchSuccessType(resBody) {
        dispatch(actionWith(apiAction, {
          type: params.successType,
          response: resBody
        }));
      }
      function processAfterSuccess(response) {
        if ((0, _isFunction3.default)(params.afterSuccess)) {
          params.afterSuccess({ getState: getState, dispatch: dispatch, response: response });
        }
      }
      function getExtendedParams() {
        var _generateDefaultParam = generateDefaultParams({ getState: getState }),
            headers = _generateDefaultParam.headers,
            body = _generateDefaultParam.body,
            query = _generateDefaultParam.query;

        headers = headers || {};
        body = body || {};
        query = query || {};
        return { headers: headers, body: body, query: query };
      }

      function isUrlencodedContentType(headersObject) {
        var contentTypeKey = Object.keys(headersObject).find(function (key) {
          return key.toLowerCase() === 'content-type';
        });
        if (!contentTypeKey) {
          return false;
        }
        return headersObject[contentTypeKey] === 'application/x-www-form-urlencoded';
      }

      function generateBody(_ref2) {
        var headersObject = _ref2.headersObject,
            sendObject = _ref2.sendObject;

        var isUrlencoded = isUrlencodedContentType(headersObject);
        return isUrlencoded ? _queryString2.default.stringify(sendObject) : sendObject;
      }
    });
  };
};

var _yaku = require('yaku/lib/yaku.core');

var _yaku2 = _interopRequireDefault(_yaku);

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var _merge2 = require('lodash/merge');

var _merge3 = _interopRequireDefault(_merge2);

var _cloneDeep2 = require('lodash/cloneDeep');

var _cloneDeep3 = _interopRequireDefault(_cloneDeep2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _omit = require('lodash/omit');

var _omit2 = _interopRequireDefault(_omit);

var _humps = require('humps');

var _ = require('./');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function actionWith(action, toMerge) {
  var ac = (0, _cloneDeep3.default)(action);
  if (ac[_.CALL_API]) {
    delete ac[_.CALL_API];
  }
  return (0, _merge3.default)(ac, toMerge);
}