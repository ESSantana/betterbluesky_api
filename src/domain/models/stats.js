import { model, Schema } from "mongoose";

const StatsSchema = model(
  "Stats",
  new Schema({
    action: {
      type: String,
      required: true,
    },
    data: {
      type: String,
      required: true,
    },
    createdAt: {
      //created at
      type: Date,
      immutable: true,
      default: () => new Date(),
    },
  })
);

export default StatsSchema
