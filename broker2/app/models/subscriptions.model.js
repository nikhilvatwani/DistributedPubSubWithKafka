module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      id_user: {
         type: Number,
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

  const Subscriptions = mongoose.model("subscriptions", schema);
  return Subscriptions;
};