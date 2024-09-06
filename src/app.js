import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import { subscribeRepos } from "atproto-firehose";

import {
  updateCacheSettings,
  updateCacheTrending,
  removeOldTrends,
} from "./services/mainService.js";
import Cache from "./domain/entities/cache.js";
import { getStats, getTrends } from "./routes/index.js";
import { newMessageHandler } from "./services/eventListenerService.js";

const cacheInstance = new Cache();
console.log("init cache: ", cacheInstance);

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

app.get("/api/trends", (req, res) => getTrends(req, res, cacheInstance));
app.post("/api/stats", (req, res) => getStats(req, res, cacheInstance));
app.get("*", (_, res) => res.status(404).send({ message: "Route not found" }));
app.post("*", (_, res) => res.status(404).send({ message: "Route not found" }));

app.listen(process.env.PORT, async () => {
  await mongoose
    .connect(process.env.MONGODB)
    .then(() => {
      updateCacheTrending(cacheInstance);
      updateCacheSettings(cacheInstance);
    })
    .catch((err) => {
      console.log("error connection:", err);
    });
  removeOldTrends(3);

  console.log("cache after server start:", cacheInstance);

  console.log(`Aplicativo iniciado em ${process.env.PORT}`);
});

const client = subscribeRepos(`wss://bsky.network`, { decodeRepoOps: true });
client.on("message", (message) => newMessageHandler(message, cacheInstance));

// updateCacheSettings();
// updateCacheTrending();

// setInterval(async () => {
//   await updateCacheTrending();
//   await updateCacheSettings();
// }, 30 * 1000);

// setInterval(() => {
//   deleteOlds(3);
// }, 1000 * 60 * 60 * 1);

scheduleRoutine();

setInterval(() => {
  console.log("cache after 30s: ", cacheInstance);
  console.log(`Últimos 30s: ${cacheInstance.stats.last30sRequestTrends}`);
  cacheInstance.resetLast30sRequestCount();
}, 1000 * 30);

setInterval(() => {
  console.log("cache after 60s: ", cacheInstance);
  console.log(`Últimos 60s: ${cacheInstance.stats.last60sRequestTrends}`);
  cacheInstance.resetLast60sRequestCount();
}, 1000 * 60);
