/**
 * SOAK TEST — Resistência com chat ativo por tempo prolongado
 *
 * Goal: manter carga moderada com chat real por 30+ min para detectar:
 *   - Memory leak no processo Bun/Elysia (heap cresce, GC fica pesado)
 *   - Connection pool do PostgreSQL não devolvendo conexões
 *   - Rate limit acumulado do Gemini ao longo do tempo
 *   - Sessions do Better Auth acumulando sem expirar
 *   - Drift de latência: p95 subindo gradualmente hora a hora
 *
 * Run (30 min):
 *   k6 run tests/k6/soak.js \
 *     -e TEST_EMAIL=seu@email.com \
 *     -e TEST_PASSWORD=suasenha
 *
 * Run (2h — para confiança real):
 *   k6 run tests/k6/soak.js -e SOAK_DURATION=2h \
 *     -e TEST_EMAIL=seu@email.com \
 *     -e TEST_PASSWORD=suasenha
 */

import { sleep } from 'k6';
import { THRESHOLDS } from './lib/config.js';
import { ensureAuthenticated, forceLogin } from './lib/auth.js';
import {
  anonymousVisitorFlow,
  healthCheckFlow,
  dashboardEntryFlow,
  dashboardBrowseFlow,
  playgroundChatFlow,
  playgroundConversationFlow,
} from './lib/flows.js';

const SOAK_DURATION = __ENV.SOAK_DURATION || '30m';
const SESSION_REFRESH_EVERY = 30; // força novo login a cada N iterações

export const options = {
  stages: [
    { duration: '2m',          target: 15 }, // ramp suave
    { duration: SOAK_DURATION, target: 15 }, // sustentado
    { duration: '2m',          target: 0  }, // ramp down
  ],
  thresholds: {
    ...THRESHOLDS,
    // Em soak com AI, o p99 pode subir por filas do Gemini — monitorar drift
    'http_req_duration{name:playground_chat}': ['p(95)<15000', 'p(99)<30000'],
    // Infra deve permanecer estável independente do AI
    'http_req_duration{name:onboarding_me}': ['p(95)<1000'],
    'http_req_duration{name:billing_me}':    ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

let _iteration = 0;

export default function () {
  _iteration++;

  // Refresh de sessão periódico — sessions expiram em runs longos
  if (_iteration % SESSION_REFRESH_EVERY === 0) {
    forceLogin();
  } else {
    if (!ensureAuthenticated()) { sleep(3); return; }
  }

  // Distribuição que reflete uso real: chat é a feature principal
  const roll = Math.random();
  if (roll < 0.05) {
    anonymousVisitorFlow();             //  5% — visitantes
  } else if (roll < 0.10) {
    healthCheckFlow();                  //  5% — probes
  } else if (roll < 0.20) {
    dashboardEntryFlow();               // 10% — entrar no dashboard
  } else if (roll < 0.30) {
    dashboardBrowseFlow();              // 10% — navegar no dashboard
  } else if (roll < 0.65) {
    playgroundConversationFlow();       // 35% — conversa multi-turn (mais realista)
  } else {
    playgroundChatFlow();               // 35% — single-turn rápido
  }
}
