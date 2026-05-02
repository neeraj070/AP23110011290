const TYPE_WEIGHTS = {
  Placement: 3000,
  Result: 2000,
  Event: 1000,
};

const UNREAD_BONUS = 5000;
const RECENCY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function getPriorityScore(notification) {
  const typeScore = TYPE_WEIGHTS[notification.type] || 500;
  const unreadScore = notification.viewed ? 0 : UNREAD_BONUS;
  const createdAt = new Date(notification.timestamp).getTime();
  const ageMs = Number.isFinite(createdAt) ? Math.max(Date.now() - createdAt, 0) : RECENCY_WINDOW_MS;
  const recencyScore = Math.max(0, 1000 - Math.floor((ageMs / RECENCY_WINDOW_MS) * 1000));

  return typeScore + unreadScore + recencyScore;
}

export function getPriorityNotifications(notifications, limit = 10) {
  return [...notifications]
    .filter((notification) => !notification.viewed)
    .map((notification) => ({
      ...notification,
      priorityScore: getPriorityScore(notification),
    }))
    .sort((left, right) => {
      if (right.priorityScore !== left.priorityScore) {
        return right.priorityScore - left.priorityScore;
      }

      const leftTime = new Date(left.timestamp).getTime() || 0;
      const rightTime = new Date(right.timestamp).getTime() || 0;
      return rightTime - leftTime || String(left.id).localeCompare(String(right.id));
    })
    .slice(0, limit);
}
