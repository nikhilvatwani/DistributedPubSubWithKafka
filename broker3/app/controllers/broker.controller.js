const db = require("../models");
const Messages = db.messages;
const Topics = db.topics;
const Subscriptions = db.subscriptions;
const Neighbours = db.neighbours;
const Pivot = db.pivot;
var axios = require('axios')
const Kafka = require('node-rdkafka')

const stream = Kafka.Producer.createWriteStream({
  'metadata.broker.list': '172.20.0.10:9092'
}, {}, {
  topic: 'BrokerToSub'
});

stream.on('error', (err) => {
  console.error('Error in our kafka stream');
  console.error(err);
});

module.exports.publish = async (req, res) => {
  const { message, topic } = req.body
  reqmessage = JSON.stringify(message)
  try {
    if (message && topic) {
    Topics.findOne({topic_name: topic}, function(err, document) {
        if(err){
            res.status(500).send({
                  error: "Topic not available",
                  message: "Invalid topic"
                });
                return;
        }
         topic_id = document._id
         msg = new Messages({ message: reqmessage, id_topic: topic_id})
           msg.save()
           /*res.status(200).send({
             message: "success",
             data: msg,
             error: null
           })*/
       })
    } else {
      throw new Error("Some error occurred while creating the Message")
    }
  } catch (e) {
    /*res.status(500).send({
      error: e.message,
      message: "Failed"
    })*/
  }
}

module.exports.subscribe = async (req, res) => {
  const { id_user, id_topic } = req.body
    try {
      if (id_user && id_topic) {
        Topics.findOne({topic_name: id_topic}, function(err, document) {
            if(err){
                res.status(500).send({
                      error: "Topic not available",
                      message: "Invalid topic"
                    });
                    return;
            }
             sub = new Subscriptions({ id_user: id_user, id_topic: document._id })
             sub.save()
             res.status(200).send({
               message: "success",
               data: sub,
               error: null
             })
       })

      } else {
        throw new Error("Some error occurred while creating the Subscription")
      }
    } catch (e) {
      res.status(500).send({
        error: e.message,
        message: "Failed"
      })
    }
}

module.exports.unsubscribe = async (req, res) => {
    const { id_user, id_topic } = req.body
    try {
      if (id_user && id_topic) {
        Topics.findOne({topic_name: id_topic}, function(err, document) {
            if(err){
                res.status(500).send({
                      error: "Topic not available",
                      message: "Invalid topic"
                    });
                    return;
            }
            console.log(id_user)
            console.log(document._id)
             unsub = Subscriptions.deleteOne({ id_user: id_user, id_topic: document._id },
                    function(err, document) {
                        console.log(document)
                         res.status(200).send({
                           message: "success",
                           data: document,
                           error: null
                         })
                    })
       })
      } else {
        throw new Error("Some error occurred while Unsubscribing")
      }
    } catch (e) {
      res.status(500).send({
        error: e.message,
        message: "Failed"
      })
    }
}

module.exports.forwardRequest = async (req, res) => {
    const { id_user, id_topic } = req.body
    try {
      console.log("Received a new request");
      if (id_user && id_topic) {
        let topicAll = await Topics.find()
          var map1 = new Map();
          topicAll.map((cur) => {
            map1.set(String(cur._id),cur.topic_name);
          })
        Topics.findOne({topic_name: id_topic}, function(err, document) {
            if(err){
                res.status(500).send({
                      error: "Topic not available",
                      message: "Invalid topic"
                    });
                    return;
            }
             unsub = Messages.find({ id_topic: document._id },
                    function(err, document) {
                        result = []
                        document.map((cur)=>{
                            cur.id_topic = map1.get(String(cur.id_topic))
                            result.push(cur)
                        })
                        console.log("seng forward request message from broker3")
                        var response = new Object();
                          response.body = {"id_user" : id_user, "message":result}
                          stream.write(Buffer.from(JSON.stringify(response)))
                        /*axios.post("http://172.20.0.5:9000/notify",{
                            message: JSON.stringify(result),
                            id_user: id_user
                        }).then((response) => {
                            console.log("Sent");
                          }, (error) => {
                            console.log(error);
                          });
                         res.status(200).send({
                           message: "success",
                           error: null
                         })*/
                    })
       })
      } else {
        throw new Error("Some error occurred while Forwarding requests")
      }
    } catch (e) {
      /*res.status(500).send({
        error: e.message,
        message: "Failed"
      })*/
    }
}



