const yargs = require('yargs');

const argv = yargs
    .options(
        {
            'https': {
                description: 'Set https port',
                alias: 'h',
                type: 'number'
            },
            'sslpath':{
                description: 'Set ssl path',
                alias: 's',
                type: 'string'
            },
            'local': {
                description: 'Run local',
                alias: 'l',
                type: 'boolean'
            }
        }
    ).parse()

module.exports = argv