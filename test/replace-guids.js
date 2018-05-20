const path = require('path')
const tmp = require('tmp-promise')
const fs = require('fs-extra')

const chai = require('chai')
const chaiFiles = require('chai-files')

chai.use(chaiFiles)

const expect = chai.expect
const file = chaiFiles.file
const dir = chaiFiles.dir

const {replaceGuids} = require('../lib')

const VERBOSE = false

describe("replace guids", () => {

    it("replaces guids in a unity prefab file", async function() {
        this.timeout(30000)

        const guidMap = {
            'f5f67c52d1564df4a8936ccd202a3bd8' : 'fffffc52d1564df4a8936ccd202a3bd8',
            '0000000000000000f000000000000000' : 'aaaaa00000000000f000000000000000'
        }

        const resources = path.join(__dirname, '..', 'test_resources')

        const pathRead = path.join(resources, 'example-unity-prefab.prefab')

        const outDir = await tmp.dir()
        const pathWrite = path.join(outDir.path, 'example-unity-prefab-result.prefab')

        const result = await replaceGuids({
            path_source: pathRead,
            path_target: pathWrite,
            guid_map: guidMap
        })

        const pathReadExpected = path.join(resources, 'example-unity-prefab_w_guids_replaced.prefab')

        expect(file(pathReadExpected),
            "result prefab file should have guids specified in map replaced"
        ).to.equal(file(pathWrite))
    })

})
