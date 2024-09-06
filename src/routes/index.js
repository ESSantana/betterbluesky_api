export function getTrends(req, res, cache) {
  console.log(`[${Date.now()}] GET - /trends (${req.query.updateCount})`);
  res.json(cache.trending);
  cache.stats.last30sRequestTrends++;
  cache.stats.last60sRequestTrends++;

  console.log("cache after request: ", cache);
}

export async function getStats(req, res, _) {
  const sessionID = req.query.sessionID;

  if (!sessionID)
    return res.status(400).json({ message: "sessionID is required" });
  if (typeof sessionID != "string")
    return res.status(400).json({ message: "sessionID must be an string" });

  const event = req.query.action; //action because "event" cause an error

  if (!event) return res.status(400).json({ message: "event is required" });
  if (typeof event != "string")
    return res.status(400).json({ message: "event must be an string" });

  if (!["trends.click"].includes(event))
    return res.status(400).json({ message: "invalid event" });

  const data = req.query.data;

  if (!data) return res.status(400).json({ message: "data is required" });
  if (typeof data != "string")
    return res.status(400).json({ message: "data must be an string" });

  StatsSchema.create({
    event: event,
    data: data,
    sessionID: sessionID,
  });

  return res.json({ ok: true });
}
