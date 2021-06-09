export const emojiMap: Record<string, string> = {
  very_good: '🤩',
  good: '😄',
  bad: '😕',
  very_bad: '😭',
}

export const getEmoji = (type: string): string | undefined => {
  return emojiMap[type]
}
