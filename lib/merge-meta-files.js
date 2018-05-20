const fs = require('fs-extra-promise')
const path = require('path')
const readline = require('readline')
const tmp = require('tmp-promise')


/**
 * Sync meta files from a source directory to a target directory
 * merging any meta file that already exists on the target side
 * by keeping the target file's guid
 * but overwriting all other shared properties with the source file.
 */
const mergeMetaFiles = async (opts) => {

    const pathSource = opts.path_source
    const pathTarget = opts.path_target

    if(opts.verbose) {
      console.log(`syncMissingMetaFiles with opts: ${JSON.stringify(opts, null, 2)}`)
    }

    const mergePairs = [];

    await fs.copyAsync(pathSource, pathTarget, {
        filter: (src, dst) => {
          const stats = fs.lstatSync(src)
          if(stats.isDirectory()) { // source is a directory, CONTINUE
            return true
          }

          const match = String(src).match(/^.*[\.]meta$/)
          if(match === null) {
            return false // source is a file that's not a .meta file, STOP
          }

          if(!fs.existsSync()) {
            return true // target doesn't exist CONTINUE
          }

          mergePairs.push({ source: String(src), target: String(dst) })

          return false
        }
    })

    mergePairs.forEach(async (p) => {
        const src = await fs.readyAsync(p.source)
        const tgt = await fs.readAsync(p.target)

        await fs.writeFileAsync(p.target, JSON.stringify(
          {
            ...tgt,
            ...src,
            guid: tgt.guid
          }
        ))
    })
}

module.exports = mergeMetaFiles
