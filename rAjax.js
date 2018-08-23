const buildFormData = (formData, payload, name) => {
  name = name || '';
  if (typeof payload === 'object'){
    Object.keys(payload).forEach( key => {
      if(name === ''){
        buildFormData(formData, payload[key], key);
      } else {
        buildFormData(formData, payload[key], name + `[${key}]`);
      }
    });
  } else {
    formData.append(name, payload);
  }
  return formData;
};

const formatCallbacks = (options, requestOptions, resolve, reject) => {
  if (options.success) {
    requestOptions.success = options.success;
  } else if (options.successDataType === 'response' || options.successDataType === undefined) {
    requestOptions.success = (response, statusText, xhr) => resolve(response);
  } else if (options.successDataType === 'xhr'){
    requestOptions.success = (response, statusText, xhr) => resolve(statusText);
  } else if (options.successDataType === 'statusText'){
    requestOptions.success = (response, statusText, xhr) => resolve(xhr);
  } else {
    console.warn("Invalid value "+`%c'${options.successDataType}' `+"%cfor key %c[successDataType]%c in options for rAjax. Defaulting to %c'response'.%c Valid values are: 'response', 'statusText', 'xhr', or null.",
    'color: red;',
    'color: inherit;',
    'color: blue;',
    'color: inherit;',
    'color: red;',
    'color: inherit');
    requestOptions.success = (response, statusText, xhr) => resolve(response);
  }

  if (options.error) {
    requestOptions.error = options.error;
  } else if (options.errDataType === 'response' || options.errorDataType === undefined) {
    requestOptions.error = (response, statusText, xhr) => reject(response);
  } else if (options.errorDataType === 'xhr'){
    requestOptions.error = (response, statusText, xhr) => reject(xhr);
  } else if (options.errorDataType === 'statusText'){
    requestOptions.error = (response, statusText, xhr) => reject(statusText);
  } else {
    console.warn("Invalid value "+`%c'${options.errorDataType}' `+"%cfor key %c[errorDataType]%c in options for rAjax. Defaulting to %c'response'.%c Valid values are: 'response', 'statusText', 'xhr', or null.",
    'color: red;',
    'color: inherit;',
    'color: blue;',
    'color: inherit;',
    'color: red;',
    'color: inherit');
    requestOptions.error = (response, statusText, xhr) => reject(response);
  }

  requestOptions.beforeSend = options.beforeSend;
  requestOptions.complete = options.complete;
};

const formatOptions = (options) => {
  const requestOptions = {};
  requestOptions.type = options.type || 'GET';
  requestOptions.url = (typeof options === "string") ? options : (options.url || '/');
  if (typeof options.data === 'string') {
    requestOptions.data = options.data;
  } else {
    // Convert JSON data to FormData
    const formData = new FormData();
    requestOptions.data = buildFormData(formData, options.data);
  }

  requestOptions.crossDomain = options.crossDomain || false;
  requestOptions.withCredentials = options.withCredentials || false;

  return requestOptions;
};

const rAjax = (options) => {
  const reqOptions = formatOptions(options);
  return new Promise((resolve, reject) => {
    formatCallbacks(options, reqOptions, resolve, reject);
    return Rails.ajax({
      type: reqOptions.type,
      url: reqOptions.url,
      data: reqOptions.data,
      beforeSend: reqOptions.beforeSend,
      success: reqOptions.success,
      error: reqOptions.error,
      complete: reqOptions.complete,
      crossDomain: reqOptions.crossDomain,
      withCredentials: reqOptions.withCredentials
    });
  });
};

export default rAjax;
