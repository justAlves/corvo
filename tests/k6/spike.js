/**
 * SPIKE TEST — Sudden traffic burst
 *
 * Goal: simulate a viral moment — someone posts about Krewo and
 * traffic jumps from idle to 200 concurrent users in seconds.
 * Checks whether the server crashes, queues requests, or handles
 * it gracefully, and whether it recovers after the spike subsides.
 *
 * Run:
 *   k6 run tests/k6/spike.js \
 *     -e TEST_EMAIL=seu@email.com \
 *     -e TEST_PASSWORD=suasenha
 */

import { sleep } from 'k6';
import { THRESHOLDS } from './lib/config.js';
import { ensureAuthenticated, forceLogin } from './lib/auth.js';
import { anonymousVisitorFlow, dashboardEntryFlow } from './lib/flows.js';

export const options = {
  scenarios: {
    // Marketing site spike — anonymous users from a viral post
    site_spike: {
      executor: 'ramping-vus',
      startVUs: 5,
      stages: [
        { duration: '1m',  target: 5   }, // idle baseline
        { duration: '30s', target: 150 }, // spike!
        { duration: '2m',  target: 150 }, // sustained spike
        { duration: '30s', target: 5   }, // drop back
        { duration: '1m',  target: 5   }, // verify recovery
      ],
      tags: { scenario: 'site_spike' },
    },
    // Authenticated spike — existing users all log in at the same time
    // (e.g. right after a "we're back online" email)
    auth_spike: {
      executor: 'ramping-vus',
      startVUs: 2,
      stages: [
        { duration: '1m',  target: 2  },
        { duration: '30s', target: 50 }, // burst of logins
        { duration: '2m',  target: 50 },
        { duration: '30s', target: 2  },
        { duration: '1m',  target: 2  },
      ],
      tags: { scenario: 'auth_spike' },
    },
  },
  thresholds: {
    // During a spike we accept more latency but the server must not crash
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(99)<10000'], // 10s absolute ceiling
    'http_req_duration{scenario:site_spike}':  ['p(95)<5000'],
    'http_req_duration{scenario:auth_spike}':  ['p(95)<3000'],
  },
};

export default function () {
  const scenario = __ENV.K6_SCENARIO_NAME || 'site_spike';

  if (scenario === 'site_spike') {
    anonymousVisitorFlow();
    return;
  }

  // auth_spike: force a fresh login each iteration to stress the auth path
  forceLogin();
  dashboardEntryFlow();
}
