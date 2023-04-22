// const AsyncQueue = require('webpack/lib/util/AsyncQueue')

const QUEUE_STATE = 0 // 入队 等待执行
const PROCESSING_STATE = 1 // 正在执行
const DONE_STATE = 2 // 执行完毕

class ArrayQueue {
  list = []
  enqueue(item) {
    this.list.push(item)
  }
  dequeue() {
    return this.list.shift()
  }
}
class AsyncQueueEntry {
  constructor(item, callback) {
    this.item = item
    this.state = QUEUE_STATE
    this.callback = callback
  }
}

class AsyncQueue {
  constructor({ name, parallelism, processor, getKey }) {
    this._name = name
    this._parallelism = parallelism // 并发的个数
    this._processor = processor
    this._getKey = getKey
    this._entries = new Map() // 判断是否添加过
    this._queued = new ArrayQueue()
    this._activeTasks = 0 // 当前正在执行的任务数
    this._willEnsureProcessing = false // 是否要马上开始处理任务
    // this._willEnsureProcessing = false 1. 任务执行完 2. 任务队列满了 只能等待认为执行完才能开始下一个
  }
  add(item, callback) {
    const key = this._getKey(item)
    const entry = this._entries.get(key) || null
    if (entry !== null) {
      if (entry.state === DONE_STATE) {
        // 有这个任务 注册过 且任务执行完毕了 立刻执行的
        process.nextTick(() => callback(entry.error, entry.result))
      } else {
        // 有这个任务 但是还没执行完毕 或者未开始执行 缓存callback
        if (entry.callbacks) {
          entry.callbacks.push(callback)
        } else {
          entry.callbacks = [callback]
        }
      }
      return
    }
    const newEntry = new AsyncQueueEntry(item, callback)
    this._entries.set(key, newEntry)
    this._queued.enqueue(newEntry)
    if (!this._willEnsureProcessing) {
      this._willEnsureProcessing = true
      setImmediate(() => this._ensureProcessing()) // 下个事件环开始执行任务
    }
  }
  _ensureProcessing() {
    // 执行任务数小于并发任务数
    while (this._activeTasks < this._parallelism) {
      const entry = this._queued.dequeue()
      if (!entry) break
      this._activeTasks++ // 执行并发任务数量增加
      entry.state = PROCESSING_STATE // 状态 执行中
      this._startProcessing(entry)
    }
    this._willEnsureProcessing = false
  }
  _startProcessing(entry) {
    this._processor(entry.item, (err, res) => {
      this._handleResult(entry, err, res)
    })
  }
  _handleResult(entry, error, result) {
    const cb = entry.callback // 完成回调函数
    const cbs = entry.callbacks // 注册相同任务的回调函数集合
    entry.state = DONE_STATE // 完成态
    entry.result = result // 记录结果和错误
    entry.error = error
    cb(error, result) // 执行回调
    cbs?.forEach(cb => cb(error, result))
    this._activeTasks--
    if (!this._willEnsureProcessing) {
      this._willEnsureProcessing = true
      setImmediate(() => this._ensureProcessing()) // 下个事件环开始执行任务
    }
  }
}

// 处理器
const processor = (item, callback) => {
  setTimeout(() => {
    console.log('处理：', item)
    callback(null, item)
  }, 2000)
}
// 获取唯一标识
const getKey = (item) => {
  console.log(item.key, '---')
  return item.key
}


const queue = new AsyncQueue({
  name: "创建模块",
  parallelism: 3, // 同时执行的异步任务的并发数
  processor, // 如何创建模块 每个条目 要经过如何处理
  getKey, // key是每个item的唯一标识
})

const startTime = Date.now()
const item1 = { key: 'item1' }
queue.add(item1, (err, item) => {
  console.log(item, Date.now() - startTime)
})
const item2 = { key: 'item2' }
queue.add(item2, (err, item) => {
  console.log(item, Date.now() - startTime)
})
const item3 = { key: 'item3' }
queue.add(item3, (err, item) => {
  console.log(item, Date.now() - startTime)
})
const item4 = { key: 'item4' }
queue.add(item4, (err, item) => {
  console.log(item, Date.now() - startTime)
})
// 唯一的key重复的 不需要注册了
const item5 = { key: 'item1' }
queue.add(item5, (err, item) => {
  console.log(item, Date.now() - startTime, '重复key回调')
})

setTimeout(() => {
  const item5 = { key: 'item1' }
  queue.add(item5, (err, item) => {
    console.log(item, Date.now() - startTime, '重复key回调')
  })
}, 2200)