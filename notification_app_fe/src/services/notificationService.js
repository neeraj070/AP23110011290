import { requestJson } from './apiClient';
import { DEFAULT_NOTIFICATION_LIMIT } from '../config/api';
import { log } from '../middleware/logger';

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function getNotificationArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.notifications)) {
    return data.notifications;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

export function normalizeNotification(item, index, viewedIds, page = 1) {
  const id = String(
    firstDefined(item?.ID, item?.id, item?._id, item?.notificationId, item?.notification_id, `page-${page}-item-${index}`),
  );
  const rawType = firstDefined(item?.Type, item?.type, item?.notification_type, item?.notificationType, 'Event');
  const type = ['Event', 'Result', 'Placement'].includes(rawType) ? rawType : 'Event';
  const timestamp = firstDefined(
    item?.Timestamp,
    item?.timestamp,
    item?.createdAt,
    item?.created_at,
    item?.date,
    item?.time,
    new Date().toISOString(),
  );
  const message = String(
    firstDefined(item?.Message, item?.message, item?.content, item?.description, item?.title, 'No message provided.'),
  );

  return {
    id,
    type,
    message,
    timestamp,
    title: String(firstDefined(item?.Title, item?.title, `${type} notification`)),
    viewed: viewedIds.includes(id),
    raw: item || {},
  };
}

export async function fetchNotifications({ token, page = 1, limit = DEFAULT_NOTIFICATION_LIMIT, type, viewedIds = [] }) {
  const result = await requestJson('/notifications', {
    token,
    query: {
      limit,
      page,
      notification_type: type === 'All' ? '' : type,
    },
  });

  const sourceItems = getNotificationArray(result.data);
  const notifications = sourceItems.map((item, index) => normalizeNotification(item, index, viewedIds, page));
  const totalPages = Number(result.data?.totalPages || result.data?.total_pages || 0);
  const currentPage = Number(result.data?.page || page);
  const hasMore = totalPages ? currentPage < totalPages : notifications.length >= limit;

  await log(
    'frontend',
    'info',
    'api',
    `Fetched ${notifications.length} notifications for ${type || 'All'} page ${page} in ${result.durationMs}ms`,
  );

  return {
    notifications,
    hasMore,
    page: currentPage,
  };
}
