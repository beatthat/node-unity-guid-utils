const path = require('path')
const tmp = require('tmp-promise')
const fs = require('fs-extra')
const YAML = require('yamljs')

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

const fileContent = {
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
        name: 'f3.cs',
        guid: 'f5f67c52d1564df4a8936ccd202a3bd8',
        commonProp: 'ignore me, a cs file'
      }
  ]
}

const fileContentExpectedAfterReplaceGuid = {
  files: [
      {
        name: 'f1.unity',
        m_Script: {fileID: -765806418, guid: 'fffffc52d1564df4a8936ccd202a3bd8', type: 3},
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
        m_Script: {fileID: -765806418, guid: 'aaaaa00000000000f000000000000000', type: 3},
        otherpropmore: 'f3tgtpropval'
      },
      {
        name: 'f2.prefab.meta',
        guid: 'f5f67c52d1564df4a8936ccd202a3bd8',
        commonProp: 'ignore me, a xxx.prefab.meta file'
      },
      {
        name: 'f3.cs',
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

      await writeJsonFiles(targetPath, fileContent)
    })

    it("replaces guids in a single (real-example) unity prefab file", async function() {
        this.timeout(30000)

        const resources = path.join(__dirname, '..', 'test_resources')

        const pathCopyFrom = path.join(resources, 'example-unity-prefab.prefab')

        const outDir = await tmp.dir()

        const pathTest = path.join(outDir.path, 'example-unity-prefab-result.prefab')

        await fs.copy(pathCopyFrom, pathTest)

        await replaceGuids({
            path: pathTest,
            guid_map: guidMap
        })

        const pathReadExpected = path.join(resources, 'example-unity-prefab_w_guids_replaced.prefab')

        expect(file(pathReadExpected),
            "result prefab file should have guids specified in map replaced"
        ).to.equal(file(pathTest))
    })

    it("recursively replaces guids in .unity files", async function() {

      const fnameTest = 'f1.unity'
      const pathTest = path.join(targetPath, fnameTest)
      const contentExpected = fileContentExpectedAfterReplaceGuid.files.find(c => c.name === fnameTest)

      await replaceGuids({
          path: targetPath,
          guid_map: guidMap
      })

      expect((await fs.readFile(pathTest, 'utf8')).trim(),
        `${pathTest} is a .unity file and should have its guids updated`
      ).to.equal(YAML.stringify(contentExpected, null, 2).trim())
    })

    it("recursively replaces guids in .prefab files", async function() {

      const fnameTest = 'f2.prefab'
      const pathTest = path.join(targetPath, fnameTest)
      const contentExpected = fileContentExpectedAfterReplaceGuid.files.find(c => c.name === fnameTest)

      await replaceGuids({
          path: targetPath,
          guid_map: guidMap
      })

      expect((await fs.readFile(pathTest, 'utf8')).trim(),
        `${pathTest} is a .prefab file and should have its guids updated`
      ).to.equal(YAML.stringify(contentExpected, null, 2).trim())
    })

    it("ignores .cs files", async function() {

      const fnameTest = 'f3.cs'
      const pathTest = path.join(targetPath, fnameTest)
      const contentExpected = fileContentExpectedAfterReplaceGuid.files.find(c => c.name === fnameTest)

      await replaceGuids({
          path: targetPath,
          guid_map: guidMap
      })

      expect((await fs.readFile(pathTest, 'utf8')).trim(),
        `${pathTest} is a .cs file and should NOT have its guids updated`
      ).to.equal(YAML.stringify(contentExpected, null, 2).trim())
    })

})
