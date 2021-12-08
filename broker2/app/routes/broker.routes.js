module.exports = app => {
  const broker = require("../controllers/broker.controller.js");

  var router = require("express").Router();

  router.post("/publish", broker.publish);
  router.post("/subscribe", broker.subscribe);
  router.post("/unsubscribe", broker.unsubscribe);
  router.post("/notify", broker.notify);
  router.get("/advertise", broker.advertise);
  router.post("/deadvertise", broker.deadvertise);
  router.post("/addTopic", broker.addTopic);
  router.post("/forwardRequest", broker.forwardRequest);
  router.post("/addPivotInfo", broker.addPivotInfo);
  router.post("/addNeighbours", broker.addNeighbours);
  app.use('/broker', router);
};