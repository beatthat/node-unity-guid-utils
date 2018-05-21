const path = require('path')
const tmp = require('tmp-promise')
const fs = require('fs-extra')

const chai = require('chai')
const chaiFiles = require('chai-files')

chai.use(chaiFiles)

const expect = chai.expect
const file = chaiFiles.file
const dir = chaiFiles.dir

const {mergeMetaFiles} = require('../lib')
const {writeJsonFiles} = require('./test_helpers')

const VERBOSE = true

const filesAtTargetPath = {
  files: [
      {
        name: 'f1.meta',
        guid: 'f1tgt',
        targetOnlyProp: 'f1tgtpropval',
        commonProp: 'targetValOfCommonProp'
      },
      {
        name: 'f3.meta',
        guid: 'f3tgt',
        otherpropmore: 'f3tgtpropval'
      }
  ]
}

const filesAtSourcePath = {
  files: [
    {
      name: 'f1.meta',
      guid: 'f1src',
      sourceOnlyProp: 'f1srcval',
      commonProp: 'sourceValOfCommonProp'
    },
    {
      name: 'f2.meta',
      guid: 'f2src',
      evenmoreprops: 'f2srcval'
    },
    {
      name: 'f4.json',
      guid: 'imagine this were any non meta file. It should be ignored and not copied from source to target ',
      evenmoreprops: 'f4srcval'
    }
  ]
}

var sourcePath = null;
var targetPath = null;

describe("merge meta files", () => {

    beforeEach(async function() {
      const tmpDir = await tmp.dir()

      sourcePath = path.join(tmpDir.path, 'copy_from')
      targetPath = path.join(tmpDir.path, 'copy_to')

      await writeJsonFiles(sourcePath, filesAtSourcePath)
      await writeJsonFiles(targetPath, filesAtTargetPath)
    })

    it("recursively copies .meta files from a source path to a target path when no file exists at target path", async function() {

      await mergeMetaFiles({
        path_source: sourcePath,
        path_target: targetPath
      })

      const f2Path = path.join(targetPath, 'f2.meta')

      expect(await fs.exists(f2Path),
          `${f2Path} DID NOT exist under target path and should be copied from source`
      ).to.equal(true)

      const f2Content = filesAtSourcePath.files.find(c => c.name === 'f2.meta')
    })

    it(`preserves the guid of existing meta files under the target path,
      otherwise replacing the target with the source`, async function() {

      await mergeMetaFiles({
        path_source: sourcePath,
        path_target: targetPath
      })

      const f1SourcePath = path.join(sourcePath, 'f1.meta')
      f1SourceContent = filesAtSourcePath.files.find(c => c.name === 'f1.meta')

      const f1TargetPath = path.join(targetPath, 'f1.meta')
      f1TargetContent = filesAtTargetPath.files.find(c => c.name === 'f1.meta')

      expect(await fs.readFile(f1TargetPath, 'utf8'),
          `${f1TargetPath}
          existed under both source *AND* target.
          The merged result at target should retain the target's guid
          but otherwise all properties common to source and target should be merged
          with preference for the source file's value of each property.`
      ).to.equal(JSON.stringify({
        ...f1TargetContent,
        ...f1SourceContent,
        guid: f1TargetContent.guid
      }, null, 2))

    })

})
