import https from "node:https";
import fs from "node:fs";
import crypto from "crypto";


const fileProvider = () => {
  return Object.freeze({
    saveFile: (url: string, path: string = undefined): Promise<string> => {
      return new Promise((resolve, reject) => {

        if (path == undefined) {
          path = "" + crypto.createHash("sha1").update(Math.random().toString()).digest("hex") + ".png";
        }
        https.get(url, (response) => {
          if (response.statusCode === 200) {
            const fileStream = fs.createWriteStream(path);
            response.pipe(fileStream);
            fileStream.on("finish", async () => {
              fileStream.close();
              resolve(path);
              console.log("File downloaded and saved to", path);
            });
          } else {
            reject(new Error("Failed to download file. Status code:" + response.statusCode));
          }
        }).on("error", (err) => {
          reject(new Error("Error downloading file:" + err.message));
        });
      });
    }
  });
};

export {fileProvider};