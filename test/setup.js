import sinon from 'sinon'
import chai from 'chai'

global.expect = chai.expect
global.sinon = sinon.sandbox.create()

afterEach(() => {
  global.sinon.restore()
})
