const Transaction = require('./Transaction')
const Person = require('./Person')


const schemas = {
    Transaction,
    'injects': {
        'People': {
            Person
        },
    }
}

module.exports = schemas;