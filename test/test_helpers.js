const fs = require('fs-extra')
const path = require('path')
const YAML = require('yamljs')

const writeJsonFiles = async (tgtPath, dirContents) => {
    await fs.mkdir(tgtPath)
    dirContents.files.forEach(async (n) => {
      await fs.writeFile(path.join(tgtPath, n.name),
      YAML.stringify(n, null, 2))
    })
}

module.exports = {
  writeJsonFiles: writeJsonFiles
}
