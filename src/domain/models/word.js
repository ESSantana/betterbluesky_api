import { model, Schema } from "mongoose";

const WordSchema = model(
  "Word",
  new Schema({
    t: {
      //texto
      type: String,
      required: true,
    },
    ty: {
      //tipo (w = word, h = hashtag)
      type: String,
      required: true,
    },
    l: {
      //languages
      type: String,
      required: true,
    },
    ca: {
      //created at
      type: Date,
      immutable: true,
      default: () => new Date(),
    },
  })
);

async function deleteOlds(hours) {
  //apaga as words antes de x horas
  const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000); // Data e hora de x horas atrás

  const result = await this.deleteMany({ ca: { $lt: hoursAgo } });

  console.log(`
        -----------------------------------------------------------------------
        Removed before ${hours}h: ${result.deletedCount}
        -----------------------------------------------------------------------
    `);
}

Object.assign(WordSchema, { deleteOlds });


export default WordSchema;