# Krewo — k6 Load Test Suite

## Pré-requisitos

```bash
# Instalar k6: https://grafana.com/docs/k6/latest/set-up/install-k6/
brew install k6          # macOS
# ou
sudo apt install k6      # Ubuntu/Debian
```

Crie uma conta de teste dedicada em https://krewo.app antes de rodar.
**Nunca use credenciais de usuário real.**

---

## Variáveis de ambiente obrigatórias

| Variável        | Descrição                            |
|-----------------|--------------------------------------|
| `TEST_EMAIL`    | Email da conta de teste              |
| `TEST_PASSWORD` | Senha da conta de teste              |
| `API_URL`       | Base da API (padrão: produção)       |
| `WEB_URL`       | Base do frontend (padrão: produção)  |

---

## Rodando os testes

### Load — carga normal (8 min, ~42 VUs pico)
```bash
k6 run tests/k6/load.js \
  -e TEST_EMAIL=teste@krewo.app \
  -e TEST_PASSWORD=suasenha
```
**Quando usar:** baseline de performance, antes de cada deploy relevante.

### Stress — encontrar o limite (20 min, até 200 VUs)
```bash
k6 run tests/k6/stress.js \
  -e TEST_EMAIL=teste@krewo.app \
  -e TEST_PASSWORD=suasenha
```
**O que observar:** em qual VU count o p95 estoura 5s ou o error rate passa de 5%.

### Spike — burst repentino (5 min, 5→150 VUs instantâneo)
```bash
k6 run tests/k6/spike.js \
  -e TEST_EMAIL=teste@krewo.app \
  -e TEST_PASSWORD=suasenha
```
**O que observar:** o servidor cai? Volta ao normal depois do spike?

### Soak — resistência (30 min, 25 VUs constantes)
```bash
k6 run tests/k6/soak.js \
  -e TEST_EMAIL=teste@krewo.app \
  -e TEST_PASSWORD=suasenha

# Versão estendida (2h — para confiança real em produção):
k6 run tests/k6/soak.js \
  -e TEST_EMAIL=teste@krewo.app \
  -e TEST_PASSWORD=suasenha \
  -e SOAK_DURATION=2h
```
**O que observar:** p95 subindo gradualmente ao longo do tempo (memory leak / connection exhaustion).

---

## Gerando relatório HTML

```bash
k6 run tests/k6/load.js \
  -e TEST_EMAIL=... \
  -e TEST_PASSWORD=... \
  --out json=results/load.json

# Converte para HTML (requer k6 reporter):
npx k6-reporter results/load.json
```

---

## Scenarios e flows

| Flow                  | Descrição                                              | Auth? |
|-----------------------|--------------------------------------------------------|-------|
| `anonymousVisitorFlow`| GET krewo.app (homepage)                               | Não   |
| `healthCheckFlow`     | GET api.krewo.app/ (health probe)                      | Não   |
| `dashboardEntryFlow`  | GET /onboarding/me + /billing/me em paralelo (guard)   | Sim   |
| `dashboardBrowseFlow` | Navegar entre billing e onboarding state               | Sim   |
| `knowledgeFlow`       | GET /onboarding/knowledge                              | Sim   |
| `playgroundChatFlow`  | POST /onboarding/playground/chat (chama Gemini)        | Sim   |

> **Atenção:** `playgroundChatFlow` não está incluído nos testes de load/stress/soak
> porque chama a API do Gemini a cada request (custa dinheiro e tem rate limit próprio).
> Use apenas em testes manuais pontuais.

---

## Thresholds (o que faz o teste falhar)

| Métrica                   | Limite        |
|---------------------------|---------------|
| Taxa de erro              | < 1%          |
| p95 latência              | < 2s          |
| p99 latência              | < 5s          |
| p95 login especificamente | < 1.5s        |
