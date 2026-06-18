/**
 * LOAD TEST — Normal peak traffic com foco em playground chat
 *
 * Distribuição de tráfego simulada:
 *   - 40% conversa multi-turn no playground (principal feature)
 *   - 20% chat single-turn (sessão rápida)
 *   - 20% usuário autenticado navegando no dashboard
 *   - 20% visitante anônimo na landing
 *
 * Run:
 *   k6 run tests/k6/load.js \
 *     -e TEST_EMAIL=seu@email.com \
 *     -e TEST_PASSWORD=suasenha
 */

import { sleep } from 'k6';
import { THRESHOLDS } from './lib/config.js';
import { ensureAuthenticated } from './lib/auth.js';
import {
  anonymousVisitorFlow,
  healthCheckFlow,
  dashboardEntryFlow,
  dashboardBrowseFlow,
  knowledgeFlow,
  playgroundChatFlow,
  playgroundConversationFlow,
} from './lib/flows.js';

export const options = {
  scenarios: {
    // Usuários usando o chat ativamente — cenário principal
    chat_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 5 }, // ramp up
        { duration: '6m', target: 5 }, // hold
        { duration: '1m', target: 0 }, // ramp down
      ],
      tags: { scenario: 'chat_users' },
    },
    // Usuários navegando no dashboard (sem chat)
    dashboard_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 3 },
        { duration: '6m', target: 3 },
        { duration: '1m', target: 0 },
      ],
      tags: { scenario: 'dashboard_users' },
    },
    // Visitantes anônimos na landing
    anonymous_visitors: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 3 },
        { duration: '6m', target: 3 },
        { duration: '1m', target: 0 },
      ],
      tags: { scenario: 'anonymous_visitors' },
    },
  },
  thresholds: {
    ...THRESHOLDS,
    // Dashboard e auth devem continuar rápidos mesmo com AI rodando em paralelo
    'http_req_duration{name:onboarding_me}': ['p(95)<1000'],
    'http_req_duration{name:billing_me}':    ['p(95)<1000'],
    // Chat: tolerância maior por conta do Gemini
    'http_req_duration{name:playground_chat}': ['p(95)<15000', 'p(99)<30000'],
  },
};

export default function () {
  const scenario = __ENV.K6_SCENARIO_NAME || 'chat_users';

  if (scenario === 'anonymous_visitors') {
    anonymousVisitorFlow();
    return;
  }

  if (scenario === 'dashboard_users') {
    if (!ensureAuthenticated()) { sleep(2); return; }
    const roll = Math.random();
    if (roll < 0.5) dashboardEntryFlow();
    else if (roll < 0.8) dashboardBrowseFlow();
    else knowledgeFlow();
    return;
  }

  // chat_users: foco no playground
  if (!ensureAuthenticated()) { sleep(2); return; }

  // Entra no dashboard primeiro (simula navegação real)
  dashboardEntryFlow();

  // Depois vai pro chat — 60% conversa multi-turn, 40% single-turn
  if (Math.random() < 0.6) {
    playgroundConversationFlow();
  } else {
    playgroundChatFlow();
  }
}
