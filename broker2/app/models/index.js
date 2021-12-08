const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.subscriptions = require("./subscriptions.model.js")(mongoose);
db.messages = require("./messages.model.js")(mongoose);
db.topics = require("./topics.model.js")(mongoose);
db.neighbours = require("./neighbours.model.js")(mongoose);
db.pivot = require("./pivot.model.js")(mongoose);

module.exports = db;