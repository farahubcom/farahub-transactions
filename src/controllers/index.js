const MainController = require('./MainController')
const PeopleController = require('./PeopleController')
const InvoicesController = require('./InvoicesController')
const ContractsController = require('./ContractsController')
const ReportsController = require('./ReportsController')


const controllers = [
    MainController,
    PeopleController,
    InvoicesController,
    ContractsController,
    ReportsController,
];

module.exports = controllers;