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

describe.only("sync missing meta files", () => {

    it("copies meta files recursively from a source path to a target pass, skipping target paths that already exist", async function() {
        expect(true).to.equal(false)
    })


})
