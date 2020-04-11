const fs = require('fs')
const path = require('path')
const DataStore = require('data-store')
const crypto = require('crypto')

class Queue {
  constructor ({ directory, keepFiles = false }) {
    this.directory = directory
    this.keepFiles = keepFiles
    fs.mkdirSync(directory, { recursive: true })
    this.store = DataStore({
      path: path.join(directory, `./data.json`)
    })
  }
  getPath (key, hash) {
    return path.join(this.directory, `${key}-${hash}`)
  }
  async addOne (key, value) {
    if (!key || !value) throw new Error(`Invalid key or value`)
    const hash = crypto
      .createHash('sha256')
      .update(value)
      .digest('hex')
    await fs.promises.writeFile(this.getPath(key, hash), value, 'utf8')
    this.store.union(key, hash)
  }
  async getOne (key) {
    const keyHashes = this.store.get(key)
    if (keyHashes && keyHashes.length > 0) {
      const hash = keyHashes[0]
      const value = await fs.promises.readFile(this.getPath(key, hash), 'utf8')
      return { key, value, hash }
    }
  }
  count (key) {
    const keyHashes = this.store.get(key) || []
    return keyHashes.length
  }
  async delOne ({ key, value, hash }) {
    if (!hash && value) {
      hash = crypto
        .createHash('sha256')
        .update(value)
        .digest('hex')
    }
    let keyHashes = this.store.get(key) || []
    const index = keyHashes.indexOf(hash)
    if (index >= 0) {
      keyHashes.splice(index, 1)
      if (keyHashes.length === 0) {
        this.store.del(key)
      } else {
        this.store.set(key, keyHashes)
      }
      if (!this.keepFiles) {
        try {
          await fs.promises.unlink(this.getPath(key, hash))
        } catch (err) {}
      }
    } else {
      // console.log(`MISSING`, keyHashes, key, hash)
    }
  }
  async delAll () {
    const data = this.store.get()
    const list = []
    for (const key in data) {
      for (const hash of data[key]) {
        list.push({ key, hash })
      }
    }
    for (const item of list) {
      await this.delOne(item)
    }
    console.log(`Cleared everything`)
  }
}

module.exports = Queue
