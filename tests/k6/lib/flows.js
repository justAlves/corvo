import http from 'k6/http';
import { check, sleep } from 'k6';
import { API, WEB, HEADERS_JSON } from './config.js';
import { authHeaders } from './auth.js';

// Realistic think time: random between min and max seconds
function think(min = 1, max = 3) {
  sleep(Math.random() * (max - min) + min);
}

/**
 * Anonymous visitor browsing the marketing site.
 * Simulates someone who found the homepage and is looking around.
 */
export function anonymousVisitorFlow() {
  const res = http.get(WEB, { tags: { name: 'homepage' } });
  check(res, { 'homepage: status 2xx': (r) => r.status >= 200 && r.status < 400 });
  think(2, 5);
}

/**
 * API health probe — lightweight, no auth needed.
 */
export function healthCheckFlow() {
  const res = http.get(`${API}/`, { tags: { name: 'health' } });
  check(res, { 'health: status 200': (r) => r.status === 200 });
}

/**
 * Returning user entering the dashboard.
 * Reproduces what the DashboardGuard does on every mount:
 * parallel calls to onboarding/me and billing/me.
 */
export function dashboardEntryFlow() {
  const responses = http.batch([
    ['GET', `${API}/onboarding/me`, null, { headers: authHeaders(), tags: { name: 'onboarding_me' } }],
    ['GET', `${API}/billing/me`,    null, { headers: authHeaders(), tags: { name: 'billing_me' } }],
  ]);

  check(responses[0], { 'onboarding/me: status 200': (r) => r.status === 200 });
  check(responses[1], { 'billing/me: status 200':    (r) => r.status === 200 });

  think(3, 8); // user reads the dashboard
}

/**
 * User navigating through dashboard sections.
 * Simulates a session where someone checks billing then goes back to dashboard.
 */
export function dashboardBrowseFlow() {
  // Check billing page
  const billing = http.get(`${API}/billing/me`, {
    headers: authHeaders(),
    tags: { name: 'billing_me' },
  });
  check(billing, { 'billing/me: status 200': (r) => r.status === 200 });
  think(2, 4);

  const onboarding = http.get(`${API}/onboarding/me`, {
    headers: authHeaders(),
    tags: { name: 'onboarding_me' },
  });
  check(onboarding, { 'onboarding/me: status 200': (r) => r.status === 200 });
  think(2, 6);
}

/**
 * Knowledge base read — user viewing their imported content.
 */
export function knowledgeFlow() {
  const res = http.get(`${API}/onboarding/knowledge`, {
    headers: authHeaders(),
    tags: { name: 'knowledge_list' },
  });
  check(res, { 'knowledge: status 200': (r) => r.status === 200 });
  think(1, 3);
}

// Realistic user questions to avoid identical requests hitting a cache
const CHAT_MESSAGES = [
  'Qual é o horário de atendimento?',
  'Vocês aceitam cartão de crédito?',
  'Como faço para agendar?',
  'Qual o endereço de vocês?',
  'Tem estacionamento no local?',
  'Quais serviços vocês oferecem?',
  'Vocês atendem aos finais de semana?',
  'Como funciona o cancelamento?',
  'Qual o prazo de entrega?',
  'Posso pagar em parcelas?',
];

function randomMessage() {
  return CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)];
}

/**
 * Playground chat — the core feature of Krewo.
 * Calls Gemini on every request. Latency will be higher than other
 * endpoints (typically 2–8s). Thresholds are set accordingly.
 *
 * Simulates a single turn; multi-turn conversations are approximated
 * by consecutive calls within the same VU iteration.
 */
export function playgroundChatFlow() {
  const res = http.post(
    `${API}/onboarding/playground/chat`,
    JSON.stringify({
      messages: [{ role: 'user', content: randomMessage() }],
    }),
    { headers: authHeaders(), tags: { name: 'playground_chat' } },
  );

  check(res, {
    'playground/chat: status 200': (r) => r.status === 200,
    'playground/chat: has reply': (r) => {
      try { return !!JSON.parse(r.body)?.reply; } catch { return false; }
    },
  });

  // Think time after reading the AI reply before potentially asking again
  sleep(Math.random() * 4 + 2);
}

/**
 * Multi-turn conversation — simulates a user having a short back-and-forth.
 * More realistic than single-turn for a chat-first product.
 */
export function playgroundConversationFlow() {
  const turns = Math.floor(Math.random() * 2) + 2; // 2 or 3 turns
  const history = [];

  for (let i = 0; i < turns; i++) {
    const userMsg = randomMessage();
    history.push({ role: 'user', content: userMsg });

    const res = http.post(
      `${API}/onboarding/playground/chat`,
      JSON.stringify({ messages: history }),
      { headers: authHeaders(), tags: { name: 'playground_chat' } },
    );

    const ok = check(res, {
      'playground/chat: status 200': (r) => r.status === 200,
      'playground/chat: has reply': (r) => {
        try { return !!JSON.parse(r.body)?.reply; } catch { return false; }
      },
    });

    if (!ok) break;

    try {
      const reply = JSON.parse(res.body).reply;
      history.push({ role: 'assistant', content: reply });
    } catch {
      break;
    }

    // User reads the reply before responding
    sleep(Math.random() * 5 + 3);
  }
}
