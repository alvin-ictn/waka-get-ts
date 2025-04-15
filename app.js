import "dotenv/config";
import moment from "moment";
import fetch from "node-fetch";
import fs from "fs";
import {
  extractLatestTimestamps,
  readJsonFile,
  writeJson,
} from "./libs/json-process.js";
import { supabase } from "./libs/supabase.js";

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
  const dataFetch = data.data[0];
  console.log("DATA", data.data[0]);
}

let dadate = current.format("YYYY-MM-DD");
// fetchWakaTime(dadate);
// console.log("current", current.format("YYYY-MM-DD"));

// let wakaData = await readJsonFile("./wakatime-alvin.ictngmail.com-a9b7492e11d446a89da8eb4c7708f9f3.json")
// const summary = extractLatestTimestamps(wakaData.days);
// await writeJson('./result.json', summary.result);
// await writeJson('./earliest.json', summary.earliest);
// await writeJson('./latest.json', summary.latest);

const earliest = await readJsonFile("./earliest.json");
const latest = await readJsonFile("./latest.json");

const { data: supabaseData, error: fetchError } = await supabase
  .from("wakatime_logs")
  .select("*");

const tech_stacks = supabaseData.map((e) => e.name);

const combineEarliest = { ...earliest.dependencies, ...earliest.languages };
const combineLatest = { ...latest.dependencies, ...latest.languages };

const earliestKeys = Object.keys(combineEarliest);

const earliestTimeStacks = tech_stacks.map((e) => ({
  [e]: combineEarliest[e],
}));
const latestTimeStacks = tech_stacks.map((e) => ({ [e]: combineEarliest[e] }));

// {
// id: 'c48cdd45-6ac5-420b-849a-3d981306b9cf',
// name: 'CSS',
// total_seconds: 130707.733889,
// percent: 1.6,
// digital: '36:18',
// decimal: '36.30',
// text: '36 hrs 18 mins',
// hours: 36,
// minutes: 18,
// type: 'style',
// category: 'frontend',
// platform: null,
// framework: null,
// state: null,
// inserted_at: '2025-04-15T03:12:20.163+00:00',
// updated_at: '2025-04-15T18:02:32.524+00:00'
// }
const updatedData = supabaseData.reduce((acc, curr) => {
  return [
    ...acc,
    {
      ...curr,
      inserted_at: moment
        .unix(combineEarliest[curr.name])
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      updated_at: moment
        .unix(combineLatest[curr.name])
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
    },
  ];
}, []);

const { error: upsertError } = await supabase
.from("wakatime_logs")
.upsert(updatedData, { onConflict: "name" });
console.log("updatedData", upsertError);