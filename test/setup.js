import sinon from 'sinon'
import chai from 'chai'
import db from '../src/db'

global.expect = chai.expect
global.sinon = sinon.sandbox.create()

afterEach(() => {
  for (var i in db.connection.collections) {
    db.connection.collections[i].remove(() => { })
  }

  global.sinon.restore()
})
