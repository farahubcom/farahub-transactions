const Transaction = require('./Transaction')
const Person = require('./Person')
const Invoice = require('./Invoice')
const Contract = require('./Contract')


const schemas = {
    Transaction,
    'injects': {
        'People': {
            Person
        },
        'Invoices': {
            Invoice
        },
        'Contracts': {
            Contract
        }
    }
}

module.exports = schemas;