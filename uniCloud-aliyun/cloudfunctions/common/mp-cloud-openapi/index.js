module.exports = function(e) {
	// 公用模块用法请参考 https://uniapp.dcloud.io/uniCloud/cf-common
	return e
}
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var crypto = _interopDefault(require('crypto'));
var querystring = _interopDefault(require('querystring'));

// 搭配uniCloud.httpclient.request使用
// content: formData.getBuffer()
// header: formData.getHeaders(userHeaders)
class FormData {
  constructor () {
    this._boundary =
      '------FormDataBaseBoundary' + Math.random().toString(36).substring(2);
    this.dataList = [];
  }

  _addData (data) {
    // 优化 减少Buffer.concat执行次数
    const lastData = this.dataList[this.dataList.length - 1];
    if (typeof data === 'string' && typeof lastData === 'string') {
      this.dataList[this.dataList.length - 1] = lastData + '\r\n' + data;
    } else {
      this.dataList.push(data);
    }
  }

  append (name, value, options) {
    this._addData('--' + this._boundary);
    let leading = `Content-Disposition: form-data; name="${name}"`;
    switch (Buffer.isBuffer(value)) {
      case true:
        if (!options.filename || !options.contentType) {
          throw new Error('filename and contentType required')
        }
        leading += `; filename="${options.filename}"`;
        this._addData(leading);
        this._addData(`Content-Type: ${options.contentType}`);
        this._addData('');
        this._addData(value);
        break
      default:
        this._addData('');
        this._addData(value);
    }
  }

  getHeaders (options) {
    const headers = {
      'Content-Type': 'multipart/form-data; boundary=' + this._boundary
    };
    return Object.assign(headers, options)
  }

  getBuffer () {
    let dataBuffer = Buffer.alloc(0);
    this.dataList.forEach((item) => {
      if (Buffer.isBuffer(item)) {
        dataBuffer = Buffer.concat([dataBuffer, item]);
      } else {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from('' + item)]);
      }
      dataBuffer = Buffer.concat([dataBuffer, Buffer.from('\r\n')]);
    });
    dataBuffer = Buffer.concat([dataBuffer, Buffer.from('--' + this._boundary + '--')]);
    return dataBuffer
  }
}

class UniCloudError extends Error {
  constructor (options) {
    super(options.message);
    this.errMsg = options.message || '';
    Object.defineProperties(this, {
      message: {
        get () {
          return `errCode: ${options.code || ''} | errMsg: ` + this.errMsg
        },
        set (msg) {
          this.errMsg = msg;
        }
      }
    });
  }
}

const _toString = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

function isFn (fn) {
  return typeof fn === 'function'
}

// 获取文件后缀，只添加几种图片类型供客服消息接口使用
const mime2ext = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/webp': 'webp'
};

function getExtension (contentType) {
  return mime2ext[contentType]
}

const isSnakeCase = /_(\w)/g;
const isCamelCase = /[A-Z]/g;

function snake2camel (value) {
  return value.replace(isSnakeCase, (_, c) => (c ? c.toUpperCase() : ''))
}

function camel2snake (value) {
  return value.replace(isCamelCase, str => '_' + str.toLowerCase())
}

function parseObjectKeys (obj, type) {
  let parserReg, parser;
  switch (type) {
    case 'snake2camel':
      parser = snake2camel;
      parserReg = isSnakeCase;
      break
    case 'camel2snake':
      parser = camel2snake;
      parserReg = isCamelCase;
      break
  }
  for (const key in obj) {
    if (hasOwn(obj, key)) {
      if (parserReg.test(key)) {
        const keyCopy = parser(key);
        obj[keyCopy] = obj[key];
        delete obj[key];
        if (isPlainObject(obj[keyCopy])) {
          obj[keyCopy] = parseObjectKeys(obj[keyCopy], type);
        } else if (Array.isArray(obj[keyCopy])) {
          obj[keyCopy] = obj[keyCopy].map((item) => {
            return parseObjectKeys(item, type)
          });
        }
      }
    }
  }
  return obj
}

function snake2camelJson (obj) {
  return parseObjectKeys(obj, 'snake2camel')
}

function camel2snakeJson (obj) {
  return parseObjectKeys(obj, 'camel2snake')
}

function getOffsetDate (offset) {
  return new Date(
    Date.now() + (new Date().getTimezoneOffset() + (offset || 0) * 60) * 60000
  )
}

function getDateStr (date, separator = '-') {
  date = date || new Date();
  const dateArr = [];
  dateArr.push(date.getFullYear());
  dateArr.push(('00' + (date.getMonth() + 1)).substr(-2));
  dateArr.push(('00' + date.getDate()).substr(-2));
  return dateArr.join(separator)
}

function getTimeStr (date, separator = ':') {
  date = date || new Date();
  const timeArr = [];
  timeArr.push(('00' + date.getHours()).substr(-2));
  timeArr.push(('00' + date.getMinutes()).substr(-2));
  timeArr.push(('00' + date.getSeconds()).substr(-2));
  return timeArr.join(separator)
}

function getFullTimeStr (date) {
  date = date || new Date();
  return getDateStr(date) + ' ' + getTimeStr(date)
}

// 注意：不进行递归处理
function parseParams (params = {}, rule) {
  if (!rule || !params) {
    return params
  }
  const internalKeys = ['_pre', '_purify', '_post'];
  // 转换之前的处理
  if (rule._pre) {
    params = rule._pre(params);
  }
  // 净化参数
  let purify = { shouldDelete: new Set([]) };
  if (rule._purify) {
    const _purify = rule._purify;
    for (const purifyKey in _purify) {
      _purify[purifyKey] = new Set(_purify[purifyKey]);
    }
    purify = Object.assign(purify, _purify);
  }
  if (isPlainObject(rule)) {
    for (const key in rule) {
      const parser = rule[key];
      if (isFn(parser) && internalKeys.indexOf(key) === -1) {
        // 通过function转化的默认不删除旧属性名
        params[key] = parser(params);
      } else if (typeof parser === 'string' && internalKeys.indexOf(key) === -1) {
        // 直接转换属性名称的删除旧属性名
        params[key] = params[parser];
        purify.shouldDelete.add(parser);
      }
    }
  } else if (isFn(rule)) {
    params = rule(params);
  }

  if (purify.shouldDelete) {
    for (const item of purify.shouldDelete) {
      delete params[item];
    }
  }

  // 转换之后的处理
  if (rule._post) {
    params = rule._post(params);
  }

  return params
}

function createApi (ApiClass, options) {
  const apiInstance = new ApiClass(options);
  return new Proxy(apiInstance, {
    get: function (obj, prop) {
      if (typeof obj[prop] === 'function' && prop.indexOf('_') !== 0 && obj._protocols && obj._protocols[prop]) {
        const protocol = obj._protocols[prop];
        return async function (params) {
          params = parseParams(params, protocol.args);
          let result = await obj[prop](params);
          result = parseParams(result, protocol.returnValue);
          return result
        }
      } else {
        return obj[prop]
      }
    }
  })
}

function generateApiResult (apiName, data) {
  if (data.errcode) {
    return {
      errCode: data.errcode || -2,
      errMsg: data.errmsg || `${apiName} fail`
    }
  } else {
    delete data.errcode;
    delete data.errmsg;
    return {
      ...data,
      errMsg: `${apiName} ok`,
      errCode: 0
    }
  }
}

function nomalizeError (apiName, error) {
  throw new UniCloudError({
    code: error.code || -2,
    message: error.message || `${apiName} fail`
  })
}

