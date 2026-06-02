import { test, expect } from '@playwright/test'
import { serializeQueryParams } from '../ui/src/utils/serialize.ts'

const qp = (name: string, extra: Record<string, any> = {}) =>
  ([{ name, in: 'query', ...extra }] as any)

test.describe('serializeQueryParams — primitives', () => {
  test('serialise une valeur primitive simple', () => {
    const sp = serializeQueryParams({ limit: 10 }, qp('limit'))
    expect(sp.get('limit')).toBe('10')
  })

  test('ignore les valeurs undefined', () => {
    const sp = serializeQueryParams({ a: undefined, b: 'x' }, [...qp('a'), ...qp('b')])
    expect(sp.has('a')).toBe(false)
    expect(sp.get('b')).toBe('x')
  })

  test('sérialise les booléens en chaîne', () => {
    const sp = serializeQueryParams({ active: false }, qp('active'))
    expect(sp.get('active')).toBe('false')
  })
})

test.describe('serializeQueryParams — tableaux', () => {
  test('form + explode (défaut) répète la clé', () => {
    const sp = serializeQueryParams({ id: [3, 4, 5] }, qp('id'))
    expect(sp.getAll('id')).toEqual(['3', '4', '5'])
  })

  test('form + explode:false joint par des virgules', () => {
    const sp = serializeQueryParams({ id: [3, 4, 5] }, qp('id', { explode: false }))
    expect(sp.get('id')).toBe('3,4,5')
  })

  test('spaceDelimited + explode:false joint par des espaces', () => {
    const sp = serializeQueryParams({ id: [3, 4, 5] }, qp('id', { style: 'spaceDelimited', explode: false }))
    expect(sp.get('id')).toBe('3 4 5')
    expect(sp.toString()).toBe('id=3+4+5')
  })

  test('pipeDelimited + explode:false joint par des pipes', () => {
    const sp = serializeQueryParams({ id: [3, 4, 5] }, qp('id', { style: 'pipeDelimited', explode: false }))
    expect(sp.get('id')).toBe('3|4|5')
  })

  test('un tableau vide ne produit pas de paramètre', () => {
    const sp = serializeQueryParams({ id: [] }, qp('id', { explode: false }))
    expect(sp.has('id')).toBe(false)
  })
})

test.describe('serializeQueryParams — objets', () => {
  test('form + explode (défaut) éclate les clés au niveau racine', () => {
    const sp = serializeQueryParams({ filter: { role: 'admin', firstName: 'Alex' } }, qp('filter'))
    expect(sp.get('role')).toBe('admin')
    expect(sp.get('firstName')).toBe('Alex')
  })

  test('form + explode:false aplati clés/valeurs en virgules', () => {
    const sp = serializeQueryParams({ filter: { role: 'admin', firstName: 'Alex' } }, qp('filter', { explode: false }))
    expect(sp.get('filter')).toBe('role,admin,firstName,Alex')
  })

  test('deepObject + explode utilise la notation name[key]', () => {
    const sp = serializeQueryParams({ filter: { role: 'admin' } }, qp('filter', { style: 'deepObject', explode: true }))
    expect(sp.get('filter[role]')).toBe('admin')
  })

  test('ignore les valeurs null/undefined dans un objet', () => {
    const sp = serializeQueryParams({ filter: { a: 'x', b: null, c: undefined } }, qp('filter'))
    expect(sp.get('a')).toBe('x')
    expect(sp.has('b')).toBe(false)
    expect(sp.has('c')).toBe(false)
  })
})

test.describe('serializeQueryParams — caractères réservés', () => {
  test('encode les caractères réservés via URLSearchParams', () => {
    const sp = serializeQueryParams({ q: 'a b&c' }, qp('q'))
    expect(sp.get('q')).toBe('a b&c')
    expect(sp.toString()).toBe('q=a+b%26c')
  })
})
