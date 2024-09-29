import axios from "axios";


const createTransport = (transportHeaders: Record<string, any>) => {
  const config = {headers: transportHeaders};
  return Object.freeze({
    send(path: string, data: Record<string, any>) {
      return axios.post(
        "https://api.openai.com/v1" + path,
        data,
        config
      );
    }

  });
};

export {createTransport};