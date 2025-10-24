import type { Components, OpenAPISpecs, Operation, Parameter as ParameterSpec } from '#api/types'
import clone from '@data-fair/lib-utils/clone'

let globalSchema: OpenAPISpecs | undefined

export type Parameter = ParameterSpec & {
  in: 'query' | 'header' | 'path' | 'cookie'
  name: string
  description?: string
  examples?: Map<string, Record<string, any>>
  example?: any
  schema?: Record<string, any>
  style?: 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject'
  explode?: boolean
}

export const initTransformer = (schema: OpenAPISpecs) => {
  globalSchema = schema
}

export const getVJSFSchema = (operation: Operation, pathItemParameters: Parameter[]) => {
  const schema = clone(vjsfSchemaBase)

  // Transform securities
  const securities = resolveSecurities(
    globalSchema?.components?.securitySchemes,
    globalSchema?.security,
    operation.security
  )
  for (const [, sec] of Object.entries(securities)) {
    if (sec.in === 'cookie') continue
    schema.properties[sec.in].properties[sec.name] = {
      type: 'string',
      description:
        `Type: ${sec.type}${sec.description ? '\n\n' + sec.description : ''}`,
    }
  }

  // Transform parameters
  const parameters = resolveParameters(pathItemParameters, operation.parameters as Parameter[])
  for (const param of parameters) {
    if (param.in === 'cookie') continue
    // @ts-ignore Not allowed in the OpenAPI spec, but this behavior should not be blocking.
    if (param.in === 'body') continue
    const paramSchema = param.schema as Record<string, any>
    if (!paramSchema) continue // Parameters should have a content key or schema key. // TODO: Content isn't supported yet

    // Add specs examples to the schema
    const examples = resolveExamples(param)
    if (examples.length > 0) {
      if (paramSchema?.examples) paramSchema.examples.concat(examples)
      else if (paramSchema?.items?.examples) paramSchema.items.examples.concat(examples)
      else if (paramSchema?.items) paramSchema.items.examples = examples
      else paramSchema.examples = examples
    }

    schema.properties[param.in].properties[param.name] = {
      ...paramSchema,
      type: paramSchema.type || 'string',
      description: param.description,
      deprecated: paramSchema.deprecated || param.deprecated || false,
    }
  }

  // Transform requestBody
  if (operation.requestBody) {
    const requestBody = operation.requestBody as Record<string, any>
    schema.properties.body.description = requestBody.description || ''

    for (const contentType of Object.keys(requestBody.content)) {
      const slotsLayout = {
        slots: {
          after: {
            name: 'schema-and-examples',
            props: {
              schema: requestBody.content[contentType].schema,
              examples: resolveRequestBodyExamples(requestBody.content[contentType])
            }
          }
        }
      }

      if (contentType === 'multipart/form-data') {
        const schemaFormData = {
          title: contentType,
          type: 'object',
          required: requestBody.content[contentType].schema?.required || [],
          properties: {
            contentType: {
              const: contentType,
            }
          } as Record<string, any>
        }

        for (const [key, value] of Object.entries(requestBody.content[contentType].schema?.properties || {}) as [string, Record<string, any>][]) {
          if (value.type === 'object') {
            schemaFormData.properties[key] = {
              type: 'string',
              title: value.title || key,
              layout: 'textarea',
              description: value.description || ''
            }
          } else if (value.format === 'binary') {
            schemaFormData.properties[key] = {
              type: 'object',
              title: value.title || key,
              description: value.description || '',
              layout: 'file-input'
            }
          } else {
            schemaFormData.properties[key] = value as Record<string, any>
          }
        }

        // Apply slotsLayout to the last property
        const lastKey = Object.keys(schemaFormData.properties).pop()
        if (lastKey) {
          if (typeof schemaFormData.properties[lastKey].layout === 'string') {
            schemaFormData.properties[lastKey].layout = {
              comp: schemaFormData.properties[lastKey].layout,
              ...slotsLayout
            }
          } else {
            schemaFormData.properties[lastKey].layout = {
              ...schemaFormData.properties[lastKey].layout,
              ...slotsLayout
            }
          }
        }

        schema.properties.body.oneOf.push(schemaFormData)
      } else {
        schema.properties.body.oneOf.push({
          title: contentType,
          required: ['value'],
          properties: {
            contentType: {
              const: contentType,
            },
            value: {
              title: contentType,
              type: 'string',
              layout: {
                comp: 'textarea',
                ...slotsLayout
              }
            }
          }
        })
      }
    }
    if (schema.properties.body.oneOf.length === 1) {
      schema.properties.body.layout.defaultData.contentType = Object.keys(requestBody.content)[0]
    }
  }

  // Setup requerds fields for vjsf
  schema.properties.header.required = parameters.filter(param => param.in === 'header' && param.required).map(param => param.name)
  schema.properties.query.required = parameters.filter(param => param.in === 'query' && param.required).map(param => param.name)
  schema.properties.path.required = parameters.filter(param => param.in === 'path').map(param => param.name) // All path parameters are required

  // Clean empty properties
  for (const [key, prop] of Object.entries(schema.properties)) {
    // @ts-ignore
    if (!Object.keys(prop.properties || {}).length && !prop.oneOf?.length) {
      delete schema.properties[key as keyof typeof schema.properties]
    } else {
      schema.required.push(key)
    }
  }

  return schema
}

