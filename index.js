var leftpad = require('left-pad')
var path = require('path')
var mkdirp = require('mkdirp')
var fs = require('fs')
var ssbKeys = require('ssb-keys')
var create = require('ssb-validate').create
var ref = require('ssb-ref')
var unbox = require('ssb-keys').unbox

exports.name = 'identities'
exports.version = '1.0.0'
exports.manifest = {
  main: 'sync',
  list: 'async',
  create: 'async',
  publishAs: 'async'
}

exports.init = function (sbot, config) {

  var dir = path.join(config.path, 'identities')
  mkdirp.sync(dir)
  var ready = false
  var keys = fs.readdirSync(dir).filter(function (name) {
    return /^secret_\d+\.butt$/.test(name)
  }).map(function (file) {
    return ssbKeys.loadSync(path.join(dir, file))
  })

  var keymap = {}
  var locks = {}

  sbot.addUnboxer(function(content) {
    for(var i = 0;i < keys.length;i++) {
      var plaintext = unbox(content, keys[i])
      if(plaintext) return plaintext
    }
  });

  return {
    main: function () {
      return sbot.id
    },
    list: function (cb) {
      cb(null, [sbot.id].concat(keys.map(function (e) { return e.id })))
    },
    create: function (cb) {
      var filename = 'secret_'+leftpad(keys.length, 2, '0')+'.butt'
      var newKeys = ssbKeys.createSync(path.join(dir, filename))
      keys.push(newKeys)
      sbot.publish({
        type: 'contact',
        following: true,
        autofollow: true,
        contact: newKeys.id,
      }, function(err, msg) {
        cb(err, newKeys.id)
      })
    },
    publishAs: function (opts, cb) {
      var id = opts.id
      if(locks[id]) return cb(new Error('already writing'))
      var _keys = sbot.id === id ? sbot.keys : keys.find(function (e) {
        return id === e.id
      })
      if(!_keys) return cb(new Error('must provide id of listed identities'))
      var content = opts.content

      if(content.recps && !opts.private)
        return cb(new Error('recps set, but opts.private not set'))
      else if(!content.recps && opts.private)
        return cb(new Error('opts.private set, but content.recps not set'))
      else if(!!content.recps && opts.private) {
        if(!Array.isArray(content.recps) || !~content.recps.indexOf(id))
          return cb(new Error('content.recps must be an array containing publisher id:'+id))
        content = ssbKeys.box(content, content.recps.map(function (e) {
          return ref.isFeed(e) ? e : e.link
        }))
      }

      locks[id] = true
      sbot.getLatest(id, function (err, data) {
        var state = data ? {
          id: data.key,
          sequence: data.value.sequence,
          timestamp: data.value.timestamp,
          queue: []
        } : {id: null, sequence: null, timestamp: null, queue: []}
        sbot.add(create(state, _keys, config.caps && config.caps.sign, content, Date.now()), function (err, a, b) {
          delete locks[id]
          cb(err, a, b)
        })
      })
    }
  }
}

