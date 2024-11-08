import axios from "axios";


const httpProvider = (host: string, defaultHeader: Record<string, any> = {}) => {
  const mainHost = host;
  const defaultHeaders = defaultHeader;
  return Object.freeze({
    post: (path: string, data: Record<string, any> = {}, header: Record<string, any> = {}) => axios.post(
      mainHost + path,
      data,
      {
        headers: {
          ...defaultHeaders,
          ...header
        }
      })
      .then(response => {
        // console.log(response);
        return response.data;
      })
      .catch(error => error.response.data)
  });
};

export {httpProvider};