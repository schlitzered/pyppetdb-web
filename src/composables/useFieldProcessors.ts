interface FactValue {
  fact_name: string
  operator: string
  type: string
  value: string
}

export const factFieldProcessor = {
  fromUrl: (urlValue: string | string[]): FactValue[] => {
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

  toUrl: (formValue: FactValue[]): string[] | undefined => {
    const facts = formValue
      .filter(
        (fact) => fact.fact_name && fact.operator && fact.type && fact.value
      )
      .map(
        (fact) =>
          `${fact.fact_name}:${fact.operator}:${fact.type}:${fact.value}`
      )

    return facts.length > 0 ? facts : undefined
  }
}

export const commaSeparatedProcessor = {
  fromUrl: (urlValue: string | string[]): string[] => {
    return typeof urlValue === 'string' ? urlValue.split(',') : urlValue
  },

  toUrl: (formValue: string | string[]): string => {
    return Array.isArray(formValue) ? formValue.join(',') : formValue
  }
}

export const booleanProcessor = {
  fromUrl: (urlValue: string): boolean => {
    return urlValue === 'true'
  },

  toUrl: (formValue: boolean): string => {
    return formValue ? 'true' : 'false'
  }
}
