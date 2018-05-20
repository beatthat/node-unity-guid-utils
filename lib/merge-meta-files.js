const fs = require('fs-extra')
const path = require('path')
const tmp = require('tmp-promise')

/**
 * Sync meta files from a source directory to a target directory
 * merging any meta file that already exists on the target side
 * by keeping the target file's guid
 * but overwriting all other shared property values from the source file.
 */
const mergeMetaFiles = async (opts) => {

    const pathSource = opts.path_source
    const pathTarget = opts.path_target

    if(opts.verbose) {
      console.log(`mergeMetaFiles with opts: ${JSON.stringify(opts, null, 2)}`)
    }

    const mergePairs = [];

    await fs.copy(pathSource, pathTarget, {
        filter: async (src, dst) => {
          const stats = await fs.lstat(src)
          if(stats.isDirectory()) { // source is a directory, CONTINUE
            return true
          }

          const match = String(src).match(/^.*[\.]meta$/)
          if(match === null) {
            return false // source is a file that's not a .meta file, STOP
          }

          if(await fs.exists(dst)) {
            const statsTgt = await fs.lstat(dst)
            if(statsTgt.isDirectory()) { // target is a directory, complete the path so we can check if file exists
              dst = path.join(dst, path.basename(src))
            }
          }

          if(!await fs.exists(dst)) {
            return true // target doesn't exist CONTINUE
          }

          mergePairs.push({ source: String(src), target: String(dst) })

          return false
        }
    })

    for(var i = 0; i < mergePairs.length; i++) {
        const src = JSON.parse(await fs.readFile(mergePairs[i].source, 'utf8'))
        const tgt = JSON.parse(await fs.readFile(mergePairs[i].target, 'utf8'))

        await fs.writeFile(mergePairs[i].target, JSON.stringify({
          ...tgt,
          ...src,
          guid: tgt.guid
        }, null, 2))
    }
}

module.exports = mergeMetaFiles
