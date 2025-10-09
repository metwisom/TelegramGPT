import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'crypto';

const ensureDir = (filePath: string) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
};

const fileProvider = () => {
  return Object.freeze({
    saveFile: (url: string, destinationPath?: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        let outPath = destinationPath;
        if (!outPath) {
          outPath = `${crypto.createHash('sha1').update(Math.random().toString()).digest('hex')}.png`;
        }
        try {
          ensureDir(outPath);
          https.get(url, (response) => {
            if (response.statusCode === 200) {
              const fileStream = fs.createWriteStream(outPath as string);
              response.pipe(fileStream);
              fileStream.on('finish', () => {
                fileStream.close();
                console.log('File downloaded and saved to', outPath);
                resolve(outPath as string);
              });
              fileStream.on('error', (err) => reject(err));
            } else {
              reject(new Error('Failed to download file. Status code:' + response.statusCode));
            }
          }).on('error', (err) => {
            reject(new Error('Error downloading file:' + err.message));
          });
        } catch (err) {
          reject(err as Error);
        }
      });
    },
  });
};

export {fileProvider};