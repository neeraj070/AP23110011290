import { useCallback, useEffect, useMemo, useState } from 'react';
import DiagnosticsPanel from '../components/DiagnosticsPanel';
import FilterTabs from '../components/FilterTabs';
import NotificationDetailModal from '../components/NotificationDetailModal';
import NotificationList from '../components/NotificationList';
import PriorityInbox from '../components/PriorityInbox';
import StatusMessage from '../components/StatusMessage';
import TopBar from '../components/TopBar';
import { DEFAULT_NOTIFICATION_LIMIT } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { log } from '../middleware/logger';
import { ApiError } from '../services/apiClient';
import { fetchNotifications } from '../services/notificationService';
import { getPriorityNotifications } from '../utils/priorityScore';
import { getViewedIds, markViewed } from '../utils/storage';

function mergeById(current, incoming) {
  const map = new Map();
  current.forEach((item) => map.set(item.id, item));
  incoming.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

function applyViewedState(notifications, viewedIds) {
  return notifications.map((notification) => ({
    ...notification,
    viewed: viewedIds.includes(notification.id),
  }));
}

function friendlyError(error) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return error?.message || 'Something went wrong while loading notifications.';
}

export default function DashboardPage() {
  const { getAccessToken, forceReauthenticate } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [viewedIds, setViewedIds] = useState(getViewedIds());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.viewed).length, [notifications]);
  const priorityNotifications = useMemo(() => getPriorityNotifications(notifications), [notifications]);

  const loadPage = useCallback(
    async ({ nextPage = 1, filter = activeFilter, append = false } = {}) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError('');

      try {
        let token = await getAccessToken();
        let result;

        try {
          result = await fetchNotifications({
            token,
            page: nextPage,
            limit: DEFAULT_NOTIFICATION_LIMIT,
            type: filter,
            viewedIds: getViewedIds(),
          });
        } catch (error) {
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            await log('frontend', 'warn', 'auth', 'Notification request was unauthorized; retrying after re-authentication');
            token = await forceReauthenticate();
            result = await fetchNotifications({
              token,
              page: nextPage,
              limit: DEFAULT_NOTIFICATION_LIMIT,
              type: filter,
              viewedIds: getViewedIds(),
            });
          } else {
            throw error;
          }
        }

        setNotifications((current) => {
          const merged = append ? mergeById(current, result.notifications) : result.notifications;
          return applyViewedState(merged, getViewedIds());
        });
        setPage(result.page || nextPage);
        setHasMore(result.hasMore);
      } catch (error) {
        const message = friendlyError(error);
        setError(message);
        await log('frontend', 'error', 'api', `Notification fetch failed: ${message}`);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeFilter, forceReauthenticate, getAccessToken],
  );

  useEffect(() => {
    loadPage({ nextPage: 1, filter: activeFilter, append: false });
  }, [activeFilter, loadPage]);

  async function handleFilterChange(filter) {
    if (filter === activeFilter) {
      return;
    }

    setActiveFilter(filter);
    setNotifications([]);
    setPage(1);
    setHasMore(false);
    await log('frontend', 'info', 'state', `Filter changed to ${filter}`);
  }

  async function handleLoadMore() {
    await log('frontend', 'info', 'page', `Loading notification page ${page + 1}`);
    await loadPage({ nextPage: page + 1, filter: activeFilter, append: true });
  }

  async function handleOpenNotification(notification) {
    const nextViewedIds = markViewed(notification.id);
    setViewedIds(nextViewedIds);
    setNotifications((current) => applyViewedState(current, nextViewedIds));
    setSelectedNotification({
      ...notification,
      viewed: true,
    });
    await log('frontend', 'info', 'component', `Viewed notification ${notification.id}`);
  }

  return (
    <main className="dashboard-shell">
      <TopBar unreadCount={unreadCount} />

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <PriorityInbox notifications={priorityNotifications} onOpen={handleOpenNotification} />
          <DiagnosticsPanel />
        </aside>

        <section className="dashboard-main" aria-labelledby="notifications-heading">
          <div className="section-heading-row section-heading-row-main">
            <div className="section-heading-copy">
              <p className="section-kicker">Protected API feed</p>
              <h2 className="section-title" id="notifications-heading">
                Notifications
              </h2>
            </div>
            <FilterTabs activeFilter={activeFilter} onChange={handleFilterChange} disabled={loading} />
          </div>

          {error && notifications.length ? <StatusMessage type="error" title="Latest request failed" message={error} /> : null}

          <NotificationList notifications={notifications} onOpen={handleOpenNotification} loading={loading} error={error} />

          <div className="load-more-row">
            {hasMore ? (
              <button className="secondary-button load-more-button" type="button" disabled={loadingMore || loading} onClick={handleLoadMore}>
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            ) : notifications.length ? (
              <span className="end-of-list">No more notifications for this filter.</span>
            ) : null}
          </div>
        </section>
      </div>

      <NotificationDetailModal notification={selectedNotification} onClose={() => setSelectedNotification(null)} />
    </main>
  );
}
