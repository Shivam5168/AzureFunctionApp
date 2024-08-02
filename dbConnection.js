const mongoose = require('mongoose');

const connectionString = "mongodb+srv://Shivam5168:Pradhan%402005@demo2005.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000";
const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

module.exports = { connectionString, connectionOptions, mongoose };
