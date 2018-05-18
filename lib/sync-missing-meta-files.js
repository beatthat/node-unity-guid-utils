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

    fs.copyAsync(pathSource, pathTarget, {
        // filter: opts.filter ? opts.filter : (src, dst) => {
        //     return String(src).match(/^[^.]+$|\.(?!(meta)$)([^.]+$)/)
        // },
        overwrite: false
    })
}

module.exports = syncMissingMetaFiles
