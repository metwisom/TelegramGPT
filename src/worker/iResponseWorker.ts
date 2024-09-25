type ResponseWorker = {
  generateResponse(prompt: string, callback: (generatedMessage: string) => void): Promise<void>;
}

export {ResponseWorker};