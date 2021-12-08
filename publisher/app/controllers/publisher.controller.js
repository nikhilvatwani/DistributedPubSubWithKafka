var axios = require('axios')

var Kafka = require('node-rdkafka')
const streamB1 = Kafka.Producer.createWriteStream({
  'metadata.broker.list': '172.20.0.10:9092'
}, {}, {
  topic: 'PubToB1'
});


streamB1.on('error', (err) => {
  console.error('Error in our kafka streamB1');
  console.error(err);
});

const streamB2 = Kafka.Producer.createWriteStream({
  'metadata.broker.list': '172.20.0.10:9092'
}, {}, {
  topic: 'PubToB2'
});


streamB2.on('error', (err) => {
  console.error('Error in our kafka streamB2');
  console.error(err);
});

const streamB3 = Kafka.Producer.createWriteStream({
  'metadata.broker.list': '172.20.0.10:9092'
}, {}, {
  topic: 'PubToB3'
});

streamB3.on('error', (err) => {
  console.error('Error in our kafka streamB3');
  console.error(err);
});

var ebayMsgCount = 0
var amazonMsgCount = 0
var bestBuyMsgCount = 0
var flipkartMsgCount = 12
var snapdealMsgCount = 24
var targetMsgCount = 36
module.exports.getAmazon = (req, res) => {
  axios.get("https://sandbox.rutterapi.com/products", {
    params: {
      access_token: "f2fb6d33-ccf7-430d-9b1e-1a525bbcba24",
      limit: 20,
    },
    auth: {
      username: "a769a075-6623-4b76-8a0a-103e02bcc410",
      password: "sandbox_sk_5de147cc-5331-4c45-87ce-57a3d4badba3"
    }
  }).then( (result) => {
    res = JSON.parse(JSON.stringify(result.data));
    var timerAmazon = setInterval(function(){sendMessages(res['products'], timerAmazon, "amazon", amazonMsgCount++, streamB1)}, 7000, (err) => {
        console.log(err)
    });
    //});
  });
}

module.exports.getFlipkart = (req, res) => {
  axios.get("https://sandbox.rutterapi.com/products", {
    params: {
      access_token: "f2fb6d33-ccf7-430d-9b1e-1a525bbcba24",
      limit: 30,
    },
    auth: {
      username: "a769a075-6623-4b76-8a0a-103e02bcc410",
      password: "sandbox_sk_5de147cc-5331-4c45-87ce-57a3d4badba3"
    }
  }).then( (result) => {
    res = JSON.parse(JSON.stringify(result.data));
    var timerFlipkart = setInterval(function(){sendMessages(res['products'], timerFlipkart, "flipkart", flipkartMsgCount++, streamB1)}, 7000, (err) => {
        console.log("flipkart error")
        console.log(err)
    });
    //});
  });
}

module.exports.getSnapdeal = (req, res) => {
  axios.get("https://sandbox.rutterapi.com/products", {
    params: {
      access_token: "f2fb6d33-ccf7-430d-9b1e-1a525bbcba24",
      limit: 40,
    },
    auth: {
      username: "a769a075-6623-4b76-8a0a-103e02bcc410",
      password: "sandbox_sk_5de147cc-5331-4c45-87ce-57a3d4badba3"
    }
  }).then( (result) => {
    res = JSON.parse(JSON.stringify(result.data));
    console.log("snapdeal results")
    console.log(res)
    var timerSnapdeal = setInterval(function(){sendMessages(res['products'], timerSnapdeal, "snapdeal", snapdealMsgCount++,streamB2)}, 7000, (err) => {
        console.log("snapdeal error")
        console.log(err)
    });
    //});
  });
}

module.exports.getTarget = (req, res) => {
  axios.get("https://sandbox.rutterapi.com/products", {
    params: {
      access_token: "f2fb6d33-ccf7-430d-9b1e-1a525bbcba24",
      limit: 50,
    },
    auth: {
      username: "a769a075-6623-4b76-8a0a-103e02bcc410",
      password: "sandbox_sk_5de147cc-5331-4c45-87ce-57a3d4badba3"
    }
  }).then( (result) => {
    res = JSON.parse(JSON.stringify(result.data));
    var timerTarget = setInterval(function(){sendMessages(res['products'], timerTarget, "target", amazonMsgCount++,streamB2)}, 7000, (err) => {
        console.log("target error")
        console.log(err)
    });
    //});
  });
}

sendMessages = function(products, timer, topicName, msgCount, stream) {
    try{
        if(msgCount>=products.length){
            console.log("clearing the interval")
            clearInterval(timer);
            return;
        }
        console.log("Sending "+ topicName +" message no.-"+msgCount)
        var obj = new Object();
        if(topicName == 'amazon'||topicName == 'flipkart'||topicName == 'snapdeal'||topicName == 'target'){
            obj.name = products[msgCount]["name"]
            obj.price = products[msgCount]["variants"][0]["price"]
            obj.description = products[msgCount]["description"]
        }else if(topicName == 'ebay'){
            obj.name = products[msgCount]["title"]
            obj.price = products[msgCount]["price"]
            obj.description = products[msgCount]["description"]
        }else if(topicName == 'bestbuy'){
            obj.name = products[msgCount]["name"]
            obj.price = products[msgCount]["salePrice"]
            obj.description = "This is brand new "+obj.name
        }
        obj = JSON.stringify(obj)
        var result = new Object();
        result.message = obj
        result.topic = topicName
        stream.write(Buffer.from(JSON.stringify(result)))
        console.log("Sent "+ topicName +" message no.-"+msgCount);
        /*axios.post(hostname+"/broker/publish",{
            message: obj,
            topic: topicName
        }).then((response) => {
            console.log("Sent "+ topicName +" message no.-"+msgCount);
          }, (error) => {
            console.log(error);
          });*/
        if(msgCount>=products.length){
            console.log("clearing the interval")
            clearInterval(timer);
        }
    }catch(e){
    }
}
module.exports.getEbay = (req, res) => {
    axios.get("https://fakestoreapi.com/products")
    .then((result) => {
        res = JSON.parse(JSON.stringify(result.data));
        var timerEbay = setInterval(function(){sendMessages(res, timerEbay, "ebay", ebayMsgCount++,streamB3)}, 7000, (err) => {
            console.log(err)
        });
      })
}

module.exports.getBestBuy = (req, res) => {
    axios.get("https://api.bestbuy.com/v1/products?format=json&apiKey=MJg0YobYGg1zaGqyjh16IOWM").
    then((result) => {
     res = JSON.parse(JSON.stringify(result.data));
     var bestBuyTimer = setInterval(function(){sendMessages(res['products'], bestBuyTimer, "bestbuy", bestBuyMsgCount++,streamB3)}, 7000, (err) => {
         console.log(err)
     });
   })
}

