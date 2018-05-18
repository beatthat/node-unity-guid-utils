const path = require('path')
const tmp = require('tmp-promise')
const fs = require('fs-extra-promise')

const chai = require('chai')
const chaiFiles = require('chai-files')

chai.use(chaiFiles)

const expect = chai.expect
const file = chaiFiles.file
const dir = chaiFiles.dir

const {syncMissingMetaFiles} = require('../lib')

const VERBOSE = true

const writeMetaFiles = async (tgtPath, dirContents) => {

    await fs.mkdirAsync(tgtPath)
    dirContents.files.forEach(async (n) => {
      await fs.writeFileAsync(path.join(tgtPath, n.name),
      JSON.stringify(n, null, 2))
    })
}

describe.only("sync missing meta files", () => {

    it("copies meta files recursively from a source path to a target path, skipping target paths that already exist", async function() {
        const filesAtTargetPath = {
          files: [
              {
                name: 'f1.meta',
                guid: 'f1tgt',
                otherprop: 'f1tgtpropval'
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
              moreprops: 'f1srcval'
            },
            {
              name: 'f2.meta',
              guid: 'f2src',
              evenmoreprops: 'f2srcval'
            }
          ]

        }

        const tmpDir = await tmp.dir()

        const sourcePath = path.join(tmpDir.path, 'copy_from')
        const targetPath = path.join(tmpDir.path, 'copy_to')

        await writeMetaFiles(sourcePath, filesAtSourcePath)
        await writeMetaFiles(targetPath, filesAtTargetPath)

        syncMissingMetaFiles({
          path_source: sourcePath,
          path_target: targetPath,
          verbose: VERBOSE
        })

        const f1Path = path.join(targetPath, 'f1.meta')
        const f1Content = filesAtTargetPath.files.find(c => c.name = 'f1.meta')

        expect(await fs.readFileAsync(f1Path, 'utf8'),
            "file f1.meta existed at target and should be left unchanged"
        ).to.equal(JSON.stringify(f1Content, null, 2))

        const f2Path = path.join(targetPath, 'f2.meta')
        const f2Content = filesAtSourcePath.files.find(c => c.name = 'f1.meta')

        expect(await fs.readFileAsync(f2Path, 'utf8'),
            "file f2.meta DID NOT exist at and should be copied from source"
        ).to.equal(JSON.stringify(f2Content, null, 2))
    })


})
