/**
 * @param {string} key
 */
const jsonEnv = (key) => ({ __name: key, __format: 'json' })

module.exports = {
  port: 'PORT',
  allowProxy: jsonEnv('ALLOW_PROXY')
}