// 微信openapi接口接收蛇形（snake case）参数返回蛇形参数，这里进行转化，如果是formdata里面的参数需要在对应api实现时就转为蛇形
async function callWxOpenApi ({
  name,
  url,
  data,
  options,
  defaultOptions
}) {
  let result = {};
  // 获取二维码的接口wxacode.get和wxacode.getUnlimited不可以传入access_token（可能有其他接口也不可以），否则会返回data format error
  const dataCopy = camel2snakeJson(Object.assign({}, data));
  if (dataCopy && dataCopy.access_token) {
    delete dataCopy.access_token;
  }
  try {
    options = Object.assign({}, defaultOptions, options, { data: dataCopy });
    result = await uniCloud.httpclient.request(url, options);
  } catch (e) {
    return nomalizeError(name, e)
  }

  // 有几个接口成功返回buffer失败返回json，对这些接口统一成返回buffer，然后分别解析
  let resData = result.data;
  const contentType = result.headers['content-type'];
  if (
    Buffer.isBuffer(resData) &&
    (contentType.indexOf('text/plain') === 0 ||
      contentType.indexOf('application/json') === 0)
  ) {
    try {
      resData = JSON.parse(resData.toString());
    } catch (e) {
      resData = resData.toString();
    }
  } else if (Buffer.isBuffer(resData)) {
    resData = {
      buffer: resData,
      contentType
    };
  }
  return snake2camelJson(
    generateApiResult(
      name,
      resData || {
        errCode: -2,
        errMsg: 'Request failed'
      }
    )
  )
}

function buildUrl (url, data) {
  let query = '';
  if (data && data.accessToken) {
    const divider = url.indexOf('?') > -1 ? '&' : '?';
    query = `${divider}access_token=${data.accessToken}`;
  }
  return `${url}${query}`
}

class Auth {
  constructor (options) {
    this.options = Object.assign({}, options);
  }

  async _requestWxOpenapi ({ name, url, data, options }) {
    const defaultOptions = {
      method: 'GET',
      dataType: 'json',
      dataAsQueryString: true,
      timeout: this.options.timeout
    };
    const result = await callWxOpenApi({
      name: `auth.${name}`,
      url: `${this.options.baseurl}${buildUrl(url, data)}`,
      data,
      options,
      defaultOptions
    });
    return result
  }

  async code2Session (code) {
    const url = '/sns/jscode2session';
    const result = await this._requestWxOpenapi({
      name: 'code2Session',
      url,
      data: {
        grant_type: 'authorization_code',
        appid: this.options.appId,
        secret: this.options.secret,
        js_code: code
      }
    });
    return result
  }

  async getPaidUnionId (data) {
    const url = '/wxa/getpaidunionid';
    const result = await this._requestWxOpenapi({
      name: 'getPaidUnionId',
      url,
      data
    });
    return result
  }

  async getAccessToken () {
    const url = '/cgi-bin/token';
    const result = await this._requestWxOpenapi({
      name: 'getAccessToken',
      url,
      data: {
        grant_type: 'client_credential',
        appid: this.options.appId,
        secret: this.options.secret
      }
    });
    return result
  }
}

class Analysis {
  constructor (options) {
    this.options = Object.assign({}, options);
  }

  async _requestWxOpenapi ({ name, url, data, options }) {
    data.accessToken = data.accessToken || this.options.accessToken;
    const defaultOptions = {
      method: 'POST',
      dataType: 'json',
      contentType: 'json',
      timeout: this.options.timeout
    };
    const result = await callWxOpenApi({
      name: `analysis.${name}`,
      url: `${this.options.baseurl}${url}?access_token=${data.accessToken}`,
      data,
      options,
      defaultOptions
    });
    return result
  }

  async getDailyRetain (data) {
    // 目前此接口仅支持查询一天的数据，如果填写了end_date，则必须要求end_date = start_date
    const url = '/datacube/getweanalysisappiddailyretaininfo';
    const result = await this._requestWxOpenapi({
      name: 'getDailyRetain',
      url,
      data
    });
    return result
  }

  async getMonthlyRetain (data) {
    // 目前此接口仅支持查询一个月的数据，start_date必须是月初，end_date必须是月末
    const url = '/datacube/getweanalysisappidmonthlyretaininfo';
    const result = await this._requestWxOpenapi({
      name: 'getMonthlyRetain',
      url,
      data
    });
    return result
  }

  async getWeeklyRetain (data) {
    // 目前此接口仅支持查询一周的数据，start_date必须是周一，end_date必须是周日
    const url = '/datacube/getweanalysisappidweeklyretaininfo';
    const result = await this._requestWxOpenapi({
      name: 'getWeeklyRetain',
      url,
      data
    });
    return result
  }

  async getDailySummary (data) {
    // 目前此接口仅支持查询一天的数据，如果填写了end_date，则必须要求end_date = start_date
    const url = '/datacube/getweanalysisappiddailyretaininfo';
    const result = await this._requestWxOpenapi({
      name: 'getDailySummary',
      url,
      data
    });
    return result
  }

  async getDailyVisitTrend (data) {
    // 目前此接口仅支持查询一天的数据，如果填写了end_date，则必须要求end_date = start_date
    const url = '/datacube/getweanalysisappiddailyvisittrend';
    const result = await this._requestWxOpenapi({
      name: 'getDailyVisitTrend',
      url,
      data
    });
    return result
  }

  async getMonthlyVisitTrend (data) {
    // 目前此接口仅支持查询一个月的数据，start_date必须是月初，end_date必须是月末
    const url = '/datacube/getweanalysisappidmonthlyvisittrend';
    const result = await this._requestWxOpenapi({
      name: 'getMonthlyVisitTrend',
      url,
      data
    });
    return result
  }

  async getWeeklyVisitTrend (data) {
    // 目前此接口仅支持查询一周的数据，start_date必须是周一，end_date必须是周日
    const url = '/datacube/getweanalysisappidweeklyvisittrend';
    const result = await this._requestWxOpenapi({
      name: 'getWeeklyVisitTrend',
      url,
      data
    });
    return result
  }

  async getUserPortrait (data) {
    // 目前此接口仅支持查询最近的数据，即end_date = 昨天，且必须end_date - start_date = 0|6|29
    const url = '/datacube/getweanalysisappiduserportrait';
    const result = await this._requestWxOpenapi({
      name: 'getUserPortrait',
      url,
      data
    });
    return result
  }

  async getVisitDistribution (data) {
    // 目前此接口仅支持查询一天的数据，如果填写了end_date，则必须要求end_date = start_date
    const url = '/datacube/getweanalysisappidvisitdistribution';
    const result = await this._requestWxOpenapi({
      name: 'getVisitDistribution',
      url,
      data
    });
    return result
  }

  async getVisitPage (data) {
    // 目前此接口仅支持查询一天的数据，如果填写了end_date，则必须要求end_date = start_date
    const url = '/datacube/getweanalysisappidvisitpage';
    const result = await this._requestWxOpenapi({
      name: 'getVisitPage',
      url,
      data
    });
    return result
  }
}

class CustomerServiceMessage {
  constructor (options) {
    this.options = Object.assign({}, options);
  }

  async _requestWxOpenapi ({ name, url, data, options }) {
    data.accessToken = data.accessToken || this.options.accessToken;
    const defaultOptions = {
      method: 'POST',
      dataType: 'json',
      contentType: 'json',
      timeout: this.options.timeout
    };
    const result = await callWxOpenApi({
      name: `customerServiceMessage.${name}`,
      url: `${this.options.baseurl}${buildUrl(url, data)}`,
      data,
      options,
      defaultOptions
    });
    return result
  }

