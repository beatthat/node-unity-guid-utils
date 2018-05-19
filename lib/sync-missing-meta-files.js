const fs = require('fs-extra-promise')
const path = require('path')
const readline = require('readline')
const tmp = require('tmp-promise')


/**
 * Sync meta files from a source directory to a target directly
 * skipping/ignoring any file that already exists on the target side
 */
const syncMissingMetaFiles = async (opts) => {

    const pathSource = opts.path_source
    const pathTarget = opts.path_target

    if(opts.verbose) {
      console.log(`syncMissingMetaFiles with opts: ${JSON.stringify(opts, null, 2)}`)
    }

    await fs.copyAsync(pathSource, pathTarget, {
        filter: (src, dst) => {
          const stats = fs.lstatSync(src)
          if(stats.isDirectory()) {
            return true;
          }

          const match = String(src).match(/^.*[\.]meta$/)
          
          return (match !== null)
        },
        overwrite: false
    })
}

module.exports = syncMissingMetaFiles
