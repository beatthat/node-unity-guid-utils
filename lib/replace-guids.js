const fs = require('fs-extra')
const path = require('path')
const readline = require('readline')
const tmp = require('tmp-promise')

const filterAcceptUnhiddenDirsAndFileExts = (fileExtsArray) => {
  return async (f) => {
    for(var i in fileExtsArray) {
      if(f.endsWith(fileExtsArray[i])) {
        return true;
      }
    }

    if(f.startsWith('.')) {
      return false
    }

    try {
      const stats = await fs.lstat(f)
      return stats.isDirectory()
    }
    catch(err) {
      console.log(`error testing path ${f}: ${err}`)
      return false
    }
  }
}

const replaceGuids = async (opts) => {

    const pathCur = opts.path
    const guidMap = opts.guid_map

    const filter = opts.filter
    || filterAcceptUnhiddenDirsAndFileExts(['.unity', '.prefab', '.asset'])

    if(!pathCur) {
        throw new Error(`missing required param 'path' in call to replaceGuids with opts\n${JSON.stringify(opts, null, 2)}`)
    }

    if(! await fs.exists(pathCur)) {
        throw new Error(`path for replaceGuids does not exist: '${pathCur}'\n${JSON.stringify(opts, null, 2)}`)
    }

    const stats = await fs.lstat(pathCur)

    if(stats.isDirectory()) {
      // list the files in the directory and continue with only the ones accepted by 'filter'
      const filesAll = await fs.readdir(pathCur)
      const files = []
      for(var i in filesAll) {
        const fullPath = path.join(pathCur, filesAll[i])
        if(await filter(fullPath)) {
          // Prefer this to be a breadth-first rather than depth-first operation
          // So rather than recurse immediately, store all the 'accepts'
          files.push(fullPath)
        }
      }

      for(var i in files) {
        await replaceGuids({
          ...opts,
          filter: filter,
          path: files[i]
        })
      }

      return // cur recursive call is a directory, and finished
    }

    const tmpDir = await tmp.dir() // TODO: one temp dir for all (recursive) calls

    const tmpWritePath = path.join(tmpDir.path, path.basename(pathCur))

    const guidRegex = /^.*[ ]?["']?guid["']?[ ]?:[ ]?["']?(\w+)["']?,?.*$/

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