  // 接收参数
  // {
  //   access_token: 'xxx',
  //   type: 'image',
  //   media: {
  //     contentType: 'image/png',
  //     value: Buffer
  //   }
  // }
  async uploadTempMedia (data) {
    const url = `/cgi-bin/media/upload?type=${data.type || 'image'}`;
    const form = new FormData();
    const media = data.media;
    form.append('media', media.value, {
      filename: `${Date.now()}.` + getExtension(media.contentType) || 'png',
      contentType: media.contentType
    });
    const result = await this._requestWxOpenapi({
      name: 'uploadTempMedia',
      url,
      data: {
        accessToken: data.accessToken
      },
      options: {
        content: form.getBuffer(),
        headers: form.getHeaders()
      }
    });
    return result
  }

  async getTempMedia (data) {
    const url = `/cgi-bin/media/get?media_id=${data.mediaId}`;
    const result = await this._requestWxOpenapi({
      name: 'getTempMedia',
      url,
      data: {
        accessToken: data.accessToken
      },
      options: {
        method: 'GET',
        dataType: ''
      }
    });
    return result
  }

  async send (data) {
    const url = '/cgi-bin/message/custom/send';
    const result = await this._requestWxOpenapi({
      name: 'send',
      url,
      data
    });
    return result
  }
}

class Wxacode {
  constructor (options) {
    this.options = Object.assign({}, options);
  }

  async _requestWxOpenapi ({ name, url, data, options }) {
    data.accessToken = data.accessToken || this.options.accessToken;
    const defaultOptions = {
      method: 'POST',
      dataType: 'buffer',
      contentType: 'json',
      timeout: this.options.timeout
    };
    const result = await callWxOpenApi({
      name: `wxacode.${name}`,
      url: `${this.options.baseurl}${buildUrl(url, data)}`,
      data,
      options,
      defaultOptions
    });
    return result
  }

  async createQRCode (data) {
    const url = '/cgi-bin/wxaapp/createwxaqrcode';
    const result = await this._requestWxOpenapi({
      name: 'createQRCode',
      url,
      data
    });
    return result
  }

  async get (data) {
    const url = '/wxa/getwxacode';
    const result = await this._requestWxOpenapi({
      name: 'get',
      url,
      data
    });
    return result
  }

  async getUnlimited (data) {
    const url = '/wxa/getwxacodeunlimit';
    const result = await this._requestWxOpenapi({
      name: 'getUnlimited',
      url,
      data
    });
    return result
  }
}

function parseImageData (data, url) {
  let options = {};
  const { img, imgUrl, accessToken } = data;
  if (img) {
    const form = new FormData();
    form.append('img', img.value, {
      filename: `${Date.now()}.` + getExtension(img.contentType) || 'png',
      contentType: img.contentType
    });
    options = {
      content: form.getBuffer(),
      headers: form.getHeaders()
    };
  }
  if (imgUrl) {
    const divider = url.indexOf('?') > -1 ? '&' : '?';
    url += `${divider}img_url=${encodeURIComponent(imgUrl)}`;
  }
  return {
    url,
    data: {
      accessToken
    },
    options
  }
}

class Img {
  constructor (options) {
    this.options = Object.assign({}, options);
  }

  async _requestWxOpenapi ({ name, url, data, options }) {
    data.accessToken = data.accessToken || this.options.accessToken;
    const defaultOptions = {
      method: 'POST',
      dataType: 'json',
      contentType: 'json',
      timeout: this.options.timeout
    };
    const result = await callWxOpenApi({
      name: `img.${name}`,
      url: `${this.options.baseurl}${buildUrl(url, data)}`,
      data,
      options,
      defaultOptions
    });
    return result
  }

  // {
  //   access_token: 'xxx',
  //   img_url: 'image',
  //   img: {
  //     contentType: 'image/png',
  //     value: Buffer
  //   }
  // }
  async aiCrop (data) {
    const url = '/cv/img/aicrop';
    const result = await this._requestWxOpenapi({
      name: 'aiCrop',
      ...parseImageData(data, url)
    });
    return result
  }

  async scanQRCode (data) {
    const url = '/cv/img/qrcode';
    const result = await this._requestWxOpenapi({
      name: 'scanQRCode',
      ...parseImageData(data, url)
    });
    return result
  }

  async superresolution (data) {
    const url = '/cv/img/superresolution';
    const result = await this._requestWxOpenapi({
      name: 'superresolution',
      ...parseImageData(data, url)
    });
    return result
  }
}

class SubscribeMessage {
  constructor (options) {
    this.options = Object.assign({}, options);
  }

  async _requestWxOpenapi ({ name, url, data, options }) {
    data.accessToken = data.accessToken || this.options.accessToken;
    const defaultOptions = {
      method: 'POST',
      dataType: 'json',
      contentType: 'json',
      timeout: this.options.timeout
    };
    const result = await callWxOpenApi({
      name: `subscribeMessage.${name}`,
      url: `${this.options.baseurl}${buildUrl(url, data)}`,
      data,
      options,
      defaultOptions
    });
    return result
  }

  async addTemplate (data) {
    const url = '/wxaapi/newtmpl/addtemplate';
    const result = await this._requestWxOpenapi({
      name: 'addTemplate',
      url,
      data
    });
    return result
  }

  async deleteTemplate (data) {
    const url = '/wxaapi/newtmpl/deltemplate';
    const result = await this._requestWxOpenapi({
      name: 'deleteTemplate',
      url,
      data
    });
    return result
  }

  async getCategory (data) {
    const url = '/wxaapi/newtmpl/getcategory';
    const result = await this._requestWxOpenapi({
      name: 'getCategory',
      url,
      data
    });
    return result
  }

  async getPubTemplateKeyWordsById (data) {
    const url = '/wxaapi/newtmpl/getpubtemplatekeywords';
    const result = await this._requestWxOpenapi({
      name: 'getPubTemplateKeyWordsById',
      url,
      data
    });
    return result
  }

  async getPubTemplateTitleList (data) {
    const url = '/wxaapi/newtmpl/getpubtemplatetitles';
    const result = await this._requestWxOpenapi({
      name: 'getPubTemplateTitleList',
      url,
      data
    });
    return result
  }

  async getTemplateList (data) {
    const url = '/wxaapi/newtmpl/gettemplate';
    const result = await this._requestWxOpenapi({
      name: 'getTemplateList',
      url,
      data
    });
    return result
  }

  async send (data) {
    const url = '/cgi-bin/message/subscribe/send';
    const result = await this._requestWxOpenapi({
      name: 'send',
      url,
      data
    });
    return result
  }
}

// 退款通知解密key=md5(key)
function decryptData (encryptedData, key, iv = '') {
  // 解密
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  // 设置自动 padding 为 true，删除填充补位
  decipher.setAutoPadding(true);
  let decoded = decipher.update(encryptedData, 'base64', 'utf8');
  decoded += decipher.final('utf8');
  return decoded
}

function md5 (str, encoding = 'utf8') {
  return crypto
    .createHash('md5')
    .update(str, encoding)
    .digest('hex')
}

function sha256 (str, key, encoding = 'utf8') {
  return crypto
    .createHmac('sha256', key)
    .update(str, encoding)
    .digest('hex')
}

function getSignStr (obj) {
  return Object.keys(obj)
    .filter(key => key !== 'sign' && obj[key] !== undefined && obj[key] !== '')
    .sort()
    .map(key => key + '=' + obj[key])
    .join('&')
}

function getNonceStr (length = 16) {
  return Math.random().toString(32).substring(2)
}

