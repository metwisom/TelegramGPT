import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';

const httpProvider = (host: string, defaultHeader: Record<string, any> = {}) => {
  const client: AxiosInstance = axios.create({
    baseURL: host,
    headers: {
      ...defaultHeader,
    },
    timeout: 180_000,
  });

  const post = async (path: string, data: Record<string, any> = {}, header: Record<string, any> = {}) => {
    const config: AxiosRequestConfig = {headers: {...defaultHeader, ...header}};
      console.log("222")
    try {
      const res = await client.post(path, data, config);
      console.log("asdasd")
      return res.data;
    } catch (err: any) {
      if (err.response) return err.response.data;
      throw err;
    }
  };

  return Object.freeze({post});
};

export {httpProvider};