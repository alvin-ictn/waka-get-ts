import fs from "fs/promises";

export async function readJsonFile(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      const data = await fs.readFile(fullPath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading/parsing JSON:', err);
      throw err;
    }
  }