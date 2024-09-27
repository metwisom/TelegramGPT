const isEmoji = (codePoint: number) => (codePoint >= 0x2600 && codePoint <= 0x26FF) ||   // Символы разное
  (codePoint >= 0x2700 && codePoint <= 0x27BF) ||   // Символы разное (продолжение)
  (codePoint >= 0x1F600 && codePoint <= 0x1F64F) || // Эмоджи лиц
  (codePoint >= 0x1F300 && codePoint <= 0x1F5FF) || // Символы и пиктограммы
  (codePoint >= 0x1F680 && codePoint <= 0x1F6FF) || // Транспорт и карты
  (codePoint >= 0x1F700 && codePoint <= 0x1F77F) ||   // Астрологические символы
  (codePoint >= 0x1F780 && codePoint <= 0x1F7FF) ||   // Геометрические символы
  (codePoint >= 0x1F800 && codePoint <= 0x1F8FF) ||   // Дополнительные символы
  (codePoint >= 0x1F900 && codePoint <= 0x1F9FF) ||   // Дополнительные символы и модификаторы
  (codePoint >= 0x1FA00 && codePoint <= 0x1FA6F) ||   // Разные символы и знаки
  (codePoint >= 0x1F1E6 && codePoint <= 0x1F1FF);    // Флаги-


export {isEmoji};