module.exports = app => {
  const publisher = require("../controllers/publisher.controller.js");

  var router = require("express").Router();
  router.get("/getAmazon", publisher.getAmazon);
  router.get("/getEbay", publisher.getEbay);
  router.get("/getBestBuy", publisher.getBestBuy);
  router.get("/getSnapdeal", publisher.getSnapdeal);
  router.get("/getFlipkart", publisher.getFlipkart);
  router.get("/getTarget", publisher.getTarget);
  app.use('/publisher', router);
};