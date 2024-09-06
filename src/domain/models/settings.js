import { model, Schema } from "mongoose";

const SettingsSchema = model(
  "Setting",
  new Schema({
    blacklist: {
      trends: {
        type: Array,
        default: [],
      },
      words: {
        type: Array,
        default: [],
      },
      users: {
        type: Array,
        default: [],
      },
    },
    pinWord: {
      enabled: {
        type: Boolean,
        default: false,
      },
      word: {
        type: String,
      },
      count: {
        type: Number,
      },
      position: {
        type: Number,
      },
    },
  })
);

export default SettingsSchema;
