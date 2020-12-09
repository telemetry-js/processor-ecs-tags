'use strict'

const EventEmitter = require('events').EventEmitter
const request = require('request')

module.exports = function plugin (options) {
  return new Processor(options)
}

class Processor extends EventEmitter {
  constructor (options) {
    if (!options) options = {}
    super()

    let endpoint = options.endpoint || process.env.ECS_CONTAINER_METADATA_URI || ''
    if (endpoint.endsWith('/')) endpoint = endpoint.slice(0, -1)

    if (options.version === 2) {
      endpoint = endpoint || 'http://169.254.170.2/v2'
      this._fetch = this._fetchV2.bind(this)
    } else if (options.version === 3) {
      if (!endpoint) {
        throw new Error('The "endpoint" option or ECS_CONTAINER_METADATA_URI is required')
      }

      this._fetch = this._fetchV3.bind(this)
    } else {
      throw new Error('The "version" option must be one of 2, 3')
    }

    this._endpoint = endpoint
    this._tags = null
  }

  start (callback) {
    this._fetch((err, tags) => {
      if (err) return callback(err)

      this._tags = tags
      callback()
    })
  }

  stop (callback) {
    this._tags = null
    process.nextTick(callback)
  }

  process (metric) {
    for (const k in this._tags) {
      metric.tags[k] = this._tags[k]
    }

    this.emit('metric', metric)
  }

  _fetchV2 (callback) {
    // https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-metadata-endpoint-v2.html
    // Fetch Task Metadata
    request(`${this._endpoint}/metadata`, { json: true }, (err, res, body) => {
      if (err) return callback(err)

      if (res.statusCode < 200 || res.statusCode > 299) {
        return callback(new Error(`HTTP ${res.statusCode}`))
      }

      const tags = {
        cluster: body.Cluster,
        region: extractRegionFromArn(body.TaskARN)
      }

      // TODO (!!): where can we get 'name' and 'image' from?
      callback(null, tags)
    })
  }

  _fetchV3 (callback) {
    // https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-metadata-endpoint-v3.html#task-metadata-endpoint-v3-response
    // Fetch Task Metadata
    request(`${this._endpoint}/task`, { json: true }, (err, res, body) => {
      if (err) return callback(err)

      if (res.statusCode < 200 || res.statusCode > 299) {
        return callback(new Error(`HTTP ${res.statusCode}`))
      }

      const tags = {
        cluster: body.Cluster,
        region: extractRegionFromArn(body.TaskARN)
      }

      // Fetch metadata JSON for the container
      request(`${this._endpoint}`, { json: true }, (err, res, body) => {
        if (err) return callback(err)

        if (res.statusCode < 200 || res.statusCode > 299) {
          return callback(new Error(`HTTP ${res.statusCode}`))
        }

        // TODO (!): remove once tested in ECS
        console.error('processor-ecs-tags: metadata JSON for the container')
        console.error(require('util').inspect(body, { depth: null }))

        tags.name = body.Name
        tags.image = body.Image

        callback(null, tags)
      })
    })
  }
}

function extractRegionFromArn (arn) {
  if (typeof arn !== 'string') {
    throw new TypeError('The "arn" argument must be a string')
  }

  const region = arn.split(':')[3]

  if (!arn.startsWith('arn:aws:ecs:') || !region) {
    throw new Error('Unexpected ARN format: ' + arn)
  }

  return region
}
