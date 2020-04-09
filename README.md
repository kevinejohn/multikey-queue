# Install

`npm install multikey-queue`

# Use

```
const Queue = require('multikey-queue')
const path = require('path')

const queue = new Queue({ directory: path.join(__dirname, `./tmp`) })

await queue.addOne('key1', 'value1')
await queue.addOne('key1', 'value1')
await queue.addOne('key1', 'value2')
await queue.addOne('key2', 'value3')

const obj = await queue.getOne('key1')
await queue.delOne(obj)
await queue.delAll()
```