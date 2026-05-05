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
export const factFieldProcessor = {
  fromUrl: (urlValue) => {
    const fact_values = Array.isArray(urlValue) ? urlValue : [urlValue]
    return fact_values.map((fact_value) => {
      const parts = fact_value.split(':')
      return {
        fact_name: parts[0] || '',
        operator: parts[1] || '',
        type: parts[2] || '',
        value: parts[3] || ''
      }
    })
  },

  toUrl: (formValue) => {
    const facts = formValue
      .filter(
        (fact) => fact.fact_name && fact.operator && fact.type && fact.value
      )
      .map(
        (fact) =>
          `${fact.fact_name}:${fact.operator}:${fact.type}:${fact.value}`
      )

    return facts.length > 0 ? facts : null
  }
}

export const commaSeparatedProcessor = {
  fromUrl: (urlValue) => {
    return typeof urlValue === 'string' ? urlValue.split(',') : urlValue
  },

  toUrl: (formValue) => {
    return Array.isArray(formValue) ? formValue.join(',') : formValue
  }
}

export const booleanProcessor = {
  fromUrl: (urlValue) => {
    return urlValue === 'true'
  },

  toUrl: (formValue) => {
    return formValue ? 'true' : 'false'
  }
}
