import qs from 'qs'
import _merge from 'lodash/merge'
import _cloneDeep from 'lodash/cloneDeep'
import { CALL_API } from './'

export const log = console

export function actionWith (action, toMerge) {
  let ac = _cloneDeep(action)
  if (ac[CALL_API]) {
    delete ac[CALL_API]
  }
  return _merge(ac, toMerge)
}

export function addResponseKeyAsSuperAgent (res) {
  return Object.assign({}, res, {
    response: {
      body: res.data
    }
  })
}

function _isUrlencodedContentType (headersObject) {
  let contentTypeKey = Object.keys(headersObject).find(
    key => key.toLowerCase() === 'content-type'
  )
  if (!contentTypeKey) {
    return false
  }
  return headersObject[contentTypeKey] === 'application/x-www-form-urlencoded'
}

export function generateBody ({ headersObject, sendObject }) {
  const isUrlencoded = _isUrlencodedContentType(headersObject)
  return isUrlencoded ? qs.stringify(sendObject) : sendObject
}

export function paramsExtractor ({ baseUrl }) {
  return (callApi) => {
    let {
      method,
      path,
      query,
      body,
      headers,
      url,
      camelizeResponse = true,
      decamelizeRequest = true,
      withCredentials = true,
      successType,
      sendingType,
      errorType,
      afterSuccess,
      afterError
    } = callApi

    url = url || `${baseUrl}${path}`

    return {
      method,
      url,
      query,
      body,
      headers,
      successType,
      sendingType,
      errorType,
      afterSuccess,
      camelizeResponse,
      decamelizeRequest,
      withCredentials,
      afterError
    }
  }
}
