import axios from 'axios'
import { apiErrorStore } from '@/store/api_error'
import router from '../router/routes'
import qs from 'qs'

const apiError = apiErrorStore()

export default {
  async request(method, url, data, params, silent = false) {
    let config = {
      method: method,
      url: url,
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: 'repeat' }) // Ensures fields=id&fields=environment&...
      }
    }
    if (data) {
      config.data = data
    }
    if (params) {
      config.params = params
    }
    let result
    await axios(config)
      .then((response) => {
        // loginData.setTimestamp();
        result = response.data
      })
      .catch((error) => {
        if (error.response.status === 401) {
          router.push({ name: 'LoginError' })
        } else {
          if (!silent) {
            apiError.set(error)
          }
        }
        throw error
      })
    return result
  },
  async delete(url, silent = false) {
    return await this.request('delete', url, null, null, silent)
  },
  async get(url, params, silent = false) {
    let data
    return await this.request('get', url, data, params, silent)
  },
  async post(url, data, params, silent = false) {
    return await this.request('post', url, data, params, silent)
  },
  async put(url, data, params, silent = false) {
    return await this.request('put', url, data, params, silent)
  }
}
