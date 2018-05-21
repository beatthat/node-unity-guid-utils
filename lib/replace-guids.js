const fs = require('fs-extra')
const path = require('path')
const readline = require('readline')
const tmp = require('tmp-promise')

const replaceGuids = async (opts) => {

    const pathCur = opts.path
    const guidMap = opts.guid_map

    if(!pathCur) {
        throw new Error(`missing required param 'path' in call to replaceGuids with opts\n${JSON.stringify(opts, null, 2)}`)
    }

    if(! await fs.exists(pathCur)) {
        throw new Error(`path for replaceGuids does not exist: '${pathCur}'\n${JSON.stringify(opts, null, 2)}`)
    }

    const tmpDir = await tmp.dir()

    const tmpWritePath = path.join(tmpDir.path, path.basename(pathCur))

    const guidRegex = /^.*,[ ]?guid:[ ]?(\w+),.*$/

    const r = readline.createInterface({
        input: fs.createReadStream(pathCur),
        crlfDelay: Infinity
    })

    const w = fs.createWriteStream(tmpWritePath)

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
            fs.renameSync(tmpWritePath, pathCur)
            resolve()
        })

        w.on('error', err => reject(err))
    })

    return promise

}

module.exports = replaceGuids
