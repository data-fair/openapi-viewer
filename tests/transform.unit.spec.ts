import { test, expect } from '@playwright/test'
import { getVJSFSchema, initTransformer } from '../ui/src/utils/transform.ts'

const specs = (security: any[], operationSecurity?: any[]) => ({
  openapi: '3.1.0',
  info: { title: 'test', version: '1' },
  components: {
    securitySchemes: {
      apiKey: { type: 'apiKey', in: 'header', name: 'x-apiKey' },
      queryKey: { type: 'apiKey', in: 'query', name: 'key' },
      sdCookie: { type: 'apiKey', in: 'cookie', name: 'id_token' },
      oauth2: { type: 'oauth2', flows: { clientCredentials: { tokenUrl: 'https://example.com/token', scopes: { read: 'Read' } } } },
      bearer: { type: 'http', scheme: 'bearer' },
      oidc: { type: 'openIdConnect', openIdConnectUrl: 'https://example.com/.well-known/openid-configuration' }
    }
  },
  security,
  paths: {}
}) as any

test.describe('getVJSFSchema — security schemes', () => {
  test('ignores schemes without a header/query location instead of crashing', () => {
    initTransformer(specs([{ apiKey: [] }, { sdCookie: [] }]))
    const schema = getVJSFSchema({
      security: [{ oauth2: ['read'] }, { bearer: [] }, { oidc: [] }, { sdCookie: [] }]
    } as any, [])
    expect(Object.keys(schema.properties.header.properties)).toEqual(['x-apiKey'])
    expect(schema.properties.query).toBeUndefined()
  })

  test('reads every scheme of a combined requirement', () => {
    initTransformer(specs([]))
    const schema = getVJSFSchema({ security: [{ apiKey: [], queryKey: [] }, {}] } as any, [])
    expect(Object.keys(schema.properties.header.properties)).toEqual(['x-apiKey'])
    expect(Object.keys(schema.properties.query.properties)).toEqual(['key'])
  })
})

test.describe('getVJSFSchema — parameters', () => {
  test('skips parameters with a cookie, body or unknown location', () => {
    initTransformer(specs([]))
    const schema = getVJSFSchema({
      parameters: [
        { name: 'size', in: 'query', schema: { type: 'integer' } },
        { name: 'session', in: 'cookie', schema: { type: 'string' } },
        { name: 'payload', in: 'body', schema: { type: 'object' } },
        { name: 'weird', in: 'nowhere', schema: { type: 'string' } }
      ]
    } as any, [])
    expect(Object.keys(schema.properties.query.properties)).toEqual(['size'])
    expect(schema.properties.header).toBeUndefined()
    expect(schema.properties.path).toBeUndefined()
  })

  test('removes null from parameter enums without mutating the spec', () => {
    initTransformer(specs([]))
    const collapse = { type: 'string', enum: [null, 'nom', 'adresse'] }
    const schema = getVJSFSchema({
      parameters: [
        { name: 'collapse', in: 'query', schema: collapse },
        { name: 'select', in: 'query', schema: { type: 'array', items: { type: 'string', enum: [null, 'nom'] } } }
      ]
    } as any, [])
    expect(schema.properties.query.properties.collapse.enum).toEqual(['nom', 'adresse'])
    expect(schema.properties.query.properties.select.items.enum).toEqual(['nom'])
    expect(collapse.enum).toEqual([null, 'nom', 'adresse'])
  })
})
