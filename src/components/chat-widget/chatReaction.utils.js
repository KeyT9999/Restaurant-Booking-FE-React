export const ALLOWED_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export function getReactionSummary(reactions = []) {
  return reactions.reduce((summary, reaction) => {
    if (!reaction?.emoji) return summary;
    summary[reaction.emoji] = (summary[reaction.emoji] || 0) + 1;
    return summary;
  }, {});
}

export function getMyReaction(reactions = [], userId) {
  if (!userId) return null;
  return reactions.find((reaction) => reaction.userId === userId)?.emoji || null;
}

export function mergeReactionUpdate(messages = [], update = {}) {
  return messages.map((message) => {
    if (message.id !== update.messageId) return message;

    return {
      ...message,
      reactions: update.reactions || [],
      reactionSummary: update.reactionSummary || getReactionSummary(update.reactions || []),
    };
  });
}
