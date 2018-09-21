var tape = require('tape')
var Scuttlebot = require('scuttlebot')
var cont = require('cont')
var ssbKeys = require('ssb-keys')
var other = ssbKeys.generate()

Scuttlebot
  .use(require('../'))

var sbot = Scuttlebot({
  temp: 'identities',
  caps: {
    sign: require('crypto')
      .randomBytes(32).toString('base64')
  }
})


tape('list identities', function (t) {
  sbot.identities.create(function (err, id) {
    if(err) throw err
    sbot.identities.list(function (err, ls) {
      if(err) throw err
      t.deepEqual(ls, [sbot.id, id])
      t.notEqual(ls[0], ls[1])
      sbot.identities.create(function (err, id2) {
        if(err) throw err
        sbot.identities.list(function (err, ls) {
          if(err) throw err
          t.deepEqual(ls, [sbot.id, id, id2])
          t.end()
        })
      })
    })
  })
})

tape('publish as', function (t) {
  sbot.identities.list(function (err, ls) {
    if(err) throw err
    cont.para(
      ls.map(function (id) {
        return function (cb) {
          sbot.identities.publishAs({id: id, content: {type:'post', text: 'hello'}}, cb)
        }
      })
    )(function (err, ary) {
      if(err) throw err
      console.log(ary)
      ary.forEach(function (e, i) {
        t.equal(e.value.author, ls[i])
      })
      t.end()
    })
  })
})

tape('double safety on private', function (t) {
  sbot.identities.publishAs({
    id: sbot.id,
    content: {
      type: 'private',
      recps: [sbot.id, other.id],
      text: 'secrets'
    }
  }, function (err) {
    t.ok(err) //error because opts.private: must be true.
    t.end()
  })
})

tape('double safety on private, 2', function (t) {
  sbot.identities.publishAs({
    id: sbot.id,
    content: {
      type: 'private',
      //incorrect key! so this should error
      recips: [sbot.id, other.id],
      text: 'secrets'
    },
    private: true
  }, function (err) {
    t.ok(err) //error because opts.private: must be true.
    t.end()
  })
})

tape('double safety on private, 2.5', function (t) {
  sbot.identities.publishAs({
    id: sbot.id,
    content: {
      type: 'private',
      //incorrect key! so this should error
      recps: [other.id],
      text: 'secrets'
    },
    private: true
  }, function (err) {
    t.ok(err) //error because opts.private: must be true.
    t.end()
  })
})

tape('double safety on private, 3', function (t) {
  sbot.identities.publishAs({
    id: sbot.id,
    content: {
      type: 'private',
      //incorrect key! so this should error
      recps: [sbot.id, other.id],
      text: 'secrets'
    },
    private: true
  }, function (err, msg) {
    if(err) throw err
    t.notOk(err)
    console.log(msg)
    t.equal(typeof msg.value.content, 'string')
    t.end()
  })
})

tape("can read something encrypted so that the main sbot can't read", function (t) {
  sbot.identities.list(function (err, ls) {
    var id = ls[1]
    sbot.identities.publishAs({
      id: id,
      content: {
        type: 'private',
        //incorrect key! so this should error
        recps: [id],
        text: 'secrets'
      },
      private: true
    }, function (err, msg) {
      if(err) throw err
      t.notOk(err)
      console.log(msg)
      t.equal(typeof msg.value.content, 'string')
      sbot.get({id: msg.key, private: true}, function (err, msg) {
        if(err) throw err
        t.deepEqual(msg.content, {type: 'private', recps: [id], text: 'secrets'})
        t.end()
      })
    })
  })

})

tape('close', function (t) {
  sbot.close()
  t.end()
})



