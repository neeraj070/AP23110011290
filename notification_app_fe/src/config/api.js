export const REMOTE_API_BASE_URL = 'http://20.207.122.201/evaluation-service';

export const API_BASE_URL = import.meta.env.DEV ? '/evaluation-service' : REMOTE_API_BASE_URL;

export const NOTIFICATION_TYPES = ['Event', 'Result', 'Placement'];

export const DEFAULT_NOTIFICATION_LIMIT = 10;
