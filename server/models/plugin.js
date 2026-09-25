// Adds a clean `id` string field to every model's JSON output (instead of
// Mongo's `_id`/`__v`), so the existing admin panel & customer site code
// (which was written expecting SQLite-style numeric `id` fields) keeps
// working without any changes.
function idPlugin(schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = ret._id ? ret._id.toString() : ret.id;
      delete ret._id;
      return ret;
    },
  });
  schema.set('toObject', { virtuals: true });
}

module.exports = idPlugin;
