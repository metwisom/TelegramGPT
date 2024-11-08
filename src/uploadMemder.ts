import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function uploadFile(source:string,number:number,filePath:string) {
  const form = new FormData();

  // Добавляем поля формы
  form.append('source', source);
  form.append('number', number);

  // Добавляем файл
  form.append('file', fs.createReadStream(filePath), path.basename(filePath));

  // Отправка POST запроса
  const response = await fetch('https://memder.metwisom.ru/api/upload', {
    method: 'POST',
    body: form,
    headers: form.getHeaders(), // Устанавливаем правильные заголовки для multipart/form-data
  });

  // Проверка на успешный ответ
  if (response.ok) {
    const responseBody = await response.json();
    console.log('Ответ от сервера:', responseBody);
  } else {
    console.log('Ошибка при загрузке файла:', response.statusText);
  }
}

export {uploadFile}