// 简易版Object转XML，只可在微信支付时使用，不支持嵌套
function buildXML (obj, rootName = 'xml') {
  const content = Object.keys(obj).map(item => {
    if (isPlainObject(obj[item])) {
      return `<${item}><![CDATA[${JSON.stringify(obj[item])}]]></${item}>`
    } else {
      return `<${item}><![CDATA[${obj[item]}]]></${item}>`
    }
  });
  return `<${rootName}>${content.join('')}</${rootName}>`
}

function isXML (str) {
  const reg = /^(<\?xml.*\?>)?(\r?\n)*<xml>(.|\r?\n)*<\/xml>$/i;
  return reg.test(str.trim())
}
// 简易版XML转Object，只可在微信支付时使用，不支持嵌套
function parseXML (xml) {
  const xmlReg = /<(?:xml|root).*?>([\s|\S]*)<\/(?:xml|root)>/;
  const str = xmlReg.exec(xml)[1];
  const obj = {};
  const nodeReg = /<(.*?)>(?:<!\[CDATA\[){0,1}(.*?)(?:\]\]>){0,1}<\/.*?>/g;
  let matches = null;
  // eslint-disable-next-line no-cond-assign
  while ((matches = nodeReg.exec(str))) {
    obj[matches[1]] = matches[2];
  }
  return obj
}

var utils = {
  decryptData,
  md5,
  sha256,
  getSignStr,
  getNonceStr,
  buildXML,
  parseXML,
  isXML
};

function parseFeeValue (returnValue, shouldParse) {
  shouldParse.forEach((item) => {
    returnValue[item] = Number(returnValue[item]);
  });
}

var protocols = {
  orderQuery: {
    returnValue: function (returnValue) {
      parseFeeValue(returnValue, ['cashFee', 'totalFee', 'couponCount']);
      returnValue.couponList = [];
      const couponCount = returnValue.couponCount || 0;
      for (let n = 0; n < couponCount; n++) {
        returnValue.couponList.push({
          couponId: returnValue[`couponId${n}`],
          couponType: returnValue[`couponType${n}`],
          couponFee: Number(returnValue[`couponFee${n}`])
        });
        delete returnValue[`couponId${n}`];
        delete returnValue[`couponType${n}`];
        delete returnValue[`couponFee${n}`];
      }
      return returnValue
    }
  },
  refund: {
    returnValue: function (returnValue) {
      parseFeeValue(returnValue, ['refundFee', 'settlementRefundFee', 'totalFee', 'settlementTotalFee', 'cashFee', 'cashRefundFee', 'couponRefundFee', 'couponRefundCount']);
      returnValue.couponList = [];
      const couponRefundCount = returnValue.couponRefundCount || 0;
      for (let n = 0; n < couponRefundCount; n++) {
        returnValue.couponList.push({
          couponRefundId: returnValue[`couponRefundId${n}`],
          couponType: returnValue[`couponType${n}`],
          couponRefundFee: Number(returnValue[`couponRefundFee${n}`])
        });
        delete returnValue[`couponRefundId${n}`];
        delete returnValue[`couponType${n}`];
        delete returnValue[`couponRefundFee${n}`];
      }
      return returnValue
    }
  },
  refundQuery: {
    returnValue: function (returnValue) {
      parseFeeValue(returnValue, ['totalFee', 'refundFee', 'settlementTotalFee', 'cashFee', 'refundCount']);
      // 此接口微信做了分页，单次查询部分退款不会超过10笔，即n在[0,9]之间
      returnValue.refundList = [];
      for (let n = 0; n < returnValue.refundCount; n++) {
        returnValue[`refundFee${n}`] = Number(returnValue[`refundFee${n}`]);
        returnValue[`couponRefundFee${n}`] = Number(
          returnValue[`couponRefundFee${n}`]
        );
        returnValue[`settlementRefundFee${n}`] = Number(
          returnValue[`settlementRefundFee${n}`]
        );
        const couponRefundCount = Number(returnValue[`couponRefundCount${n}`]) || 0;
        const tempRefundItem = {
          outRefundNo: returnValue[`outRefundNo${n}`],
          refundId: returnValue[`refundId${n}`],
          refundChannel: returnValue[`refundChannel${n}`],
          refundFee: Number(returnValue[`refundFee${n}`]),
          settlementRefundFee: Number(returnValue[`settlementRefundFee${n}`]),
          couponRefundFee: Number(returnValue[`couponRefundFee${n}`]),
          couponRefundCount: couponRefundCount,
          refundStatus: returnValue[`refundStatus${n}`],
          refundAccount: returnValue[`refundAccount${n}`],
          refundRecvAccout: returnValue[`refundRecvAccout${n}`],
          refundSuccessTime: returnValue[`refundSuccessTime${n}`],
          couponList: []
        };
        delete returnValue[`outRefundNo${n}`];
        delete returnValue[`refundId${n}`];
        delete returnValue[`refundChannel${n}`];
        delete returnValue[`refundFee${n}`];
        delete returnValue[`settlementRefundFee${n}`];
        delete returnValue[`couponRefundFee${n}`];
        delete returnValue[`couponRefundCount${n}`];
        delete returnValue[`refundStatus${n}`];
        delete returnValue[`refundAccount${n}`];
        delete returnValue[`refundRecvAccout${n}`];
        delete returnValue[`refundSuccessTime${n}`];
        for (let m = 0; m < couponRefundCount; m++) {
          tempRefundItem.couponList.push({
            couponRefundId: returnValue[`couponRefundId${n}${m}`],
            couponType: returnValue[`couponType${n}${m}`],
            couponRefundFee: Number(returnValue[`couponRefundId${n}${m}`])
          });
          delete returnValue[`couponRefundId${n}${m}`];
          delete returnValue[`couponType${n}${m}`];
          delete returnValue[`couponRefundFee${n}${m}`];
        }
        returnValue.refundList.push(tempRefundItem);
      }
      return returnValue
    }
  },
  verifyPaymentNotify: {
    returnValue: function (returnValue) {
      parseFeeValue(returnValue, ['cashFee', 'totalFee', 'couponCount']);
      const couponCount = returnValue.couponCount || 0;
      returnValue.couponList = [];
      for (let n = 0; n < couponCount; n++) {
        returnValue.couponList.push({
          couponId: returnValue[`couponId${n}`],
          couponType: returnValue[`couponType${n}`],
          couponFee: Number(returnValue[`couponFee${n}`])
        });
        delete returnValue[`couponId${n}`];
        delete returnValue[`couponType${n}`];
        delete returnValue[`couponFee${n}`];
      }
      return returnValue
    }
  },
  verifyRefundNotify: {
    returnValue: function (returnValue) {
      parseFeeValue(returnValue, ['refundFee', 'settlementRefundFee', 'settlementTotalFee', 'totalFee']);
      return returnValue
    }
  }
};

class Payment {
  constructor (options = {}) {
    if (!options.appId) throw new Error('appId required')
    if (!options.mchId) throw new Error('mchId required')
    if (!options.key) throw new Error('key required')

    options.signType = options.signType || 'MD5';
    this.options = Object.assign({}, options);

    this._protocols = protocols;
    this.baseUrl = 'https://api.mch.weixin.qq.com';
    this.paths = {
      unifiedOrder: '/pay/unifiedorder',
      orderQuery: '/pay/orderquery',
      closeOrder: '/pay/closeorder',
      refund: '/secapi/pay/refund',
      refundQuery: '/pay/refundquery',
      downloadBill: '/pay/downloadbill',
      downloadFundflow: '/pay/downloadfundflow',
      getsignkey: '/pay/getsignkey'
    };
  }

