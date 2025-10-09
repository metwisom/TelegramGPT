import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import {config} from './config';

type UploadResult = {
  success: boolean;
  data?: any;
  error?: string;
};

async function uploadFile(source: string, number: number, source_id: number, filePath: string): Promise<UploadResult> {
  const host = config.memderHost;
  const uploadPath = config.memderUploadPath ?? '/api/upload';

  if (!host) {
    return {success: false, error: 'MEMDER_HOST is not configured'};
  }

  const url = `${host.replace(/\/$/, '')}${uploadPath}`;

  const form = new FormData();
  form.append('source', source);
  form.append('number', String(number));
  form.append('source_id', String(source_id));
  form.append('file', fs.createReadStream(filePath), path.basename(filePath));

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    } as any);

    if (response.ok) {
      const responseBody = await response.json();
      console.log('Upload response:', responseBody);
      return {success: true, data: responseBody};
    }
    const text = await response.text();
    console.error('Upload failed:', response.status, text);
    return {success: false, error: text};
  } catch (err) {
    console.error('Upload error:', err);
    return {success: false, error: (err as Error).message};
  }
}

export {uploadFile};