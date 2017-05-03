/**
 * @file: cookie.
 * @intro: cookie存储类.
 * @author: zzmhot.
 * @email: zzmhot@163.com.
 * @Date: 2017/4/28 10:45.
 * @Copyright(©) 2017 by zzmhot.
 *
 */

//存储前缀
import {storagePrefix} from './setting'

import {tools_verify} from 'common/tools'

/**
 * cookies操作类
 */
export default new class Cookie {
  defaults = {};

  expiresMultiplier = 60 * 60 * 24

  /**
   * 根据key获取cookie的值
   * @param {string} key 键
   * @returns {object} 值
   */
  get(key) {
    if (!key) {
      throw new Error('没有找到key。')
      return
    }
    if (typeof key === 'object') {
      throw new Error('key不能是一个对象。')
      return
    }
    let cookies = this.all()
    let value = cookies[storagePrefix + key]
    try {
      value = JSON.parse(value)
    } catch (e) {
      value = {}
    }
    return value
  }

  /**
   * 设置cookies
   * @param key 键
   * @param value 值
   * @param options 选项
   * @returns {Cookie}
   */
  set(key, value, options) {
    options = tools_verify.isObject(options) ? options : {expires: options}
    // 如果expires为空的话那么就设置为session.
    let expires = options.expires !== undefined ? options.expires : (this.defaults.expires || ''),
      expiresType = typeof(expires)
    if (expiresType === 'string' && expires !== '') {
      expires = new Date(expires)
    } else if (expiresType === 'number') {
      expires = new Date(+new Date + 1000 * this.expiresMultiplier * expires)
    }
    if (expires !== '' && 'toGMTString' in expires) {
      expires = ';expires=' + expires.toGMTString()
    }
    //设置path
    let path = options.path || this.defaults.path
    path = path ? ';path=' + path : ''
    //设置domain
    let domain = options.domain || this.defaults.domain
    domain = domain ? ';domain=' + domain : ''
    //设置secure
    let secure = options.secure || this.defaults.secure ? ';secure' : ''
    if (options.secure === false) secure = ''
    //设置cookie
    document.cookie = tools_verify.encode(storagePrefix + key) + '=' + tools_verify.encode(JSON.stringify(value)) + expires + path + domain + secure
    return this
  }

  /**
   * 删除cookie
   * @param {string||array} keys 删除cookie的key
   * @returns {Cookie}
   */
  remove(keys) {
    keys = tools_verify.isArray(keys) ? keys : [keys]
    for (let i = 0, l = keys.length; i < l; i++) {
      this.set(keys[i], '', -1);
    }
    return this
  }

  /**
   * 获取所有的cookie
   * @returns {object} cookie对象
   */
  all() {
    let dCookie = document.cookie
    if (dCookie === '') return {}
    let cookieArr = dCookie.split('; '),
      result = {}
    for (let i = 0, l = cookieArr.length; i < l; i++) {
      let item = cookieArr[i].split('=');
      //arr.shift()把第一个数组删除并得到删除的值
      let key = tools_verify.decode(item.shift())
      let value = tools_verify.decode(item.join(''))
      result[key] = value
    }
    return result
  }
}