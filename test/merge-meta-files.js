const path = require('path')
const tmp = require('tmp-promise')
const fs = require('fs-extra-promise')

const chai = require('chai')
const chaiFiles = require('chai-files')

chai.use(chaiFiles)

const expect = chai.expect
const file = chaiFiles.file
const dir = chaiFiles.dir

const {replaceGuids} = require('../lib')

const VERBOSE = false

describe.only("merge meta files", () => {

    it("recursively copies .meta files from a source path to a target path when no file exists at target path", async function() {
        expect(true).to.equal(false)
    })

    it("preserves the guid of existing meta files under the target path, otherwise replacing the target with the source", async function() {
        expect(true).to.equal(false)
    })

})