  _getSign (params, type) {
    const str = utils.getSignStr(params) + '&key=' + this.options.key;
    switch (type) {
      case 'MD5':
        return utils.md5(str).toUpperCase()
      case 'HMAC-SHA256':
        return utils.sha256(str, this.options.key).toUpperCase()
      default:
        throw new Error('signType Error')
    }
  }

  _normalizeResult (obj, apiName) {
    obj.returnMsg =
      obj.returnMsg || (obj.returnCode === 'SUCCESS' ? 'ok' : 'fail');
    obj.errMsg = `payment.${apiName} ${obj.returnMsg.toLowerCase()}`;
    return obj
  }

  _parse (xml, apiName, signType) {
    const json = utils.parseXML(xml);
    if (json.return_code === 'FAIL') throw new Error(`${json.return_msg}`)
    if (apiName !== 'getSignkey') {
      if (json.appid !== this.options.appId) throw new Error('appId不匹配')
      if (json.mch_id !== this.options.mchId) throw new Error('mchId不匹配')
      if (json.sign !== this._getSign(json, signType)) throw new Error('返回结果签名错误')
      // 特殊处理appId
      json.app_id = json.appid;
      delete json.appid;
    }

    if (json.result_code === 'FAIL') { throw new Error(`${json.err_code} ${json.err_code_des}`) }
    return this._normalizeResult(snake2camelJson(json), apiName)
  }

  _parseBill (data, apiName) {
    const result = {};
    if (utils.isXML(data)) {
      const json = utils.parseXML(data);
      if (json.return_code === 'FAIL') throw new Error(`${json.return_msg}`)
      if (json.result_code === 'FAIL') throw new Error(`${json.err_code} ${json.err_code_des}`)
    } else {
      result.returnCode = 'SUCCESS';
      result.content = data;
    }
    return this._normalizeResult(result, apiName)
  }

  _getPublicParams () {
    return {
      appid: this.options.appId,
      mchId: this.options.mchId,
      nonceStr: utils.getNonceStr()
    }
  }

  async _request (params, apiName, needPfx = false) {
    if (apiName !== 'getSignkey') {
      await this._initSandbox();
    }
    const signType = params.signType || this.options.signType;
    params = camel2snakeJson(params);
    params.sign = this._getSign(params, signType);
    const pkg = {
      method: 'POST',
      dataType: 'text',
      data: utils.buildXML(params),
      timeout: this.options.timeout
    };

    if (needPfx) {
      pkg.pfx = this.options.pfx;
      pkg.passphrase = this.options.mchId;
    }

    const { status, data } = await uniCloud.httpclient.request(
      this.options.sandbox ? `${this.baseUrl}/sandboxnew${this.paths[apiName]}` : `${this.baseUrl}${this.paths[apiName]}`,
      pkg
    );
    if (status !== 200) throw new Error('request fail')

    if (['downloadBill', 'downloadFundflow'].indexOf(apiName) !== -1) {
      return this._parseBill(data, apiName)
    }
    return this._parse(data, apiName, signType)
  }

  async getSignkey () {
    const pkg = {
      mchId: this.options.mchId,
      nonceStr: utils.getNonceStr()
    };
    const result = await this._request(pkg, 'getSignkey');
    return result
  }

  async _initSandbox () {
    if (this.options.sandbox && !this.options.sandboxKey) {
      this.options.key = this.options.sandboxKey = await this.getSignkey()
        .sandbox_signkey;
    }
  }

  async unifiedOrder (params) {
    let defaultTradeType;
    switch (this.options.clientType) {
      case 'app-plus':
        defaultTradeType = 'APP';
        break
      case 'mp-weixin':
      default:
        defaultTradeType = 'JSAPI';
        break
    }
    const pkg = {
      ...params,
      ...this._getPublicParams(),
      spbillCreateIp: params.spbillCreateIp || '127.0.0.1',
      tradeType: params.tradeType || defaultTradeType
    };
    const result = await this._request(pkg, 'unifiedOrder');
    return result
  }

  _getPayParamsByPrepayId (prepayId, signType) {
    let pkg;
    // 请务必注意各个参数的大小写
    switch (this.options.clientType) {
      case 'app-plus':
        pkg = {
          appid: this.options.appId,
          noncestr: utils.getNonceStr(),
          package: 'Sign=WXPay',
          partnerid: this.options.mchId,
          prepayid: prepayId,
          timestamp: '' + ((Date.now() / 1000) | 0)
        };
        pkg.sign = this._getSign(pkg, signType);
        break
      case 'mp-weixin':
        pkg = {
          appId: this.options.appId,
          nonceStr: utils.getNonceStr(),
          package: 'prepay_id=' + prepayId,
          timeStamp: '' + ((Date.now() / 1000) | 0)
        };
        // signType也需要sign
        pkg.signType = signType;
        pkg.paySign = this._getSign(pkg, signType);
        break
      default:
        throw new Error('不支持的客户端类型，微信支付下单仅支持App、微信小程序')
    }
    return pkg
  }

  async getOrderInfo (params) {
    const orderResult = await this.unifiedOrder(params);
    if (!orderResult.prepayId) {
      throw new Error(orderResult.errMsg || '获取prepayId失败')
    }
    return {
      orderInfo: this._getPayParamsByPrepayId(
        orderResult.prepayId,
        params.signType || this.options.signType
      )
    }
  }

  async orderQuery (params) {
    const pkg = {
      ...params,
      ...this._getPublicParams()
    };
    const result = await this._request(pkg, 'orderQuery');
    return result
  }

  async closeOrder (params) {
    const pkg = {
      ...params,
      ...this._getPublicParams()
    };
    const result = await this._request(pkg, 'closeOrder');
    return result
  }

  async refund (params) {
    const pkg = {
      ...params,
      ...this._getPublicParams()
    };
    const result = await this._request(pkg, 'refund', true);
    return result
  }

  async refundQuery (params) {
    const pkg = {
      ...params,
      ...this._getPublicParams()
    };
    const result = await this._request(pkg, 'refundQuery');
    return result
  }

  async downloadBill (params) {
    const pkg = {
      ...params,
      ...this._getPublicParams(),
      billType: params.billType || 'ALL'
    };
    const result = await this._request(pkg, 'downloadBill');
    return result
  }

  async downloadFundflow (params) {
    const pkg = {
      ...params,
      ...this._getPublicParams(),
      // 目前仅支持HMAC-SHA256
      signType: params.signType || 'HMAC-SHA256',
      accountType: params.accountType || 'Basic'
    };
    const result = await this._request(pkg, 'downloadFundflow', true);
    return result
  }

  _verifyNotify (postData, verifySign) {
    let xmlData = postData.body;
    if (postData.isBase64Encoded) {
      xmlData = Buffer.from(xmlData, 'base64').toString('utf-8');
    }
    const json = utils.parseXML(xmlData);
    if (json.return_code === 'FAIL') throw new Error(`${json.return_code} ${json.return_msg}`)
    if (json.appid !== this.options.appId) throw new Error('appId不匹配')
    if (json.mch_id !== this.options.mchId) throw new Error('mchId不匹配')
    if (verifySign && json.sign !== this._getSign(json, this.options.signType)) throw new Error('通知验签未通过')
    const result = snake2camelJson(json);
    result.appId = result.appid;
    delete result.appid;
    return result
  }

  verifyPaymentNotify (postData) {
    return this._verifyNotify(postData, true)
  }

  verifyRefundNotify (postData) {
    const json = this._verifyNotify(postData, false);
    const reqInfo = snake2camelJson(
      utils.parseXML(utils.decryptData(json.reqInfo, utils.md5(this.options.key)))
    );
    Object.assign(json, reqInfo);
    delete json.reqInfo;
    return json
  }
}

