require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./app/models");
var axios = require('axios')
var Kafka = require('node-rdkafka')
const broker = require("./app/controllers/broker.controller.js");

const app = express();
var corsOptions = {
  origin: ["http://172.20.0.3:9001","http://172.20.0.8:8080","http://172.20.0.7:8081","http://172.20.0.6:8082","http://172.20.0.5:9000","http://localhost:3000","http://localhost:9000","http://localhost:9001","http://localhost:8080","http://localhost:8081","http://localhost:8082"]
};
const topicConf = {
  /*
    See the reason

    https://github.com/Blizzard/node-rdkafka/issues/437#issuecomment-406129883
    https://github.com/Blizzard/node-rdkafka/issues/495
    https://cwiki.apache.org/confluence/display/KAFKA/FAQ#FAQ-Whydoesmyconsumernevergetanydata?
 */
  'auto.offset.reset': 'earliest' // <-- THIS OPTIONS
}
var consumer = new Kafka.KafkaConsumer({
  'group.id': 'kafka1',
  'metadata.broker.list': '172.20.0.10:9092',
}, topicConf);

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    loadApp();
    consumer.connect();
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

consumer.on('ready', () => {
  console.log('consumer ready..')
  consumer.subscribe(['PubToB2']);
  consumer.consume();
  console.log('started consuming..')
}).on('data', function(data) {
  console.log("received message")
  data = JSON.parse(data.value)
  var req = new Object();
  var res = new Object();
  req.body = {"message": data.message, "topic":data.topic}
  broker.publish(req,res);
});

app.use(cors(corsOptions));


app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to ecommerce application." });
});
loadApp = async () => {
  require("./app/routes/broker.routes")(app);
}


const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});