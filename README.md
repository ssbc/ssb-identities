# ssb-identities

manage multiple ssb identities, as an sbot plugin.

## Usage

```js
var createSbot = require('scuttlebot')
  .use(require('scuttlebot/plugins/master'))
  .use(require('scuttlebot/plugins/gossip'))
  .use(require('scuttlebot/plugins/replicate'))
  .use(require('ssb-identities'))

var sbot = createSbot(config)
// locally or via an remote ssb-client connection

sbot.identities.list(function (err, data) {
  // do things
})
```

This module uses the [addUnboxer](https://github.com/ssbc/ssb-db#addunboxer-keyunboxkey-value-unboxvalue)
method of ssb db so that encrypted messages will be decrypted before being passed
to database views.

## API

### identities.main (cb)

returns the main identity (sbot.id)

### identities.list (cb)

returns the list of identities, with the main
identity first.

### identities.create (cb)

create a new identity, stored in `~/.ssb/identities/secret_[N].butt`
where N is the left-padded number of this identity.
returns the id of the newly created identity.

The file created will use [the ssb-keys format](https://github.com/ssbc/ssb-keys#keys)`

### identities.publishAs({id:id, content: obj, private: boolean}, cb) 

publish a message as a specific identity.
`id` must be provided and must be already in
the identities list. If `private` is true,
`content.recps` must be set. `recps` must contain
the `id`.

## More information about sbot plugins
For more information about these type of plugins, refer to the [`plugins.md` in the `secret-stack` repository](https://github.com/ssbc/secret-stack/blob/master/plugins.md).

## License

MIT


