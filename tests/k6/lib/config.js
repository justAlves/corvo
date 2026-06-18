export const API = __ENV.API_URL || 'https://api.krewo.app';
export const WEB = __ENV.WEB_URL || 'https://krewo.app';

// Set via: k6 run -e TEST_EMAIL=... -e TEST_PASSWORD=...
export const CREDS = {
  email: __ENV.TEST_EMAIL || '',
  password: __ENV.TEST_PASSWORD || '',
};

if (!CREDS.email || !CREDS.password) {
  throw new Error('TEST_EMAIL and TEST_PASSWORD env vars are required');
}

export const HEADERS_JSON = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// Thresholds used across all test types
export const THRESHOLDS = {
  // At most 1% of requests can fail
  http_req_failed: ['rate<0.01'],
  // 95th percentile under 2s, 99th under 5s (non-AI endpoints)
  http_req_duration: ['p(95)<2000', 'p(99)<5000'],
  // Login specifically should be fast
  'http_req_duration{name:login}': ['p(95)<1500'],
  // AI chat endpoint — Gemini adds latency; higher tolerance is expected
  'http_req_duration{name:playground_chat}': ['p(95)<15000', 'p(99)<30000'],
};
