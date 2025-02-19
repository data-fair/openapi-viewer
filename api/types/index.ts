export type * from './OpenAPISpecs/index.ts'

// Type de sortie de VJSF
export type GenericEndpointQuery = {
  header?: Record<string, string>,
  path?: Record<string, string>,
  query?: Record<string, string>,
  body?: any
}
