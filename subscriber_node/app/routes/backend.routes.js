module.exports = app => {
  const backend = require("../controllers/backend.controller.js");

  var router = require("express").Router();
  router.post("/notify", backend.notify);
  app.use('/backend', router);
};