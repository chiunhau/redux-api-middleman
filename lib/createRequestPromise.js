"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _axios = _interopRequireDefault(require("axios"));

var _yaku = _interopRequireDefault(require("yaku/lib/yaku.core"));

var _isFunction2 = _interopRequireDefault(require("lodash/isFunction"));

var _omit = _interopRequireDefault(require("lodash/omit"));

var _humps = require("humps");

var _ = require("./");

var _utils = require("./utils");

var _log = _interopRequireDefault(require("./log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(_ref) {
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
    return new _yaku.default(function (resolve, reject) {
      function sendRequest() {
        var interceptorParams = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (params.sendingType) {
          dispatch((0, _utils.actionWith)(apiAction, {
            type: params.sendingType
          }));
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
        var config = (0, _omit.default)({
          headers: headersObject,
          method: params.method,
          url: params.url,
          params: queryObject,
          data: (0, _utils.generateBody)({
            headersObject: headersObject,
            sendObject: sendObject
          }),
          withCredentials: params.withCredentials,
          timeout: timeout
        }, omitKeys);
        (0, _axios.default)(config).then(function (res) {
          var resBody = params.camelizeResponse ? (0, _humps.camelizeKeys)(res.data) : res.data;
          dispatchSuccessType(resBody);
          processAfterSuccess(resBody);
          resolve(resBody);
        }).catch(function (error) {
          // https://github.com/axios/axios#handling-errors
          var serverError = !!error.response || !!error.request;

          if (!serverError) {
            handleOperationError(error);
          } else {
            var err = prepareErrorPayload(error);

            if (replayTimes === maxReplayTimes) {
              handleError(new Error("reached MAX_REPLAY_TIMES = ".concat(maxReplayTimes)));
            } else {
              replayTimes += 1;
              errorInterceptor({
                proceedError: function proceedError() {
                  return handleError(err);
                },
                err: err,
                getState: getState,
                replay: sendRequest
              });
            }
          }
        });
      }

      sendRequest();

      function handleOperationError(error) {
        _log.default.error(error);

        reject(error);
      }

      function prepareErrorPayload(error) {
        var res = error.response || {};
        var backwardCompatibleError = (0, _utils.addResponseKeyAsSuperAgent)(res);
        return backwardCompatibleError;
      }

      function handleError(err) {
        dispatchErrorType(err);
        processAfterError(err);
        reject(err);
      }

      function dispatchErrorType(error) {
        if (params.errorType) {
          dispatch((0, _utils.actionWith)(apiAction, {
            type: params.errorType,
            error: error
          }));
        }
      }

      function processAfterError(error) {
        if ((0, _isFunction2.default)(params.afterError)) {
          params.afterError({
            getState: getState,
            error: error
          });
        }
      }

      function dispatchSuccessType(resBody) {
        dispatch((0, _utils.actionWith)(apiAction, {
          type: params.successType,
          response: resBody
        }));
      }

      function processAfterSuccess(response) {
        if ((0, _isFunction2.default)(params.afterSuccess)) {
          params.afterSuccess({
            getState: getState,
            dispatch: dispatch,
            response: response
          });
        }
      }

      function getExtendedParams() {
        var _generateDefaultParam = generateDefaultParams({
          getState: getState
        }),
            headers = _generateDefaultParam.headers,
            body = _generateDefaultParam.body,
            query = _generateDefaultParam.query;

        headers = headers || {};
        body = body || {};
        query = query || {};
        return {
          headers: headers,
          body: body,
          query: query
        };
      }
    });
  };
}