class WxApi {
  constructor (options) {
    this.options = Object.assign({}, {
      baseurl: 'https://api.weixin.qq.com',
      timeout: 5000
    }, options);
    // this.auth = createApi(Auth, this.options)
    this.analysis = createApi(Analysis, this.options);
    this.customerServiceMessage = createApi(CustomerServiceMessage, this.options);
    this.wxacode = createApi(Wxacode, this.options);
    this.img = createApi(Img, this.options);
    this.subscribeMessage = createApi(SubscribeMessage, this.options);
    // this.payment = createApi(Payment, this.options)
  }
  
  get auth(){
	  return createApi(Auth, this.options)
  }
  
  get payment(){
	  return createApi(Payment, this.options)
  }
}

const ALIPAY_ALGORITHM_MAPPING = {
  RSA: 'RSA-SHA1',
  RSA2: 'RSA-SHA256'
};

class AlipayBase {
  constructor (options = {}) {
    if (!options.appId) throw new Error('appId required')
    if (!options.privateKey) throw new Error('privateKey required')
    const defaultOptions = {
      gateway: 'https://openapi.alipay.com/gateway.do',
      timeout: 5000,
      charset: 'utf-8',
      version: '1.0',
      signType: 'RSA2',
      timeOffset: -new Date().getTimezoneOffset() / 60,
      keyType: 'PKCS8'
    };

    if (options.sandbox) {
      options.gateway = 'https://openapi.alipaydev.com/gateway.do';
    }

    this.options = Object.assign({}, defaultOptions, options);

    const privateKeyType =
      this.options.keyType === 'PKCS8' ? 'PRIVATE KEY' : 'RSA PRIVATE KEY';

    this.options.privateKey = this._formatKey(
      this.options.privateKey,
      privateKeyType
    );
    if (this.options.alipayPublicKey) {
      this.options.alipayPublicKey = this._formatKey(
        this.options.alipayPublicKey,
        'PUBLIC KEY'
      );
    }
  }

  _formatKey (key, type) {
    return `-----BEGIN ${type}-----\n${key}\n-----END ${type}-----`
  }

  _formatUrl (url, params) {
    let requestUrl = url;
    // 需要放在 url 中的参数列表
    const urlArgs = [
      'app_id',
      'method',
      'format',
      'charset',
      'sign_type',
      'sign',
      'timestamp',
      'version',
      'notify_url',
      'return_url',
      'auth_token',
      'app_auth_token'
    ];

    for (const key in params) {
      if (urlArgs.indexOf(key) > -1) {
        const val = encodeURIComponent(params[key]);
        requestUrl = `${requestUrl}${
          requestUrl.includes('?') ? '&' : '?'
        }${key}=${val}`;
        // 删除 postData 中对应的数据
        delete params[key];
      }
    }

    return { execParams: params, url: requestUrl }
  }

  _getSign (method, params) {
    const bizContent = params.bizContent || null;
    delete params.bizContent;

    const signParams = Object.assign({
      method,
      appId: this.options.appId,
      charset: this.options.charset,
      version: this.options.version,
      signType: this.options.signType,
      timestamp: getFullTimeStr(getOffsetDate(this.options.timeOffset))
    }, params);

    if (bizContent) {
      signParams.bizContent = JSON.stringify(camel2snakeJson(bizContent));
    }

    // params key 驼峰转下划线
    const decamelizeParams = camel2snakeJson(signParams);

    // 排序
    const signStr = Object.keys(decamelizeParams)
      .sort()
      .map((key) => {
        let data = decamelizeParams[key];
        if (Array.prototype.toString.call(data) !== '[object String]') {
          data = JSON.stringify(data);
        }
        return `${key}=${data}`
      })
      .join('&');

    // 计算签名
    const sign = crypto
      .createSign(ALIPAY_ALGORITHM_MAPPING[this.options.signType])
      .update(signStr, 'utf8')
      .sign(this.options.privateKey, 'base64');

    return Object.assign(decamelizeParams, { sign })
  }

  async _exec (method, params = {}, option = {}) {
    // 计算签名
    const signData = this._getSign(method, params);
    const { url, execParams } = this._formatUrl(this.options.gateway, signData);
    const { status, data } = await uniCloud.httpclient.request(url, {
      method: 'POST',
      data: execParams,
      // 按 text 返回（为了验签）
      dataType: 'text',
      timeout: this.options.timeout
    });
    if (status !== 200) throw new Error('request fail')
    /**
     * 示例响应格式
     * {"alipay_trade_precreate_response":
     *  {"code": "10000","msg": "Success","out_trade_no": "111111","qr_code": "https:\/\/"},
     *  "sign": "abcde="
     * }
     * 或者
     * {"error_response":
     *  {"code":"40002","msg":"Invalid Arguments","sub_code":"isv.code-invalid","sub_msg":"授权码code无效"},
     * }
     */
    const result = JSON.parse(data);
    const responseKey = `${method.replace(/\./g, '_')}_response`;
    const response = result[responseKey];
    const errorResponse = result.error_response;
    if (response) {
      // 按字符串验签
      const validateSuccess = option.validateSign ? this._checkResponseSign(data, responseKey) : true;
      if (validateSuccess) {
        if (!response.code || response.code === '10000') {
          const errCode = 0;
          const errMsg = response.msg || '';
          return {
            errCode,
            errMsg,
            ...snake2camelJson(response)
          }
        }
        const msg = response.sub_code ? `${response.sub_code} ${response.sub_msg}` : `${response.msg || 'unkonwn error'}`;
        throw new Error(msg)
      } else {
        throw new Error('返回结果签名错误')
      }
    } else if (errorResponse) {
      throw new Error(errorResponse.sub_msg || errorResponse.msg || '接口返回错误')
    }

    throw new Error('request fail')
  }

  _checkResponseSign (signStr, responseKey) {
    if (!this.options.alipayPublicKey || this.options.alipayPublicKey === '') {
      console.warn('options.alipayPublicKey is empty');
      // 支付宝公钥不存在时不做验签
      return true
    }

    // 带验签的参数不存在时返回失败
    if (!signStr) { return false }

    // 根据服务端返回的结果截取需要验签的目标字符串
    const validateStr = this._getSignStr(signStr, responseKey);
    // 服务端返回的签名
    const serverSign = JSON.parse(signStr).sign;

    // 参数存在，并且是正常的结果（不包含 sub_code）时才验签
    const verifier = crypto.createVerify(ALIPAY_ALGORITHM_MAPPING[this.options.signType]);
    verifier.update(validateStr, 'utf8');
    return verifier.verify(this.options.alipayPublicKey, serverSign, 'base64')
  }

  _getSignStr (originStr, responseKey) {
    // 待签名的字符串
    let validateStr = originStr.trim();
    // 找到 xxx_response 开始的位置
    const startIndex = originStr.indexOf(`${responseKey}"`);
    // 找到最后一个 “"sign"” 字符串的位置（避免）
    const lastIndex = originStr.lastIndexOf('"sign"');

    /**
     * 删除 xxx_response 及之前的字符串
     * 假设原始字符串为
     *  {"xxx_response":{"code":"10000"},"sign":"jumSvxTKwn24G5sAIN"}
     * 删除后变为
     *  :{"code":"10000"},"sign":"jumSvxTKwn24G5sAIN"}
     */
    validateStr = validateStr.substr(startIndex + responseKey.length + 1);

    /**
     * 删除最后一个 "sign" 及之后的字符串
     * 删除后变为
     *  :{"code":"10000"},
     * {} 之间就是待验签的字符串
     */
    validateStr = validateStr.substr(0, lastIndex);

    // 删除第一个 { 之前的任何字符
    validateStr = validateStr.replace(/^[^{]*{/g, '{');

    // 删除最后一个 } 之后的任何字符
    validateStr = validateStr.replace(/\}([^}]*)$/g, '}');

    return validateStr
  }

