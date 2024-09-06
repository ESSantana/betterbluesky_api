import { ComAtprotoSyncSubscribeRepos } from "atproto-firehose";
import { getHashtags } from "../utils/index.js";
import WordSchema from "../domain/models/word.js";

export function newMessageHandler(message, cache) {
  if (ComAtprotoSyncSubscribeRepos.isCommit(message)) {
    message.ops.forEach(async (op) => {
      if (!op?.payload) return;
      if (op.payload["$type"] != "app.bsky.feed.post") return;
      if (!op.payload.langs?.includes("pt")) return; //apenas em portugues

      const text = op.payload.text.trim();

      const posthashtags = getHashtags(text);
      const postwords = text
        .trim()
        .split(" ")
        .filter(
          (word) => word.length > 2 && word.length < 64 && !word.startsWith("#")
        );

      for (const hashtag of posthashtags) {
        if (hashtag.length > 2) {
          if (
            cache.settings.blacklist.trends
              .map((t) => t.toLowerCase())
              .includes(hashtag.toLowerCase())
          )
            return;
          if (
            cache.settings.blacklist.words.find((w) =>
              hashtag.toLowerCase().includes(w.toLowerCase())
            )
          )
            return;
          await WordSchema.create({
            t: hashtag,
            ty: "h",
            l: op.payload.langs.join(" "),
          });
        }
      }

      for (const word of postwords) {
        if (
          cache.settings.blacklist.trends
            .map((t) => t.toLowerCase())
            .includes(word.toLowerCase())
        )
          return;
        if (
          cache.settings.blacklist.words.find((w) =>
            word.toLowerCase().includes(w.toLowerCase())
          )
        )
          return;
        await WordSchema.create({
          t: word.toLowerCase(),
          ty: "w",
          l: op.payload.langs.join(" "),
        });
      }
    });
  }
}
