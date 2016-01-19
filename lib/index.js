'use strict'

const url = require('url')
const postcss = require('postcss')

/**
 * Construct the Google Font URL.
 * @param {String} family - The font family.
 * @param {String} styles - The font styles separated by comma.
 * @param {String} subset - The subset separated by comma
 * @returns {String}
 */
function getGoogleUrl(family, styles, subset) {
  const font = `${family}:${styles}`
  const query = {
    family: font
  }

  if (subset) {
    query.subset = subset
  }

  /**
   * Decode the URL for human readability and follow
   * the Google Font url examples.
   */
  return decodeURIComponent(url.format({
    protocol: 'https',
    slashes: true,
    hostname: 'fonts.googleapis.com',
    pathname: 'css',
    query: query
  }))
}

/**
 * Normalize the font family string. Remove the quotes and
 * replace the spaces with + sign.
 * @param {String} font
 * @returns {String}
 */
function normalizeFontFamily(font) {
  return font.replace(/(\'|\")/g, '').replace(' ', '+')
}

/**
 * Return the parameters from rule as an array.
 * @param {Rule} rule - The rule.
 * @returns {String[]}
 */
function getParams(rule) {
  const params = postcss.list.space(rule.params)

  params[0] = normalizeFontFamily(params[0])

  return params
}

module.exports = postcss.plugin('postcss-google-font', function (opts) {
  opts = opts || {}

  return function (css, result) {
    css.walkAtRules((rule)=> {
      if (rule.name === 'google-font') {
        const params = getParams(rule)
        const googleFontUrl = getGoogleUrl(...params)
        const importRule = postcss.atRule({
          name: 'import',
          params: `url(${googleFontUrl})`
        })

        rule.replaceWith(importRule)
      }
    })
  }
})