import fs from "fs/promises";
import path from "path";

/**
 * Reads a JSON file and parses it
 * @param {string} filePath
 * @returns {Promise<Object>}
 */
export async function readJsonFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    const data = await fs.readFile(fullPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading/parsing JSON:", err);
    throw err;
  }
}

/**
 * Processes WakaTime heartbeats and extracts latest time per dependency & language
 * @param {Array} days
 * @returns {Object}
 */
export function extractLatestTimestamps(days) {
  const result = {
    dependencies: {},
    languages: {},
  };

  const earliest = { dependencies: {}, languages: {} };
  const latest = { dependencies: {}, languages: {} };

  for (const day of days) {
    for (const hb of day.heartbeats) {
      const time = Math.floor(hb.time); // Round down to integer unix timestamp

      // Group by dependency
      if (hb.dependencies && hb.dependencies.length > 0) {
        for (const dep of hb.dependencies) {
          if (!result.dependencies[dep] || result.dependencies[dep] < time) {
            result.dependencies[dep] = time;
          }

          // Earliest
          if (
            !(dep in earliest.dependencies) ||
            time < earliest.dependencies[dep]
          ) {
            earliest.dependencies[dep] = time;
          }
          // Latest
          if (
            !(dep in latest.dependencies) ||
            time > latest.dependencies[dep]
          ) {
            latest.dependencies[dep] = time;
          }
        }
      }

      // Group by language
      const lang = hb.language;
      if (lang) {
        if (!result.languages[lang] || result.languages[lang] < time) {
          result.languages[lang] = time;
        }
        // Earliest
        if (!(lang in earliest.languages) || time < earliest.languages[lang]) {
          earliest.languages[lang] = time;
        }
        // Latest
        if (!(lang in latest.languages) || time > latest.languages[lang]) {
          latest.languages[lang] = time;
        }
      }
    }
  }

  return {
    result,
    earliest,
    latest
  };
}

/**
 * Writes an object to a JSON file
 * @param {string} outputPath
 * @param {Object} data
 */
export async function writeJson(outputPath, data) {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(path.resolve(outputPath), json, "utf-8");
}
