import * as axios from 'axios';
import get from 'lodash/get';
import { notify } from 'util/notify';
import * as FormData from 'form-data';
import { Modal } from 'antd';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import * as queryString from 'query-string';
import { Subject, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import * as _ from 'lodash';


let isSessionTimeoutModalOn = false;

axios.defaults.withCredentials = true;

function trimSlash(str) {
  return str ? str.replace(/^\/+/, '').replace(/\/+$/, '') : str;
}

function trimTrailingSlash(str) {
  return str ? str.replace(/\/+$/, '') : str;
}

function getFullBaseUrl() {
  const url = trimTrailingSlash(process.env.REACT_APP_EVC_API_ENDPOINT);
  if (url.charAt(0) === '/') {
    // Relative address
    return window.location.origin + url;
  } else {
    // Absolute address
    return url;
  }
}

export const API_BASE_URL = getFullBaseUrl();
export const WEBSOCKET_URL = API_BASE_URL.replace(/^(http)(s?:\/\/[^/]+)(.*)/i, 'ws$2');
console.log('Backend API URL', API_BASE_URL, WEBSOCKET_URL);

function getHeaders(responseType) {
  const headers = {
    'Content-Type': responseType === 'json' ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
  };

  return headers;
}

function reloadPage() {
  window.location = '/';
}

function handleSessionTimeout() {
  if (!isSessionTimeoutModalOn) {
    isSessionTimeoutModalOn = true;
    Modal.warning({
      title: 'Session timeout',
      content: 'Your session is timeout.',
      maskClosable: false,
      closable: false,
      okText: 'Reload page',
      onOk: () => {
        reloadPage();
      }
    });
  }
}

export async function request(method, path, queryParams, body, responseType = 'json') {
  try {
    const response = await axios({
      method,
      // baseURL,
      url: `${API_BASE_URL}/${trimSlash(path)}`,
      headers: getHeaders(responseType),
      params: queryParams,
      data: body,
      responseType
    });

    return response.data;
  } catch (e) {
    const code = get(e, 'response.status', null);
    if (code === 401) {
      handleSessionTimeout();
      return false;
    } else if (code === 403) {
      window.location.reload(false);
      return;
    }
    const errorMessage = responseType === 'blob' ? e.message : get(e, 'response.data.message') || get(e, 'response.data') || e.message;
    notify.error('Error', errorMessage);
    console.error(e.response);
    throw e;
  }
}

export async function uploadFile(fileBlob) {
  try {
    const form = new FormData();
    form.append('file', fileBlob, fileBlob.name);
    const response = await axios.post(
      `${API_BASE_URL}/file`,
      form,
      // { headers: getHeaders(responseType) },
    );

    return response.data;
  } catch (e) {
    const code = get(e, 'response.status', null);
    if (code === 401) {
      handleSessionTimeout();
      return false;
    }
    const errorMessage = get(e, 'response.data.message') || get(e, 'response.data') || e.message;
    notify.error('Error', errorMessage);
    console.error(e.response);
    throw e;
  }
}

export function request$(method, path, queryParams, body, responseType = 'json') {
  const qs = queryString.stringify(queryParams);
  const stopOnError$ = new Subject();
  return ajax({
    method,
    url: `${API_BASE_URL}/${trimSlash(path)}${qs ? `?${qs}` : ''}`,
    headers: getHeaders(responseType),
    body,
    crossDomain: true,
    withCredentials: true,
    responseType,
  }).pipe(
    map(r => {
      return r.response
    }),
    catchError(e => {
      const code = e.status;
      if (code === 401) {
        handleSessionTimeout();
        return false;
      }
      const errorMessage = responseType === 'blob' ? e.message : e.response || _.get(e, 'response.data.message') || _.get(e, 'response.data') || e.message;
      const displayErrorMessage = errorMessage === 'ajax error' ? `Network error.`
        : errorMessage;
      notify.error('Error', displayErrorMessage);
      console.error(e.response);

      stopOnError$.next();
      // throw e;
      return of(null);
    }),
    takeUntil(stopOnError$)
  );
}

export const httpGet = async (path, queryParams = null) => request('GET', path, queryParams);
export const httpPost = async (path, body, queryParams = null) => request('POST', path, queryParams, body);
export const httpPut = async (path, body, queryParams = null) => request('PUT', path, queryParams, body);
export const httpDelete = async (path, body = null, queryParams = null) => request('DELETE', path, queryParams, body);

export const httpGet$ = (path, queryParams = null) => request$('GET', path, queryParams);
export const httpPost$ = (path, body, queryParams = null) => request$('POST', path, queryParams, body);
export const httpPut$ = (path, body, queryParams = null) => request$('PUT', path, queryParams, body);
export const httpDelete$ = (path, body = null, queryParams = null) => request$('DELETE', path, queryParams, body);