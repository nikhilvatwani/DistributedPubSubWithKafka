require("dotenv").config();
const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");
const http = require("http");
var axios = require('axios');
const Kafka = require('node-rdkafka');

const app = express();
var corsOptions = {
  origin: ["http://172.20.0.3:9001","http://172.20.0.8:8080","http://172.20.0.7:8081","http://172.20.0.6:8082","http://localhost:3000","http://localhost:8080","http://localhost:9001","http://localhost:8080","http://localhost:8081","http://localhost:8082"]
};
var map1 = new Map();
const server = http.createServer(app);
var subToBrokerMap = new Map();
subToBrokerMap.set("1","http://localhost:8080")
subToBrokerMap.set("2","http://localhost:8081")
subToBrokerMap.set("3","http://localhost:8082")
subToBrokerMap.set("4","http://localhost:8080")
subToBrokerMap.set("5","http://localhost:8081")
subToBrokerMap.set("6","http://localhost:8082")
subToBrokerMap.set("7","http://localhost:8080")
subToBrokerMap.set("8","http://localhost:8081")
subToBrokerMap.set("9","http://localhost:8082")
subToBrokerMap.set("10","http://localhost:8080")
const io = socketIo(server, {
    cors: {
      origin: '*',
    }
});
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
  'group.id': 'kafka3',
  'metadata.broker.list': '172.20.0.10:9092',
}, topicConf);

consumer.connect();

let interval;
io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);

  }
  socket.on("userOnline", (data) => {
        console.log(data)
        interval = setInterval(() => getResultAndEmit(socket, data), 8000);
        socket.on("disconnect", () => {
          console.log("Client disconnected");
          clearInterval(interval);
        });
   });

});


const getResultAndEmit = async(socket,data) => {
   console.log("fetching data for="+data)
   map1.set(data,socket)
   try{
      axios.post(subToBrokerMap.get(data)+"/broker/notify",{
          id_user: data
      }).then((response) => {
            /*response = response.data
            // Emitting a new message. Will be consumed by the client
            console.log("received response="+response)
            socket.emit("Node.To.Sub", response);*/
        }, (error) => {
           console.log("found some issue")
          console.log(error);
        });
    }catch(e){
        console.log("some error occured while fetching data from broker node "+e)
    }
};


app.use(cors(corsOptions));


app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to subscriber node application." });
});


consumer.on('ready', () => {
  console.log('consumer ready..')
  consumer.subscribe(['BrokerToSub']);
  consumer.consume();
  console.log('started consuming..')
}).on('data', function(data) {
  console.log("received message");
  data = JSON.parse(data.value)
  temp = JSON.stringify(data.body)
  temp = JSON.parse(temp)
  //console.log("received notification="+JSON.parse(JSON.stringify(req.body.message)))
  //temp = JSON.parse(JSON.parse(JSON.stringify(data.body)))
  console.log(`received message: ${temp}`);
  result = {"data": temp.message }
  //response = []
  //console.log(response)
  map1.get(temp.id_user).emit("Node.To.Sub", JSON.parse(JSON.stringify(result)))
});
app.post("/notify",(req, res) => {
    //console.log("received notification="+JSON.parse(JSON.stringify(req.body.message)))
    temp = JSON.parse(JSON.parse(JSON.stringify(req.body.message)))
    result = {"data": temp }
    //response = []
    //console.log(response)
    map1.get(req.body.id_user).emit("Node.To.Sub", JSON.parse(JSON.stringify(result)))
    res.json({ message: "message received in sub node" });
});

/*loadApp = async () => {
  require("./app/routes/backend.routes")(app);
}*/


const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});