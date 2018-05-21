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
const {writeJsonFiles} = require('./test_helpers')

const VERBOSE = false

const guidMap = {
    'f5f67c52d1564df4a8936ccd202a3bd8' : 'fffffc52d1564df4a8936ccd202a3bd8',
    '0000000000000000f000000000000000' : 'aaaaa00000000000f000000000000000'
}

const filesAtTargetPath = {
  files: [
      {
        name: 'f1.unity',
        m_Script: {fileID: -765806418, guid: 'f5f67c52d1564df4a8936ccd202a3bd8', type: 3},
        targetOnlyProp: 'f1tgtpropval',
        commonProp: 'targetValOfCommonProp'
      },
      {
        name: 'f1.unity.meta',
        guid: 'f5f67c52d1564df4a8936ccd202a3bd8',
        commonProp: 'ignore me, a xxx.unity.meta file'
      },
      {
        name: 'f2.prefab',
        m_Script: {fileID: -765806418, guid: '0000000000000000f000000000000000', type: 3},
        otherpropmore: 'f3tgtpropval'
      },
      {
        name: 'f2.prefab.meta',
        guid: 'f5f67c52d1564df4a8936ccd202a3bd8',
        commonProp: 'ignore me, a xxx.prefab.meta file'
      },
      {
        name: 'f2.cs',
        guid: 'f5f67c52d1564df4a8936ccd202a3bd8',
        commonProp: 'ignore me, a cs file'
      }
  ]
}

var targetPath = null;

describe("replace guids", () => {

    beforeEach(async function() {
      const tmpDir = await tmp.dir()

      targetPath = path.join(tmpDir.path, 'target_dir')

      await writeJsonFiles(targetPath, filesAtTargetPath)
    })

    it("replaces guids in a single (real-example) unity prefab file", async function() {
        this.timeout(30000)

        const resources = path.join(__dirname, '..', 'test_resources')

        const pathCopyFrom = path.join(resources, 'example-unity-prefab.prefab')

        const outDir = await tmp.dir()

        const pathTest = path.join(outDir.path, 'example-unity-prefab-result.prefab')

        await fs.copy(pathCopyFrom, pathTest)

        const result = await replaceGuids({
            path: pathTest,
            guid_map: guidMap
        })

        const pathReadExpected = path.join(resources, 'example-unity-prefab_w_guids_replaced.prefab')

        expect(file(pathReadExpected),
            "result prefab file should have guids specified in map replaced"
        ).to.equal(file(pathTest))
    })

    it.skip("recursively replaces guids in .unity", async function() {


      const f1Path = path.join(targetPath, 'f1.meta')
      const f1Content = filesAtTargetPath.files.find(c => c.name === 'f1.meta')

      expect(await fs.readFile(f1Path, 'utf8'),
        `${f1Path}  existed at target and should be left unchanged`
      ).to.equal(JSON.stringify(f1Content, null, 2))
    })

})
