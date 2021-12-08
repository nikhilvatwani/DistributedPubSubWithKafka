
/*
const db = require("../models");
const Messages = db.messages;
const Topics = db.topics;
const Subscriptions = db.subscriptions;

module.exports.getProducts = async (req, res) => {
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
           res.status(200).send({
             message: "success",
             data: msg,
             error: null
           })
       })
    } else {
      throw new Error("Some error occurred while creating the Message")
    }
  } catch (e) {
    res.status(500).send({
      error: e.message,
      message: "Failed"
    })
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

module.exports.notify = async (req, res) => {
  const { id_user } = req.body
  let messages = []
  try {
    if (id_user) {
      let subTopics = await Subscriptions.find({id_user: id_user});
      let topicIds = subTopics.map(x => x.id_topic);
      let messages = await Messages.aggregate()
      .match({ "id_topic": {$in:topicIds }})

      let topicAll = await Topics.find()
      var map1 = new Map();
      topicAll.map((cur) => {
        map1.set(String(cur._id),cur.topic_name);
      })
      
      messages.map((cur) => {
        cur.id_topic = map1.get(String(cur.id_topic))
      })

      res.status(200).json({
          message: "success",
          data: messages,
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
}*/
