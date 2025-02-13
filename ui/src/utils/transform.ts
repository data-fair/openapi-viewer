import type { Components, OpenAPISpecs, Operation, Parameter as ParameterSpec, ParameterOrReference, PathItem } from '#api/types'
import { resolveLocaleRefs } from '@json-layout/core'
import Ajv from 'ajv'

const ajv = new Ajv()

let getJSONRef: ((schemaId: string, ref: string) => [any, string, string]) | undefined
let globalSchema: OpenAPISpecs | undefined

type Parameter = ParameterSpec & {
  in: 'query' | 'header' | 'path' | 'cookie'
  name: string
}

export const initTransformer = (schema: OpenAPISpecs) => {
  schema.$id = 'openapi'
  getJSONRef = resolveLocaleRefs(schema, ajv)
  globalSchema = schema
}

export const getVJSFSchema = (operationSchema: Operation, pathItemParameters: PathItem['parameters']) => {
  if (!getJSONRef || !globalSchema) return endpointQuerySchemaBase

  // Transform securities
  const schema = endpointQuerySchemaBase
  const securities = resolveSecurityList(
    globalSchema?.components?.securitySchemes,
    globalSchema?.security,
    operationSchema.security
  )

  for (const [key, sec] of Object.entries(securities)) {
    if (sec.in === 'cookie') continue
    schema.properties[sec.in].properties[key] = {
      type: 'string',
      title: sec.name,
      description: `Type: ${sec.type}\n\n${sec.description}`,
    }
  }

  /* Transform parameters
    - Resolve parameters from pathItem and operation
    - Unique keys based on name and in
    - Operation parameters override pathItem parameters
  */
  const resolveParameters = (parameters: ParameterOrReference[] = []) => {
    return parameters.reduce((map, param) => {
      if (param.$ref && getJSONRef) param = { ...getJSONRef('openapi', param.$ref as string), ...param }
      if (param.name && param.in) {
        map.set(`${param.name}|${param.in}`, param as Parameter)
      }
      return map
    }, new Map<string, Parameter>())
  }
  const paramsMap = new Map([
    ...resolveParameters(pathItemParameters),
    ...resolveParameters(operationSchema.parameters)
  ])
  const params = Array.from(paramsMap.values())

  for (const param of params) {
    if (param.in === 'cookie') continue
    schema.properties[param.in].properties[param.name] = {
      type: 'string',
      title: param.name,
      description: `${param.deprecated ? '/!\\ Deprecated' : ''}\n\n${param.description}`,
    }
  }

  schema.properties.header.required = params.filter(param => param.in === 'header' && param.required).map(param => param.name)
  schema.properties.query.required = params.filter(param => param.in === 'query' && param.required).map(param => param.name)
  schema.properties.path.required = params.filter(param => param.in === 'path').map(param => param.name)

  return schema
}

/*
 * Resolve the security schemes for a given operation :
 * -> Resolve the global security schemes
 * -> Resolve the operation security schemes
 * -> Merge the two
 */
const resolveSecurityList = (
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
      title: 'Body',
      properties: {} as Record<string, any>,
      required: [] as string[]
    }
  }
}
