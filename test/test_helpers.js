const fs = require('fs-extra')
const path = require('path')

const writeJsonFiles = async (tgtPath, dirContents) => {
    await fs.mkdir(tgtPath)
    dirContents.files.forEach(async (n) => {
      await fs.writeFile(path.join(tgtPath, n.name),
      JSON.stringify(n, null, 2))
    })
}

module.exports = {
  writeJsonFiles: writeJsonFiles
}
