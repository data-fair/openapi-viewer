import { resolve } from 'node:path'
import express from 'express'
import { errorHandler, createSiteMiddleware, createSpaMiddleware } from '@data-fair/lib-express'
import config, { uiConfig } from '#config'

export const app = express()

// no fancy embedded arrays, just string and arrays of strings in req.query
app.set('query parser', 'simple')
app.use(createSiteMiddleware('openapi-viewer', { prefixOptional: true, neverInternal: true }))

app.set('json spaces', 2)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (config.serveUi) {
  app.use(await createSpaMiddleware(resolve(import.meta.dirname, '../../ui/dist'), uiConfig))
}

app.use(errorHandler)