module.exports.notify = async (req, res) => {
  const { id_user } = req.body
  let messages = []
  try {
    if (id_user) {
      let subTopics = await Subscriptions.find({id_user: id_user});
      let topicIds = subTopics.map(x => x.id_topic);
      // let messages = await Messages.aggregate()
      // .match({ "id_topic": {$in:topicIds }})
      let topicAll = await Topics.find({_id: topicIds})
      var map1 = new Map();
      var map2 = new Map()
      topicAll.map((cur) => {
        map1.set(cur._id,cur.topic_name);
        map2.set(cur.topic_name, cur._id)
      })
      var result = []
      var addresses = []
      let topicNames = topicAll.map(x => x.topic_name);
      let broker_list = await Pivot.aggregate()
      .match({"topic_name": {$in:topicNames}})
      broker_ids = []
      broker_names = []
      broker_list.map((cur) => {
        broker_ids.push(map2.get(cur.topic_name))
        broker_names.push(cur.broker_name)
      })
      let messages = await Messages.aggregate()
      .match({ "id_topic": {$in:broker_ids }})
      let addressList = await Neighbours.aggregate()
      .match({ "broker_name": {$in:broker_names }})
      broker_list.map(async (cur) => {
        if (cur.broker_name == 'B3'){
          result = messages.filter(item => String(item.id_topic) == String(map2.get(cur.topic_name)))
           /*result.map((cur) => {
                cur.id_topic = map1.get(String(cur.id_topic))
              })*/
        } else {
          addresses = addressList.filter(item => String(item.broker_name) == String(cur.broker_name))
          addresses.map((curr) => {
            axios.post(curr.address+"/broker/forwardRequest",{
                            id_topic: cur.topic_name,
                            id_user: id_user
                        }).then((response) => {
                            console.log("Sent from neighbour notify");
                          }, (error) => {
                            console.log(error);
                          });
          })
        }
      })
     console.log("send notify message from broker3")
     var response = new Object();
     response.body = {"id_user" : id_user, "message":result}
     stream.write(Buffer.from(JSON.stringify(response)))
      res.status(200).json({
          message: "success",
          data: "result",
          error: null
        })
    } else {
      throw new Error("Some error occurred while creating the Topic")
    }
  } catch (e) {
    res.status(500).send({
      error: e.message,
      message: "Failed"
    })
  }
}

module.exports.advertise = async (req, res) => {
  try {
    topics = await Topics.find()
    res.status(200).json({
      message: "success",
      data: topics,
      error: null
    })

  } catch (e) {
    res.status(500).json({
      error: e,
      message: "Failed"
    })
  }
}

module.exports.addTopic = (req, res) => {
  const { topic } = req.body
  console.log(topic)
  try {
    if (topic) {
      top = new Topics({ topic_name: topic })
      console.log(top)
      top.save()
      res.status(200).send({
        message: "success",
        data: top,
        error: null
      })
    } else {
      throw new Error("Some error occurred while creating the Topic")
    }
  } catch (e) {
    res.status(500).send({
      error: e.message,
      message: "Failed"
    })
  }
}

module.exports.addNeighbours= (req, res) => {
  const { broker_name,address } = req.body
  console.log(broker_name, address)
  try {
    if (broker_name && address) {
      neighbourInfo = new Neighbours({ broker_name: broker_name , address: address})
      console.log(neighbourInfo)
      neighbourInfo.save()
      res.status(200).send({
        message: "success",
        data: neighbourInfo,
        error: null
      })
    } else {
      throw new Error("Some error occurred while creating the Neighbours")
    }
  } catch (e) {
    res.status(500).send({
      error: e.message,
      message: "Failed"
    })
  }
}

module.exports.addPivotInfo= (req, res) => {
  const { broker_name, topic_name } = req.body
  console.log(broker_name)
  try {
    if (broker_name && topic_name) {
      pivotInfo = new Pivot({ broker_name: broker_name , topic_name: topic_name})
      pivotInfo.save()
      res.status(200).send({
        message: "success",
        data: pivotInfo,
        error: null
      })
    } else {
      throw new Error("Some error occurred while creating the Pivot table")

    }
  } catch (e) {
    res.status(500).send({
      error: e.message,
      message: "Failed"
    })
  }
}

module.exports.deadvertise= (req, res) => {
  //This will disable publishing of topics to subscriber
  const { topic } = req.body
    console.log(topic)
    try {
      if (topic) {
        top = new Topics({ topic_name: topic })
        console.log(top)
        top.save()
        res.status(200).send({
          message: "success",
          data: top,
          error: null
        })
      } else {
        throw new Error("Some error occurred while creating the Topic")
      }
    } catch (e) {
      res.status(500).send({
        error: e.message,
        message: "Failed"
      })
    }
}