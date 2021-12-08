module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      message: {
          type: String,
          required: true
      },
     id_topic: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Topics"
     }
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Messages = mongoose.model("messages", schema);
  return Messages;
};