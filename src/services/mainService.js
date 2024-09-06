import SettingsSchema from "../domain/models/settings.js";
import WordSchema from "../domain/models/word.js";
import { removeDuplicate, mergeArray } from "../utils/index.js";

async function removeOldTrends() {
  await WordSchema.deleteOlds(3);
}

async function updateCacheTrending(cache) {
  const data = await getTrending(cache, 15, 6);
  cache.updateTrendingData(data);
  console.log(
    `=============================== Cache atualizado (${Date.now()}) ===============================`
  );
}

async function updateCacheSettings(cache) {
  const settings =
    (await SettingsSchema.findOne({})) || (await SettingsSchema.create({}));
  cache.settings.blacklist = settings.blacklist;
  cache.settings.pinWord = settings.pinWord;
}

async function getTrending(cache, hourlimit, recentlimit) {
  const hourwords = await getTrendingType(
    cache,
    hourlimit,
    "w",
    1.5 * 60 * 60 * 1000
  );
  const hourhashtags = await getTrendingType(
    cache,
    hourlimit,
    "h",
    1.5 * 60 * 60 * 1000
  );

  const recentwords = await getTrendingType(cache, 10, "w", 10 * 60 * 1000);
  const recenthashtags = await getTrendingType(cache, 10, "h", 10 * 60 * 1000);

  const _hourtrends = mergeArray(hourhashtags, hourwords);
  const _recenttrends = mergeArray(recenthashtags, recentwords);

  const hourtrends = removeDuplicate(_hourtrends).slice(0, hourlimit);
  const recenttrends = removeDuplicate(_recenttrends)
    .filter(
      (rt) =>
        !hourtrends.find((t) => t.text.toLowerCase() === rt.text.toLowerCase())
    )
    .slice(0, recentlimit);

  const trends = removeDuplicate([...hourtrends, ...recenttrends]);

  if (cache.settings.pinWord.enabled) {
    trends.splice(cache.settings.pinWord.position, 0, {
      text: cache.settings.pinWord.word,
      count: cache.settings.pinWord.count,
      type: "special",
    });
    console.log(
      `PINNED WORD: [${cache.settings.pinWord.position}] ${cache.settings.pinWord.word} (${cache.settings.pinWord.count})`
    );
  }

  return trends;
}

async function getTrendingType(cache, limit, type, time) {
  const hoursAgo = new Date(Date.now() - time); // Data e hora de x horas atrás

  const result = await WordSchema.aggregate([
    {
      $match: {
        ca: { $gte: hoursAgo }, // Filtra documentos criados nos últimos x horas
        ty: type,
      },
    },
    {
      $group: {
        _id: "$t", // Agrupar por palavra
        count: { $sum: 1 }, // Contar o número de ocorrências
      },
    },
    {
      $sort: { count: -1 }, // Ordenar por contagem em ordem decrescente
    },
    {
      $limit: limit + 9, // Limitar o resultado para as palavra mais frequente
    },
  ]);

  return result
    .filter(
      (obj) =>
        !cache.settings.blacklist.trends
          .map((t) => t.toLowerCase())
          .includes(obj._id.toLowerCase()) &&
        !cache.settings.blacklist.words.find((word) =>
          obj._id.toLowerCase().includes(word.toLowerCase())
        )
    )
    .map((obj) => {
      return { text: obj._id, count: obj.count, timefilter: time };
    })
    .slice(0, limit);
}

export { updateCacheTrending, updateCacheSettings, removeOldTrends };
