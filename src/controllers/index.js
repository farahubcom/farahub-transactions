const MainController = require('./MainController')
const PeopleController = require('./PeopleController')
const InvoicesController = require('./InvoicesController')
const ContractsController = require('./ContractsController')


const controllers = [
    MainController,
    PeopleController,
    InvoicesController,
    ContractsController,
];

module.exports = controllers;