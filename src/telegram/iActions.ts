type Actions = {
  sendImage: (path: string) => void
  sendMessage: (generatedMessage: string) => void
  setTyping: () => void
  setUploading: () => void
  markRead: () => void
  sendEmoji: (emoji: string) => void
}

export {Actions};