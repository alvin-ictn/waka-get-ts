import "dotenv/config";
import moment from "moment";
import fetch from "node-fetch";
import fs from "fs";
import { extractLatestTimestamps, readJsonFile, writeJson } from "./libs/json-process.js";

let current = moment(new Date());

const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY;
const WAKATIME_ID = process.env.WAKATIME_ID;

let data = {};
async function fetchWakaTime(date) {
  const response = await fetch(
    `https://wakatime.com/api/v1/users/${WAKATIME_ID}/summaries?start=${date}&end=${date}`,
    {
      headers: {
        Authorization: `Basic ${WAKATIME_API_KEY}`,
      },
    }
  );
  const data = await response.json();
  const dataFetch = data.data[0]  
  console.log("DATA", data.data[0]);
}

let dadate = current.format("YYYY-MM-DD");
// fetchWakaTime(dadate);
// console.log("current", current.format("YYYY-MM-DD"));

let wakaData = await readJsonFile("./wakatime-alvin.ictngmail.com-a9b7492e11d446a89da8eb4c7708f9f3.json")
const summary = extractLatestTimestamps(wakaData.days);
// console.log("da", wakaData.days)
await writeJson('./output.json', summary); // change this if needed