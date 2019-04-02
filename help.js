module.exports = {
  description: 'manage multiple ssb feed identities from a single ssb instance',
  commands: {
    main: {
      type: 'sync',
      description: 'return the main identity. (will be the same as `whoami`)',
      args: {},
    },
    list: {
      type: 'async',
      description: 'return list of ssb identities',
      args: {},
    },
    create: {
      type: 'sync',
      description: 'create a new ssb identity. a file will be created at `~/.ssb/identities/secret_N.butt` where N is the number of this identity.',
      args: {},
    },
    publishAs: {
      type: 'async',
      description: 'publish a message as a specific identity',
      args: {
        id: {
          type: 'FeedId',
          description: 'identity to publish this message as',
          optional: false
        },
        content: {
          type: "Any",
          description: 'content of the message. Has all the same options as `publish` command. use `--content.type type` etc syntax for nested properties, as defined by the minimist module.',
          optional: false
        }
      }
    }
  }
}



