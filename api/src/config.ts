import type { ApiConfig } from '../config/type/index.ts'
import { assertValid } from '../config/type/index.ts'
import config from 'config'

// we reload the config instead of using the singleton from the config module for testing purposes
const apiConfig = process.env.NODE_ENV === 'test' ? config.util.loadFileConfigs(process.env.NODE_CONFIG_DIR, { skipConfigSources: true }) : config
assertValid(apiConfig, { lang: 'en', name: 'config', internal: true })

export default apiConfig as ApiConfig

export const uiConfig = {
  defaultUrl: apiConfig.defaultUrl,
  allowedUrls: apiConfig.allowedUrls,
  useSimpleDirectory: apiConfig.useSimpleDirectory
}
export type UiConfig = typeof uiConfig

// site theme and public info served by simple-directory, absent in standalone mode
// the hash placeholders are filled by createSpaMiddleware (privateDirectoryUrl option)
export const siteResourcesHtml = apiConfig.useSimpleDirectory
  ? `<link href="{SITE_PATH}/simple-directory/api/sites/{THEME_CSS_HASH}_theme.css" rel="stylesheet">
    <script src="{SITE_PATH}/simple-directory/api/sites/{PUBLIC_SITE_INFO_HASH}_public.js"></script>`
  : ''
