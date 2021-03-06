'use strict'

var test = require('tap').test
var helper = require('../../lib/agent_helper')
var params = require('../../lib/params')
var semver = require('semver')


test("agent instrumentation of MongoDB when GridFS is used",
  {skip: semver.satisfies(process.version, '0.8 || >= 7.0.0')},
  function(t) {
  helper.bootstrapMongoDB([], function cb_bootstrapMongoDB(err) {
    if (err) {
      t.fail(err)
      return t.end()
    }

    var agent = helper.instrumentMockedAgent()
    helper.runInTransaction(agent, function() {
      var mongodb = require('mongodb')

      var host = 'mongodb://' + params.mongodb_host + ':' + params.mongodb_port + '/noexist'
      mongodb.connect(host, function(err, db) {
        if (err) {
          t.fail(err)
          return t.end()
        }
        t.ok(db, "got MongoDB connection")

        t.tearDown(function cb_tearDown() {
          db.close()
        })

        var GridStore = mongodb.GridStore
        var gs = new GridStore(db, 'RandomFileName' + Math.random(), 'w')


        gs.open(function cb_open(err, gridfile) {
          if (err) {
            t.fail(err)
            return t.end()
          }
          t.ok(gridfile, "actually got file")

          t.end()
        })
      })
    })
  })
})
