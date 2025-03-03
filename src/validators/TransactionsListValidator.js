const camelCase = require("lodash/camelCase");
const upperFirst = require("lodash/upperFirst");
const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;


class TransactionsListValidator {

    /**
     * The validator rules
     * 
     * @returns {object}
     */
    rules() {
        return {
            model: {
                in: ["params"],
                isString: true,
                customSanitizer: {
                    options: (value, { req }) => {
                        return upperFirst(camelCase(value));
                    }
                }
            },
            modelId: {
                in: ["params"],
                isString: true,
                customSanitizer: {
                    options: (value, { req }) => {
                        return ObjectId(value);
                    }
                }
            },
            query: {
                in: ["query"],
                optional: true,
                isString: true
            },
            sort: {
                in: ["query"],
                optional: true,
                isString: true
            },
            page: {
                in: ["query"],
                optional: true,
                isInt: true,
                toInt: true
            },
            perPage: {
                in: ["query"],
                optional: true,
                isInt: true,
                toInt: true
            },
            //
        }
    }
}

module.exports = TransactionsListValidator;