/*
 * Resolve the security schemes for a given operation :
 * -> Resolve the global security schemes
 * -> Resolve the operation security schemes
 * -> Merge them
 */
const resolveSecurities = (
  securitySchemes: Components['securitySchemes'],
  globalSecurities: OpenAPISpecs['security'],
  operationSecurities: Operation['security']
) => {
  if (!securitySchemes) return {}

  const globalS = globalSecurities?.reduce((acc, sec) => {
    const key = Object.keys(sec)[0]
    if (securitySchemes[key]) {
      acc[key] = securitySchemes[key]
    }
    return acc
  }, {} as Record<string, any>) || {}

  const operationS = operationSecurities?.reduce((acc, sec) => {
    const key = Object.keys(sec)[0]
    if (securitySchemes[key]) {
      acc[key] = securitySchemes[key]
    }
    return acc
  }, {} as Record<string, any>) || {}

  return { ...globalS, ...operationS } as {
    [k: string]: {
      type: 'apiKey' | 'http' | 'mutualTLS' | 'oauth2' | 'openIdConnect'
      name: string
      in: 'query' | 'header' | 'cookie'
      description?: string
    }
  }
}

/*
 * Resolve parameters for a given operation :
 * -> Resolve parameters from pathItem and operation
 * -> Merge unique keys based on "name" and "in" fields
 *    (Operation parameters override pathItem parameters)
*/
export const resolveParameters = (
  pathItemParameters: Parameter[],
  operationParameters: Parameter[]
) => {
  const resolveRefsParameters = (parameters: Parameter[] = []) => {
    return parameters.reduce((map, param) => {
      if (param.name && param.in) {
        map.set(`${param.name}|${param.in}`, param)
      }
      return map
    }, new Map<string, Parameter>())
  }
  const paramsMap = new Map([
    ...resolveRefsParameters(pathItemParameters),
    ...resolveRefsParameters(operationParameters)
  ])

  return Array.from(paramsMap.values())
}

/*
 * Resolve examples for a given operation parameter:
 * -> Resolve examples from parameter
 * -> Generate one resolved examples list
 * -> if they are one example, return it in a list
 */
const resolveExamples = (object: { example?: any, examples?: Map<string, Record<string, any>> }) => {
  const examples = []
  if (object.example) {
    examples.push(typeof object.example === 'object' ? JSON.stringify(object.example, null, 2) : object.example)
  } else if (object.examples) {
    for (const example of Object.values(object.examples)) {
      if (example.value) {
        examples.push(typeof example.value === 'object' ? JSON.stringify(example.value, null, 2) : example.value)
      }
    }
  }
  return examples
}

const resolveRequestBodyExamples = (object: { example?: any, examples?: Map<string, Record<string, any>> }) => {
  const examples: { key: string, summary?: string, value?: any }[] = []
  if (object.example) {
    examples.push({ key: 'default', value: object.example })
  } else if (object.examples) {
    let isFirst = true
    for (const [key, example] of Object.entries(object.examples)) {
      examples.push({ key: isFirst ? 'default' : key, summary: example.summary, value: example.value })
      isFirst = false
    }
  }

  return examples
}

const vjsfSchemaBase = {
  type: 'object',
  required: [],
  properties: {
    header: {
      type: 'object',
      title: 'Headers',
      'x-i18n-title': {
        en: 'Headers',
        fr: 'En-têtes'
      },
      properties: {},
      required: []
    },
    path: {
      type: 'object',
      title: 'Path parameters',
      'x-i18n-title': {
        en: 'Path parameters',
        fr: 'Paramètres de route'
      },
      properties: {},
      required: []
    },
    query: {
      type: 'object',
      title: 'Query parameters',
      'x-i18n-title': {
        en: 'Query parameters',
        fr: 'Paramètres de requête'
      },
      properties: {},
      required: []
    },
    body: {
      type: 'object',
      title: 'Request body',
      'x-i18n-title': {
        en: 'Request body',
        fr: 'Corps de la requête'
      },
      description: '',
      oneOfLayout: { label: 'Select a content type' },
      oneOf: [],
      layout: {
        defaultData: {
          contentType: '',
          value: ''
        }
      }
    }
  }
} as {
  type: 'object'
  required: string[]
  properties: Record<'header' | 'path' | 'query', {
    type: 'object'
    title: string
    properties: Record<string, any>
    required: string[]
  }> & Record<'body', {
    type: 'object'
    title: string
    description: string
    oneOfLayout: Record<string, any>
    oneOf: Record<string, any>[]
    layout: Record<string, any>
  }>
}
