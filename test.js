'use strict'

const test = require('tape')
const nock = require('nock')
const path = require('path')
const fs = require('fs')
const plugin = require('.')

const FIXTURE_V2_PATH = path.join(__dirname, 'v2-task-metadata-fixture.json')
const FIXTURE_V2 = JSON.parse(fs.readFileSync(FIXTURE_V2_PATH, 'utf8'))

const FIXTURE_V3_PATH = path.join(__dirname, 'v3-task-metadata-fixture.json')
const FIXTURE_V3 = JSON.parse(fs.readFileSync(FIXTURE_V3_PATH, 'utf8'))

test('v2', function (t) {
  t.plan(3)

  const processor = plugin({ version: 2 })
  const metric = { tags: { existing: '1' } }

  nock(processor._endpoint)
    .get('/metadata').reply(function () {
      t.pass('got /metadata request')
      return [200, FIXTURE_V2]
    })

  processor.start((err) => {
    t.ifError(err, 'no start error')

    processor.on('metric', (metric) => {
      t.same(metric, {
        tags: {
          existing: '1',
          cluster: 'default',
          region: 'us-west-1'

          // Yet to do
          // name: 'nginx-curl',
          // image: 'nrdlngr/nginx-curl'
        }
      })
    })

    processor.process(metric)
  })
})

test('v3', function (t) {
  t.plan(4)

  const processor = plugin({ version: 3, endpoint: 'http://localhost' })
  const metric = { tags: { existing: '1' } }

  nock(processor._endpoint)
    .get('/task').reply(function () {
      t.pass('got /task request')
      return [200, FIXTURE_V3]
    })
    .get('/').reply(function () {
      t.pass('got / request')
      return [200, FIXTURE_V3.Containers[1]]
    })

  processor.start((err) => {
    t.ifError(err, 'no start error')

    processor.on('metric', (metric) => {
      t.same(metric, {
        tags: {
          existing: '1',
          cluster: 'default',
          region: 'us-west-2',
          name: 'nginx-curl',
          image: 'nrdlngr/nginx-curl'
        }
      })
    })

    processor.process(metric)
  })
})
