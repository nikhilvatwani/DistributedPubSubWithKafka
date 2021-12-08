module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      broker_name: {
         type: String,
         required: true
      },
      address: {
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

  const Neighbours = mongoose.model("neighbours", schema);
  return Neighbours;
};