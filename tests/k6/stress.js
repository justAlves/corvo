/**
 * STRESS TEST — Encontrar o limite com chat ativo
 *
 * Goal: aumentar progressivamente o número de usuários fazendo chat
 * simultâneo até o sistema degradar. Cada VU faz chamadas ao Gemini,
 * então o gargalo pode ser:
 *   - Rate limit do Gemini (429)
 *   - Connection pool do PostgreSQL esgotado
 *   - CPU/memória da instância
 *   - Timeout do Elysia/Bun
 *
 * Observe qual VU count dispara os primeiros erros — esse é o seu limite atual.
 *
 * Run:
 *   k6 run tests/k6/stress.js \
 *     -e TEST_EMAIL=seu@email.com \
 *     -e TEST_PASSWORD=suasenha
 */

import { sleep } from 'k6';
import { ensureAuthenticated } from './lib/auth.js';
import {
  dashboardEntryFlow,
  playgroundChatFlow,
  playgroundConversationFlow,
} from './lib/flows.js';

export const options = {
  stages: [
    { duration: '2m', target: 10  }, // aquecimento — carga normal
    { duration: '3m', target: 20  }, // zona confortável
    { duration: '3m', target: 40  }, // stress moderado
    { duration: '3m', target: 60  }, // stress pesado
    { duration: '3m', target: 80  }, // zona crítica
    { duration: '3m', target: 80  }, // manter no pico — observar estabilidade
    { duration: '3m', target: 0   }, // recovery — p95 deve voltar ao normal
  ],
  thresholds: {
    // No stress toleramos mais erros — queremos ver onde o cliff acontece
    http_req_failed: ['rate<0.10'],
    // AI pode degradar bastante; estamos medindo o comportamento, não passando em SLA
    'http_req_duration{name:playground_chat}': ['p(99)<60000'],
    // Endpoints de infra devem se manter responsivos mesmo sob stress de AI
    'http_req_duration{name:onboarding_me}': ['p(95)<3000'],
    'http_req_duration{name:billing_me}':    ['p(95)<3000'],
  },
};

export default function () {
  if (!ensureAuthenticated()) { sleep(3); return; }

  // Simula o fluxo real: entra no dashboard e vai pro chat
  dashboardEntryFlow();

  if (Math.random() < 0.6) {
    playgroundConversationFlow();
  } else {
    playgroundChatFlow();
  }
}
