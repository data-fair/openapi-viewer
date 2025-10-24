/* https://swagger.io/docs/specification/v3_0/serialization */
import type { Parameter } from '~/utils/transform'

/**
 * Serialize query parameters according to OpenAPI 3.0 specification
 *
 * https://swagger.io/docs/specification/v3_0/serialization
 * @param params - Object containing parameter name and values
 * @param paramSpecs - Array of parameter specifications with style and explode properties
 * @returns URLSearchParams object with properly serialized parameters
 */
export const serializeQueryParams = (params: Record<string, any>, parameters: Parameter[]): URLSearchParams => {
  const searchParams = new URLSearchParams()

  // For each query params
  for (const [name, value] of Object.entries(params)) {
    if (value === undefined) continue

    // Find parameter specification
    const paramSpec = parameters.find(p => p.name === name && p.in === 'query')
    const style = paramSpec?.style || 'form'
    const explode = paramSpec?.explode !== undefined ? paramSpec.explode : style === 'form'

    // Handle different value types
    if (Array.isArray(value)) {
      const serializedValue = serializeArrayValue(value, style, explode, name, searchParams)
      if (serializedValue && (!explode || (style === 'spaceDelimited' || style === 'pipeDelimited'))) {
        searchParams.set(name, serializedValue)
      }
    } else if (typeof value === 'object' && value !== null) {
      const serializedValue = serializeObjectValue(value, style, explode, name, searchParams)
      if (serializedValue && (!explode || style === 'deepObject')) {
        searchParams.set(name, serializedValue)
      }
    } else {
      // Primitive value
      searchParams.set(name, String(value))
    }
  }

  return searchParams
}

/**
 * Serialize array values according to style and explode settings
 */
const serializeArrayValue = (value: any[], style: string, explode: boolean, name: string, searchParams: URLSearchParams): string => {
  if (value.length === 0) return ''

  switch (style) {
    case 'form':
      if (explode) {
        // /users?id=3&id=4&id=5
        value.forEach(item => searchParams.append(name, String(item)))
        return '' // Already added to searchParams
      } else {
        // /users?id=3,4,5
        return value.map(String).join(',')
      }

    case 'spaceDelimited':
      if (explode) {
        // /users?id=3&id=4&id=5
        value.forEach(item => searchParams.append(name, String(item)))
        return ''
      } else {
        // /users?id=3%204%205 (space-separated, URL encoded)
        return value.map(String).join(' ')
      }

    case 'pipeDelimited':
      if (explode) {
        // /users?id=3&id=4&id=5
        value.forEach(item => searchParams.append(name, String(item)))
        return ''
      } else {
        // /users?id=3|4|5
        return value.map(String).join('|')
      }

    case 'deepObject':
      // Not applicable for arrays in the standard
      return value.map(String).join(',')

    default:
      return value.map(String).join(',')
  }
}

/**
 * Serialize object values according to style and explode settings
 */
const serializeObjectValue = (value: Record<string, any>, style: string, explode: boolean, name: string, searchParams: URLSearchParams): string => {
  const entries = Object.entries(value).filter(([, v]) => v !== undefined && v !== null)
  if (entries.length === 0) return ''

  switch (style) {
    case 'form':
      if (explode) {
        // /users?role=admin&firstName=Alex
        entries.forEach(([key, val]) => searchParams.set(key, String(val)))
        return ''
      } else {
        // /users?id=role,admin,firstName,Alex
        return entries.flatMap(([key, val]) => [key, String(val)]).join(',')
      }

    case 'deepObject':
      if (explode) {
        // /users?id[role]=admin&id[firstName]=Alex
        entries.forEach(([key, val]) => searchParams.set(`${name}[${key}]`, String(val)))
        return ''
      } else {
        // deepObject with explode: false is not well-defined in the spec
        return entries.flatMap(([key, val]) => [key, String(val)]).join(',')
      }

    case 'spaceDelimited':
    case 'pipeDelimited':
      // Not applicable for objects
      return entries.flatMap(([key, val]) => [key, String(val)]).join(',')

    default:
      return entries.flatMap(([key, val]) => [key, String(val)]).join(',')
  }
}
