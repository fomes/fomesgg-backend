// Original Repo
// https://github.com/gabrielhirakawa/lol-api-back

const express = require("express");
const { json } = require("express");
require("dotenv").config();

const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(json());
app.use(cors());
app.listen(process.env.PORT || 3000);

app.get('/', async (req, res) => {
  return res.status(200).send('<h1>Home Page</h1>');
})

app.get("/summoner/:name", async (req, res) => {
  const { name } = req.params;

  const summonerRes = await axios
    .get(
      `${process.env.LOL_URL}/lol/summoner/v4/summoners/by-name/${encodeURI(name)}`,
      { headers: { "X-Riot-Token": process.env.LOL_KEY } }
    )
    .catch((e) => {
      return res.status(e.response.status).json(e.response.data);
    });

  const { id, profileIconId, summonerLevel } = summonerRes.data;

  const rankedRes = await axios
    .get(`${process.env.LOL_URL}/lol/league/v4/entries/by-summoner/${id}`, {
      headers: { "X-Riot-Token": process.env.LOL_KEY },
    })
    .catch((e) => {
      return res.status(e.response.status).json(e.response.data);
    });

  const { tier, rank, wins, losses, queueType } = rankedRes.data[1]
    ? rankedRes.data[1]
    : rankedRes.data[0];

  res.json({
    iconUrl: `${process.env.LOL_ICONS}/${profileIconId}.png`,
    summonerLevel,
    tier,
    rank,
    wins,
    losses,
    queueType,
    winRate: ((wins / (wins + losses)) * 100).toFixed(1),
  });
});
