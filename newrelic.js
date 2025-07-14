'use strict'

exports.config = {
  app_name: ['code_mentor'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
  },
  allow_all_headers: true,
  attributes: {
    enabled: true,
  },
}
