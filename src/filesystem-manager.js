/** @babel */

import fs from 'fs'
import path from 'path'

import {Emitter, Disposable, CompositeDisposable} from 'event-kit'
import nsfw from 'nsfw'
const {MODIFIED, CREATED, DELETED, RENAMED} = nsfw.actions

const ACTION_MAP = new Map([
  [nsfw.actions.MODIFIED, 'changed'],
  [nsfw.actions.CREATED, 'added'],
  [nsfw.actions.DELETED, 'deleted'],
  [nsfw.actions.RENAMED, 'renamed']
])

class NativeWatcher {
  constructor (normalizedPath) {
    this.normalizedPath = normalizedPath
    this.emitter = new Emitter()

    this.watcher = null
    this.running = false
    this.refCount = 0
  }

  async start () {
    this.watcher = await nsfw(
      this.normalizedPath,
      this.onEvents.bind(this),
      {
        debounceMS: 100,
        errorCallback: this.onError.bind(this)
      }
    )

    await this.watcher.start()

    this.running = true
    this.emitter.emit('did-start')
  }

  isRunning () {
    return this.running
  }

  onDidStart (callback) {
    return this.emitter.on('did-start', callback)
  }

  onDidChange (callback) {
    return this.emitter.on('did-change', callback)
  }

  async stop() {
    await this.watcher.stop()
    this.running = false
    this.emitter.emit('did-stop')
  }

  onEvents (events) {
    this.emitter.emit('did-change', events.map(event => {
      const type = ACTION_MAP.get(event.action) || `unexpected (${event.action})`
      const oldFileName = event.file || event.oldFile
      const newFileName = event.newFile
      const oldPath = path.join(event.directory, oldFileName)
      const newPath = newFileName && path.join(event.directory, newFileName)

      return {oldPath, newPath, type}
    }))
  }

  onError (err) {
    //
  }
}

class NativeWatcherRegistry {
  constructor () {
    this.watchers = new Map()
  }

  async attach (rootPath, watcher) {
    const resolvedPath = await new Promise((resolve, reject) => {
      fs.realpath(rootPath, (err, result) => (err ? reject(err) : resolve(result)))
    })
    const parts = resolvedPath.split(path.sep).filter(part)

    for (let i = 0; i < parts.length; i++) {

    }
  }
}

class Watcher {
  constructor () {
    this.emitter = new Emitter()
    this.subs = new CompositeDisposable()
  }

  onDidStart (callback) {
    return this.emitter.on('did-start', callback)
  }

  onDidChange (callback) {
    return this.emitter.on('did-change', callback)
  }

  attachToNative (native) {
    if (native.isRunning()) {
      this.emitter.emit('did-start')
    } else {
      this.subs.add(native.onDidStart(payload => {
        this.emitter.emit('did-start', payload)
      }))
    }

    this.subs.add(native.onDidChange(payload => {
      this.emitter.emit('did-change', payload)
    }))
  }

  dispose () {
    this.emitter.dispose()
    this.subs.dispose()
  }
}

export default class FileSystemManager {
  constructor () {
    this.nativeWatchers = new Map()
  }

  getWatcher (rootPath) {
    const watcher = new Watcher()

    (async () {
      fs.realpath(rootPath, (err, resolvedPath) => {
        //
      })
    })()

    return watcher
  }
}
