import type { SchemaObject } from 'ajv'
import clone from '@data-fair/lib-utils/clone'

/**
 * Partially resolve a openapi doc schema but not recursively.
 */
export function partialResolveRefs (schema: SchemaObject, schemaId: string, getJSONRef: (schemaId: string, ref: string) => [any, string, string]) {
  let clonedSchema = null
  if (schema.allOf) {
    for (let i = 0; i < schema.allOf.length; i++) {
      if (schema.allOf[i].$ref) {
        const [refFragment] = getJSONRef(schemaId, schema.allOf[i].$ref)
        clonedSchema = clonedSchema ?? clone(schema)
        clonedSchema.allOf[i] = { ...refFragment, ...schema.allOf[i] }
      }
    }
  }

  return clonedSchema ?? schema
}
