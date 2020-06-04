// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
require('../spec_helper')

const Promise = require('bluebird')
const pkg = require('@packages/root')
const fs = require(`${root}lib/util/fs`)
const mockedEnv = require('mocked-env')
const {
  app,
} = require('electron')

const setEnv = (env) => {
  process.env['CYPRESS_INTERNAL_ENV'] = env

  return expectedEnv(env)
}

const expectedEnv = function (env) {
  require(`${root}lib/environment`)

  expect(process.env['CYPRESS_INTERNAL_ENV']).to.eq(env)
}

const setPkg = (env) => {
  pkg.env = env

  return expectedEnv(env)
}

const env = process.env['CYPRESS_INTERNAL_ENV']

describe('lib/environment', () => {
  beforeEach(() => {
    sinon.stub(Promise, 'config')
    delete process.env['CYPRESS_INTERNAL_ENV']

    return delete require.cache[require.resolve(`${root}lib/environment`)]
  })

  afterEach(() => {
    delete require.cache[require.resolve(`${root}lib/environment`)]

    return delete process.env['CYPRESS_INTERNAL_ENV']
  })

  after(() => {
    return process.env['CYPRESS_INTERNAL_ENV'] = env
  })

  context('parses ELECTRON_EXTRA_LAUNCH_ARGS', () => {
    let restore = null

    beforeEach(() => {
      return restore = mockedEnv({
        ELECTRON_EXTRA_LAUNCH_ARGS: '--foo --bar=baz --quux=true',
      })
    })

    it('sets launch args', () => {
      sinon.stub(app.commandLine, 'appendArgument')
      require(`${root}lib/environment`)
      expect(app.commandLine.appendArgument).to.have.been.calledWith('--foo')
      expect(app.commandLine.appendArgument).to.have.been.calledWith('--bar=baz')

      expect(app.commandLine.appendArgument).to.have.been.calledWith('--quux=true')
    })

    return afterEach(() => {
      return restore()
    })
  })

  context('#existing process.env.CYPRESS_INTERNAL_ENV', () => {
    it('is production', () => {
      return setEnv('production')
    })

    it('is development', () => {
      return setEnv('development')
    })

    it('is staging', () => {
      return setEnv('staging')
    })
  })

  context('uses package.json env', () => {
    afterEach(() => {
      return delete pkg.env
    })

    it('is production', () => {
      return setPkg('production')
    })

    it('is staging', () => {
      return setPkg('staging')
    })

    it('is test', () => {
      return setPkg('test')
    })
  })

  context('it uses development by default', () => {
    beforeEach(() => {
      return sinon.stub(fs, 'readJsonSync').returns({})
    })

    it('is development', () => {
      return expectedEnv('development')
    })
  })
})