  _notifyRSACheck (signArgs, signStr, signType) {
    const signContent = Object.keys(signArgs).sort().filter(val => val).map((key) => {
      let value = signArgs[key];

      if (Array.prototype.toString.call(value) !== '[object String]') {
        value = JSON.stringify(value);
      }
      return `${key}=${decodeURIComponent(value)}`
    }).join('&');

    const verifier = crypto.createVerify(ALIPAY_ALGORITHM_MAPPING[signType]);

    return verifier.update(signContent, 'utf8').verify(this.options.alipayPublicKey, signStr, 'base64')
  }

  _checkNotifySign (postData) {
    const signStr = postData.sign;

    // 未设置“支付宝公钥”或签名字符串不存，验签不通过
    if (!this.options.alipayPublicKey || !signStr) {
      return false
    }

    // 先从签名字符串中取 sign_type，再取配置项、都不存在时默认为 RSA2（RSA 已不再推荐使用）
    const signType = postData.sign_type || this.options.signType || 'RSA2';
    const signArgs = { ...postData };
    // 除去 sign
    delete signArgs.sign;

    /**
     * 某些用户可能自己删除了 sign_type 后再验签
     * 为了保持兼容性临时把 sign_type 加回来
     * 因为下面的逻辑会验签 2 次所以不会存在验签不同过的情况
     */
    signArgs.sign_type = signType;

    // 保留 sign_type 验证一次签名
    const verifyResult = this._notifyRSACheck(signArgs, signStr, signType);

    if (!verifyResult) {
      /**
       * 删除 sign_type 验一次
       * 因为“历史原因”需要用户自己判断是否需要保留 sign_type 验证签名
       * 这里是把其他 sdk 中的 rsaCheckV1、rsaCheckV2 做了合并
       */
      delete signArgs.sign_type;
      return this._notifyRSACheck(signArgs, signStr, signType)
    }

    return true
  }

  _verifyNotify (notify) {
    if (!notify.headers) {
      throw new Error('通知格式不正确')
    }
    let contentType;
    for (const key in notify.headers) {
      if (key.toLowerCase() === 'content-type') {
        contentType = notify.headers[key];
      }
    }
    if (notify.isBase64Encoded !== false && contentType.indexOf('application/x-www-form-urlencoded') === -1) {
      throw new Error('通知格式不正确')
    }
    const postData = querystring.parse(notify.body);
    if (this._checkNotifySign(postData)) {
      return snake2camelJson(postData)
    }
    throw new Error('通知验签未通过')
  }
}

var protocols$1 = {
  code2Session: {
    // args (fromArgs) {
    //   return fromArgs
    // },
    returnValue: {
      openid: 'userId'
    }
  }
};

class Auth$1 extends AlipayBase {
  constructor (options) {
    super(options);
    this._protocols = protocols$1;
  }

  async code2Session (code) {
    const result = await this._exec('alipay.system.oauth.token', {
      grantType: 'authorization_code',
      code
    });
    return result
  }
}

function parseFeeValue$1 (returnValue, shouldParse, rate) {
  shouldParse.forEach((item) => {
    returnValue[item] = Number(returnValue[item]) * rate;
  });
}

var protocols$2 = {
  unifiedOrder: {
    args: {
      _pre (args) {
        parseFeeValue$1(args, ['totalFee'], 0.01);
        return args
      },
      totalAmount: 'totalFee',
      buyerId: 'openid'
    },
    returnValue: {
      transactionId: 'tradeNo'
    }
  },
  getOrderInfo: {
    args: {
      _pre (args) {
        parseFeeValue$1(args, ['totalFee'], 0.01);
        return args
      },
      buyerId: 'openid',
      totalAmount: 'totalFee'
    }
  },
  orderQuery: {
    args: {
      tradeNo: 'transactionId'
    },
    returnValue: {
      _pre (returnValue) {
        parseFeeValue$1(returnValue, ['totalAmount', 'settleAmount', 'buyerPayAmount', 'payAmount', 'pointAmount', 'invoiceAmount', 'receiptAmount', 'chargeAmount', 'mdiscountAmount', 'discountAmount'], 100);
        return returnValue
      },
      transactionId: 'tradeNo',
      openid: 'buyerUserId',
      tradeState: function (returnValue) {
        // 微信
        // SUCCESS—支付成功
        // REFUND—转入退款
        // NOTPAY—未支付
        // CLOSED—已关闭
        // REVOKED—已撤销（刷卡支付）
        // USERPAYING--用户支付中
        // PAYERROR--支付失败(其他原因，如银行返回失败)

        // 支付宝
        // WAIT_BUYER_PAY（交易创建，等待买家付款）
        // TRADE_CLOSED（未付款交易超时关闭，或支付完成后全额退款）
        // TRADE_SUCCESS（交易支付成功）
        // TRADE_FINISHED（交易结束，不可退款）
        switch (returnValue.tradeStatus) {
          case 'WAIT_BUYER_PAY':
            return 'USERPAYING'
          case 'TRADE_CLOSED':
            return 'CLOSED'
          case 'TRADE_SUCCESS':
            return 'SUCCESS'
          case 'TRADE_FINISHED':
            return 'FINISHED'
          default:
            return returnValue.tradeStatus
        }
      },
      totalFee: 'totalAmount',
      settlementTotalFee: 'settleAmount',
      feeType: 'transCurrency',
      cashFeeType: 'payCurrency',
      cashFee: 'buyerPayAmount',
      fundBillList: function (returnValue) {
        if (!returnValue.fundBillList) {
          return []
        }
        return returnValue.fundBillList.map((item) => {
          item.amount = Number(item.amount) * 100;
          item.realAmount = Number(item.realAmount) * 100;
          return item
        })
      },
      tradeSettleDetailList: function (returnValue) {
        if (!returnValue.tradeSettleDetailList) {
          return []
        }
        return returnValue.tradeSettleDetailList.map((item) => {
          item.amount = Number(item.amount) * 100;
          return item
        })
      },
      _purify: {
        shouldDelete: ['tradeStatus']
      }
    }
  },
  cancelOrder: {
    args: {
      tradeNo: 'transactionId'
    },
    returnValue: {
      transactionId: 'tradeNo'
    }
  },
  closeOrder: {
    args: {
      tradeNo: 'transactionId'
    },
    returnValue: {
      transactionId: 'tradeNo'
    }
  },
  refund: {
    args: {
      _pre (returnValue) {
        parseFeeValue$1(returnValue, ['refundFee', 'sendBackFee'], 0.01);
        return returnValue
      },
      tradeNo: 'transactionId',
      refundAmount: 'refundFee',
      outRequestNo: 'outRefundNo',
      refundCurrency: 'refundFeeType',
      refundReason: 'refundDesc',
      goodsDetail: function (args) {
        if (!args.goodsDetail) {
          return []
        }
        return args.goodsDetail.map((item) => {
          item.price = Number(item.price) / 100;
          return item
        })
      },
      refundRoyaltyParameters: function (args) {
        if (!args.refundRoyaltyParameters) {
          return []
        }
        return args.refundRoyaltyParameters.map((item) => {
          item.amount = Number(item.amount) / 100;
          return item
        })
      }
    },
    returnValue: {
      _pre (returnValue) {
        parseFeeValue$1(returnValue, ['refundFee', 'presentRefundBuyerAmount', 'presentRefundDiscountAmount', 'presentRefundMdiscountAmount'], 100);
        return returnValue
      },
      transactionId: 'tradeNo',
      openid: 'buyerUserId',
      cashRefundFee: 'presentRefundBuyerAmount',
      refundId: 'refundSettlementId',
      cashFeeType: 'refundCurrency',
      refundDetailItemList: function (returnValue) {
        if (!returnValue.refundDetailItemList) {
          return []
        }
        return returnValue.refundDetailItemList.map((item) => {
          item.amount = Number(item.amount) * 100;
          item.realAmount = Number(item.realAmount) * 100;
          return item
        })
      },
      refundPresetPaytoolList: function (returnValue) {
        if (!returnValue.refundPresetPaytoolList) {
          return []
        }
        return returnValue.refundPresetPaytoolList.map((item) => {
          item.amount = Number(item.amount) * 100;
          return item
        })
      }
    }
  },
  refundQuery: {
    args: {
      tradeNo: 'transactionId',
      outRequestNo: 'outRefundNo'
    },
    returnValue: {
      _pre (returnValue) {
        parseFeeValue$1(returnValue, ['totalAmount', 'refundAmount', 'sendBackFee', 'presentRefundBuyerAmount', 'presentRefundBuyerAmount', 'presentRefundMdiscountAmount'], 100);
        return returnValue
      },
      transactionId: 'tradeNo',
      outRefundNo: 'outRequestNo',
      totalFee: 'totalAmount',
      refundFee: 'refundAmount',
      refundDesc: 'refundReason',
      refundId: 'refundSettlementId',
      refundRoyaltys: function (returnValue) {
        if (!returnValue.refundRoyaltys) {
          return []
        }
        return returnValue.refundRoyaltys.map((item) => {
          item.refundAmount = Number(item.refundAmount) * 100;
          return item
        })
      },
      refundDetailItemList: function (returnValue) {
        if (!returnValue.refundDetailItemList) {
          return []
        }
        return returnValue.refundDetailItemList.map((item) => {
          item.amount = Number(item.amount) * 100;
          item.realAmount = Number(item.realAmount) * 100;
          return item
        })
      }
    }
  },
  verifyPaymentNotify: {
    returnValue: {
      _pre (returnValue) {
        parseFeeValue$1(returnValue, ['invoiceAmount', 'receiptAmount', 'buyerPayAmount', 'totalAmount', 'pointAmount'], 100);
        return returnValue
      },
      openid: 'buyerId',
      transactionId: 'tradeNo',
      totalFee: 'totalAmount',
      cashFee: 'buyerPayAmount',
      fundBillList: function (returnValue) {
        if (!returnValue.fundBillList) {
          return []
        }
        return JSON.parse(returnValue.fundBillList).map((item) => {
          item.amount = Number(item.amount) * 100;
          return item
        })
      }
    }
  }
};

