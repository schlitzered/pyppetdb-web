/*
 * Copyright 2026 Stephan Schultchen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import axios from 'axios'
import { apiErrorStore } from '@/store/api_error'
import { loginDataStore } from '@/store/login_data'
import router from '../router/routes'
import qs from 'qs'

export default {
  async request(method, url, data, params, silent = false) {
    const apiError = apiErrorStore()
    const loginData = loginDataStore()
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
        if (error.response && error.response.status === 401) {
          loginData.reset()
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
