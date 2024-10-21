import { ref } from 'vue';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

let baseUrl = '';

export function setDefaultHeaders(headers) {
  Object.assign(defaultHeaders, headers);
}

export function setBaseUrl(url) {
  baseUrl = url;
}

export function useFetchApi(url) {
  const theUrl = url[0] === '/' ? url : '/' + url;
  const data = ref(null);
  const error = ref(null);

  function fetchData(sendData = null) {
    fetch(baseUrl + theUrl, {
      method: sendData != null ? 'POST' : 'GET',
      headers: defaultHeaders,
      body: sendData != null ? JSON.stringify(sendData) : null,
    })
      .then(res => res.json())
      .then(json => {
        if (!json.hasOwnProperty('data') || !json.hasOwnProperty('status')) {
          error.value = 'Invalid response';
          return;
        }
        if (json.status != 'success') {
          error.value = json.data;
          return;
        }
        data.value = json.data;
      })
      .catch(err => error.value = err);
  }

  return { data, error, fetchData }
}