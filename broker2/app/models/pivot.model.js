module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      broker_name: {
         type: String,
         required: true
      },
      topic_name: {
          type: String,
          required: true
      }
      
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Pivot = mongoose.model("pivot", schema);
  return Pivot;
};