class Payment$1 extends AlipayBase {
  constructor (options) {
    if (!options.alipayPublicKey) throw new Error('调用支付时需传入支付宝公钥（alipayPublicKey）')
    super(options);
    this._protocols = protocols$2;
  }

  async _request (method, params) {
    const data = {};
    if (params.notifyUrl) {
      data.notifyUrl = params.notifyUrl;
      delete params.notifyUrl;
    }
    data.bizContent = params;
    const result = await this._exec(method, data, {
      validateSign: true
    });
    return result
  }

  // 小程序支付时seller_id、buyer_id都是必填项
  async unifiedOrder (params) {
    const result = await this._request(
      'alipay.trade.create',
      Object.assign({ sellerId: this.options.mchId }, params)
    );
    return result
  }

  async getOrderInfo (params) {
    switch (this.options.clientType) {
      case 'app-plus': {
        const data = {};
        if (params.notifyUrl) {
          data.notifyUrl = params.notifyUrl;
          delete params.notifyUrl;
        }
        data.bizContent = params;
        const signData = this._getSign('alipay.trade.app.pay', data);
        const { url, execParams } = this._formatUrl('', signData);
        const orderInfo = (
          url +
          '&biz_content=' +
          encodeURIComponent(execParams.biz_content)
        ).substr(1);
        return { orderInfo }
      }
      case 'mp-alipay': {
        const orderResult = await this.unifiedOrder(params);
        if (!orderResult.tradeNo) {
          throw new Error('获取支付宝交易号失败')
        }
        return { orderInfo: orderResult.tradeNo }
      }
      default:
        throw new Error(
          '不支持的客户端类型，支付宝支付下单仅支持App、支付宝小程序'
        )
    }
  }

  async orderQuery (params) {
    const result = await this._request('alipay.trade.query', params);
    return result
  }

  async cancelOrder (params) {
    const result = await this._request('alipay.trade.cancel', params);
    return result
  }

  async closeOrder (params) {
    const result = await this._request('alipay.trade.close', params);
    return result
  }

  async refund (params) {
    const result = await this._request('alipay.trade.refund', params);
    return result
  }

  async refundQuery (params) {
    const result = await this._request(
      'alipay.trade.fastpay.refund.query',
      params
    );
    return result
  }

  // {"gmt_create":"2020-05-09 10:59:00","charset":"utf-8","seller_email":"payservice@dcloud.io","subject":"DCloud项目捐赠","sign":"fZyNcBGZHUerYrDApdsDaMosoNk/FxMLHDmtheHu9MVsMkLaAz+uJcLA8rSiSP7sT0ajevzNKAoqXnJUkf289NTpSGsEG9sb428k8gAeuQH+8c1XOoPIs4KYRTJkV67F+vQvhlV6r/aSzW2ygJHQ92osHTEPfsHNQKfegFTAJJFES8vgNOV1LkOJZtmFjNxoYS5Z0cwVgrpl/+5avrVNlNIfEbF6VZ8sHNRxycOY7OwJ7QcjTi6qRZqRahtj3wKeFGVmVgsUaixqm4ctw2dy1VjYBWZ6609vfVA9i2Nnkyhoy4pjlWnFKiwt9q3s8rwiiCY22uvqcqWbB30WIJDraw==","buyer_id":"2088702245300430","body":"DCloud致力于打造HTML5最好的移动开发工具，包括终端的Runtime、云端的服务和IDE，同时提供各项配套的开发者服务。","invoice_amount":"0.01","notify_id":"2020050900222110211000431413435818","fund_bill_list":"[{\"amount\":\"0.01\",\"fundChannel\":\"ALIPAYACCOUNT\"}]","notify_type":"trade_status_sync","trade_status":"TRADE_SUCCESS","receipt_amount":"0.01","buyer_pay_amount":"0.01","app_id":"2018121062525175","sign_type":"RSA2","seller_id":"2088801273866834","gmt_payment":"2020-05-09 11:02:11","notify_time":"2020-05-09 14:29:02","version":"1.0","out_trade_no":"1588993139851","total_amount":"0.01","trade_no":"2020050922001400431443283406","auth_app_id":"2018121062525175","buyer_logon_id":"188****5803","point_amount":"0.00"}
  verifyPaymentNotify (postData) {
    return super._verifyNotify(postData)
  }
}

class AliApi {
  constructor (options) {
    this.options = Object.assign({}, options);
    this.auth = createApi(Auth$1, this.options);
    this.payment = createApi(Payment$1, this.options);
  }
}

var index = {
  initWeixin: function (options = {}) {
    options.clientType = options.clientType || __ctx__.PLATFORM;
    return new WxApi(options)
  },
  initAlipay: function (options = {}) {
    options.clientType = options.clientType || __ctx__.PLATFORM;
    return new AliApi(options)
  }
};

module.exports = index;
