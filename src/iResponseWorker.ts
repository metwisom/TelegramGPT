type ResponseWorker = {
  getResponse(prompt: string, asService: boolean): Promise<string>;
}

export {ResponseWorker};