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
}

export const initTransformer = (schema: OpenAPISpecs) => {
  schema.$id = 'openapi'
  globalSchema = schema
}

export const getVJSFSchema = (operationSchemaSrc: Operation, pathItemParametersSrc: Parameter[]) => {
  const schema = clone(endpointQuerySchemaBase)
  const operationSchema = clone(operationSchemaSrc)
  const pathItemParameters = clone(pathItemParametersSrc)

  // Transform securities
  const securities = resolveSecurities(
    globalSchema?.components?.securitySchemes,
    globalSchema?.security,
    operationSchema.security
  )
  for (const [key, sec] of Object.entries(securities)) {
    if (sec.in === 'cookie') continue
    schema.properties[sec.in].properties[key] = {
      type: 'string',
      title: (sec.description?.length || 0) < 75 ? sec.description : sec.name,
      description:
        `Type: ${sec.type}
        ${(sec.description?.length || 0) < 75
          ? `\n\nKey: ${sec.name}`
          : `\n\n${sec.description}`
        }`,
    }
  }

  // Transform parameters
  const parameters = resolveParameters(pathItemParameters, operationSchema.parameters as Parameter[])
  for (const param of parameters) {
    if (param.in === 'cookie') continue
    const paramSchema = param.schema as Record<string, any>
    if (!paramSchema) continue // Parameters should have a content key or schema key. // TODO: Content isn't supported yet

    // Add specs examples to the schema
    const examples = resolveExamples(param)
    if (paramSchema?.examples) paramSchema.examples.concat(examples)
    else if (paramSchema?.items?.examples) paramSchema.items.examples.concat(examples)
    else if (paramSchema?.items) paramSchema.items.examples = examples

    schema.properties[param.in].properties[param.name] = {
      ...paramSchema,
      type: paramSchema.type || 'string',
      title: (param.description?.length || 0) < 75 ? param.description : param.name,
      description:
        `${param.deprecated ? '/!\\ Deprecated\n\n' : ''}${(param.description?.length || 0) < 75
          ? `Key: ${param.name}`
          : param.description
        }`,
      disabled: param.deprecated,
    }
  }

  // Transform requestBody
  if (operationSchema.requestBody) {
    const requestBody = operationSchema.requestBody as Record<string, any>
    schema.properties.body.description = requestBody.description || ''
    schema.properties.body.oneOfLayout = { label: 'Select a content type' }
    schema.properties.body.oneOf = []

    for (const contentType of Object.keys(requestBody.content)) {
      const slotsLayout = {
        slots: {
          after: {
            name: 'schema-and-examples',
            props: {
              schema: requestBody.content[contentType].schema,
              examples: resolveExamples(requestBody.content[contentType])
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
          } as Record<string, any>,
          slotsLayout
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

        schema.properties.body.oneOf.push(schemaFormData)
      } else {
        schema.properties.body.oneOf.push({
          title: contentType,
          required: ['body'],
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
      schema.properties.body.default = {
        key: Object.keys(requestBody.content)[0],
        body: ''
      }
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
    }
  }

  return schema
}

/*
 * Resolve the security schemes for a given operation :
 * -> Resolve the global security schemes
 * -> Resolve the operation security schemes
 * -> Merge the two
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

/* Resolve parameters for a given operation :
 * -> Resolve parameters from pathItem and operation
 * -> Merge unique keys based on "name" and "in" fields
 *    (Operation parameters override pathItem parameters)
*/
const resolveParameters = (
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
export const resolveExamples = (object: { example?: string, examples?: Map<string, Record<string, any>> }) => {
  const examples = []
  if (object.example) examples.push(object.example)
  else if (object.examples) {
    for (const example of object.examples.values()) {
      if (example.value) examples.push(example.value)
    }
  }
  return examples
}

// Base VJSF schema
export const endpointQuerySchemaBase = {
  type: 'object',
  properties: {
    header: {
      type: 'object',
      title: 'Headers',
      properties: {} as Record<string, any>,
      required: [] as string[]
    },
    path: {
      type: 'object',
      title: 'Path parameters',
      properties: {} as Record<string, any>,
      required: [] as string[]
    },
    query: {
      type: 'object',
      title: 'Query parameters',
      properties: {} as Record<string, any>,
      required: [] as string[]
    },
    body: {
      type: 'object',
      title: 'Request body',
      description: '',
      oneOfLayout: {} as Record<string, any>,
      oneOf: [] as Record<string, any>[],
      default: {} as Record<string, any>
    }
  }
} as {
  type: 'object'
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
    default: Record<string, any>
  }>
}
