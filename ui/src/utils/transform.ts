import type { Components, OpenAPISpecs, Operation } from '#api/types'
import { resolveLocaleRefs } from '@json-layout/core'
import Ajv from 'ajv'

const ajv = new Ajv()

let getJSONRef: ((schemaId: string, ref: string) => [any, string, string]) | undefined
let globalSchema: OpenAPISpecs | undefined

export const initTransformer = (schema: OpenAPISpecs) => {
  schema.$id = 'openapi'
  // getJSONRef = resolveLocaleRefs(schema, ajv)
  globalSchema = schema
}

export const getVJSFSchema = (operationSchema: Operation) => {
  if (!getJSONRef || !globalSchema) return

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

  // Transform parameters
  // for (const param of operationSchema.parameters || []) {
  //   if (param.$ref) param = { ...param, ...getJSONRef('openapi', param.$ref) }
  //   console.log(param)
  // }

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
      properties: {} as Record<string, any>
    },
    path: {
      type: 'object',
      title: 'Path parameters',
      properties: {} as Record<string, any>
    },
    query: {
      type: 'object',
      title: 'Query parameters',
      properties: {} as Record<string, any>
    },
    body: {
      type: 'object',
      title: 'Body',
      properties: {} as Record<string, any>
    }
  }
}
