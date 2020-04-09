const Queue = require('../src')
const path = require('path')

;(async () => {
  const queue = new Queue({ directory: path.join(__dirname, `./tmp`) })

  const key1 = 'key1'
  const key2 = 'key2'
  const key3 = 'key3'

  const arr = [
    { key: key1, value: 'first' },
    { key: key1, value: 'second' },
    { key: key1, value: 'second' },
    { key: key2, value: 'third' },
    { key: key3, value: 'fourth' },
    { key: key1, value: 'fifth' },
    { key: key2, value: 'first' }
  ]
  for (const obj of arr) {
    await queue.addOne(obj.key, obj.value)
  }

  while (true) {
    const obj = await queue.getOne(key1)
    if (!obj) break
    // console.log(obj)
    await queue.delOne(obj)
  }
  await queue.addOne('key1', 'test1')
  await queue.addOne('key2', 'test1')

  await queue.delOne(arr[1])
  await queue.delAll()
})()
