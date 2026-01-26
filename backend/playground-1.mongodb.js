// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("b2b_platform");

// Create a new document in the collection.
// db.getCollection("specifications").drop(); // Uncomment to reset collection (WARNING: Deletes all data)
db.getCollection("specifications").deleteOne({
  _id: ObjectId("68fa758e045ef8d9cc5d9509"),
});
db.getCollection("specifications").insertOne({
  name: "hello world",
  required: true,
  type: "text",
  options: [""],
  isSearchable: false,
  isComparable: false,
  displayOrder: 0,
  _id: ObjectId("68fa758e045ef8d9cc5d9509"),
  createdAt: new Date("2025-10-23T18:35:58.357Z"),
  updatedAt: new Date("2025-10-23T18:35:58.357Z"),
});
