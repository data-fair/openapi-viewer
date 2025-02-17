import type { Components, OpenAPISpecs, Operation, Parameter as ParameterSpec, ParameterOrReference, PathItem } from '#api/types'
import { resolveLocaleRefs } from '@json-layout/core'
import clone from '@data-fair/lib-utils/clone'
import Ajv from 'ajv'

const ajv = new Ajv()

let getJSONRef: ((schemaId: string, ref: string) => [any, string, string]) | undefined
let globalSchema: OpenAPISpecs | undefined

type Parameter = ParameterSpec & {
  in: 'query' | 'header' | 'path' | 'cookie'
  name: string
  description?: string
  examples?: Map<string, Record<string, any>>
  example?: any
  schema?: Record<string, any>
}

export const initTransformer = (schema: OpenAPISpecs) => {
  schema.$id = 'openapi'
  getJSONRef = resolveLocaleRefs(schema, ajv)
  globalSchema = schema
}

export const getVJSFSchema = (operationSchema: Operation, pathItemParameters: PathItem['parameters']) => {
  if (!getJSONRef || !globalSchema) return endpointQuerySchemaBase
  const schema = clone(endpointQuerySchemaBase)

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
      title: (sec.description?.length || 0) < 50 ? sec.description : sec.name,
      description: `Type: ${sec.type}\n\n${sec.description}${(sec.description?.length || 0) < 50 ? `\n\nKey: ${sec.name}` : ''}`,
    }
  }

  // Transform parameters
  const parameters = resolveParameters(pathItemParameters, operationSchema.parameters)
  for (const param of parameters) {
    if (param.in === 'cookie') continue
    const paramSchema = param.schema as Record<string, any>
    if (!paramSchema) continue // Parameters should have a content key or schema key. // TODO: Content isn't supported yet
    resolveExamples(param)
    schema.properties[param.in].properties[param.name] = {
      ...paramSchema,
      type: paramSchema.type || 'string',
      title: (param.description?.length || 0) < 50 ? param.description : param.name,
      description: `${param.deprecated ? '/!\\ Deprecated' : ''}\n\n${param.description}${(param.description?.length || 0) < 50 ? `\n\nKey: ${param.name}` : ''}`,
      disabled: param.deprecated,
    }
  }

  // Setup requerds fields for vjsf
  schema.properties.header.required = parameters.filter(param => param.in === 'header' && param.required).map(param => param.name)
  schema.properties.query.required = parameters.filter(param => param.in === 'query' && param.required).map(param => param.name)
  schema.properties.path.required = parameters.filter(param => param.in === 'path').map(param => param.name) // All path parameters are required

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
  pathItemParameters: PathItem['parameters'],
  operationParameters: Operation['parameters']
) => {
  const resolveRefsParameters = (parameters: ParameterOrReference[] = []) => {
    return parameters.reduce((map, param) => {
      if (param.$ref && getJSONRef) param = { ...getJSONRef('openapi', param.$ref as string)[0], ...param }
      if (param.name && param.in) {
        map.set(`${param.name}|${param.in}`, param as Parameter)
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
const resolveExamples = (parameter: Parameter) => {
  const examples = []
  if (parameter.example) examples.push(parameter.example)
  else if (parameter.examples) {
    for (const example of parameter.examples.values()) {
      if (example.$ref && getJSONRef) examples.push(getJSONRef('openapi', example.$ref)[0])
      else if (example.value) examples.push(example.value)
    }
  }
  if (parameter.schema?.examples) parameter.schema.examples.push(examples)
  else if (parameter.schema?.items?.examples) parameter.schema.items.examples.push(examples)
  else if (parameter.schema?.items) parameter.schema.items.examples = examples
  else parameter.schema = examples
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
      properties: {} as Record<string, any>,
      required: [] as string[]
    }
  }
}
