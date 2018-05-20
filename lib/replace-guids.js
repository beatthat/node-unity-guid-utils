const fs = require('fs-extra')
const path = require('path')
const readline = require('readline')
const tmp = require('tmp-promise')

const replaceGuids = async (opts) => {

    const readPath = opts.path_read
    const writePath = opts.path_write

    const guidMap = opts.guid_map

    if(!readPath) {
        throw new Error(`missing required param 'path_read' in call to replaceGuids with opts\n${JSON.stringify(opts, null, 2)}`)
    }

    if(!writePath) {
        throw new Error(`missing required param 'path_write' in call to replaceGuids with opts\n${JSON.stringify(opts, null, 2)}`)
    }

    if(! await fs.exists(readPath)) {
        throw new Error(`read path for replaceGuids does not exist: '${readPath}'\n${JSON.stringify(opts, null, 2)}`)
    }

    const tmpDir = await tmp.dir()

    const tmpWritePath = path.join(tmpDir.path, path.basename(writePath))

    const r = readline.createInterface({
        input: fs.createReadStream(readPath),
        crlfDelay: Infinity
    })

    const w = fs.createWriteStream(tmpWritePath)

    const guidRegex = /^.*,[ ]?guid:[ ]?(\w+),.*$/

    const promise = new Promise((resolve, reject) => {
        r.on('line', line => {
            const m = line.match(guidRegex)
            if(m && m.length >= 2) {
                const replaceGuid = m[1]
                const replaceWithGuid = guidMap[replaceGuid]
                if(replaceWithGuid) {
                    line = line.replace(replaceGuid, replaceWithGuid)
                }
            }

            w.write(`${line}\n`)
        })

        r.on('close', () => {
            w.close()
        })

        w.on('close', () => {
            fs.renameSync(tmpWritePath, writePath)
            resolve()
        })

        w.on('error', err => reject(err))
    })

    return promise

}

module.exports = replaceGuids
