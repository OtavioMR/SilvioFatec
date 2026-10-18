# 🚀 Pipeline completo: GitHub Actions + Vercel

Um projeto pequeno, mas com um **pipeline de verdade**: toda vez que você manda código para o GitHub, uma "esteira" automática confere se está tudo certo e, se estiver, publica o site na Vercel.

---

## 1. Conceitos básicos (em 1 minuto)

| Palavra | O que é, em português claro |
|---|---|
| **GitHub Actions** | Um robô do GitHub que executa tarefas automaticamente quando algo acontece (um push, um Pull Request…). |
| **Workflow** | Uma "receita" escrita num arquivo `.yml` dentro de `.github/workflows/`. |
| **Job** | Um bloco de tarefas da receita. Cada job roda numa máquina virtual limpa. |
| **Step** | Um passo dentro do job (ex.: "instalar dependências"). |
| **Runner** | A máquina virtual que executa o job (`ubuntu-latest`). |
| **Artifact** | Arquivo guardado por um job para você baixar depois (ex.: relatório de cobertura). |
| **Secret** | Senha/token guardado de forma segura, que nunca aparece nos logs. |
| **Environment** | Um "destino" (preview, production) que pode exigir aprovação manual. |

---

## 2. O que tem no projeto

```
.
├── .github/
│   ├── workflows/
│   │   ├── pipeline.yml    ← O MAESTRO: chama o CI e depois faz o deploy
│   │   ├── ci.yml          ← Lint, testes, cobertura, performance, build
│   │   └── security.yml    ← 4 verificações de segurança
│   └── dependabot.yml      ← Atualiza dependências sozinho
├── api/                    ← Funções serverless (viram endpoints na Vercel)
│   ├── hello.js            ← GET /api/hello?name=Ana
│   └── health.js           ← GET /api/health
├── src/greeting.js         ← A lógica de negócio (montar a saudação)
├── public/index.html       ← O site
├── scripts/build.js        ← Gera public/build-info.json
├── tests/
│   ├── unit/               ← Testa funções isoladas
│   ├── integration/        ← Testa a API de ponta a ponta
│   └── perf/               ← Teste de carga
├── vercel.json             ← Configuração da Vercel (+ headers de segurança)
└── eslint.config.js        ← Regras de qualidade de código
```

---

## 3. Como o pipeline funciona

```
                    ┌────────────── pipeline.yml ──────────────┐
  você faz          │                                          │
  push / PR  ─────► │  CI (ci.yml)                             │
                    │   lint → unit (Node 22, 24) ─┐           │
                    │      └──► integração ────────┤           │
                    │                              ├► cobertura ► build
                    │                              └► performance       │
                    │                                                   ▼
                    │              PR?  ──► 🔍 Deploy PREVIEW + comentário no PR
                    │              main? ─► 🚀 Deploy PRODUÇÃO (+ aprovação opcional)
                    └───────────────────────────────────────────────────┘

  security.yml roda em paralelo (npm audit, CodeQL, Gitleaks, Dependency Review)
```

### 3.1 `ci.yml` — a parte de "conferir"

| Etapa | O que faz | Quando reprova |
|---|---|---|
| **Lint** | Procura erros e código fora do padrão (ESLint). | Qualquer erro de lint. |
| **Unit** | Testa a função `buildGreeting` sozinha. Roda em **2 versões do Node** (matriz). | Qualquer teste falhando. |
| **Integração** | Sobe um servidor local e chama a API de verdade com `fetch`. | Resposta diferente da esperada. |
| **Cobertura** | Mede quanto do código os testes executam. | Menos de **90%** de linhas/funções ou **80%** de branches. |
| **Performance** | Dispara requisições por 5 s (10 conexões) com *autocannon*. | p99 > 100 ms, < 500 req/s ou qualquer erro. |
| **Build** | Gera o site e confere se os arquivos existem. | Arquivo faltando. |
| **CI OK** | Junta todos os resultados num único "portão". | Se qualquer job acima falhou. |

> 💡 **Dica de ouro:** na proteção da branch `main`, marque como obrigatório **só** o check `CI OK`. Ele resume todos os outros.

### 3.2 `security.yml` — a parte de "proteger"

1. **npm audit** → procura vulnerabilidades conhecidas nas bibliotecas (falha em HIGH/CRITICAL).
2. **CodeQL** → lê o seu código procurando falhas (injeção, XSS etc.). Os alertas aparecem na aba *Security*.
3. **Gitleaks** → procura senhas/tokens esquecidos no código e no histórico do Git.
4. **Dependency Review** → em PRs, bloqueia a entrada de bibliotecas vulneráveis novas.

Roda também **toda segunda-feira**, porque novas vulnerabilidades surgem mesmo sem você mexer no código.

### 3.3 `pipeline.yml` — a parte de "publicar"

- **Em Pull Request** → depois do CI passar, publica um **preview** (endereço temporário), roda um *smoke test* (`/api/health`) e **comenta o link no PR**. Você revisa o resultado real antes de aprovar.
- **Em push na `main`** → depois do CI passar, publica em **produção**, roda smoke tests e mostra a URL final. Se o environment `production` tiver revisores obrigatórios, o job **pausa esperando aprovação**.

Passos do deploy na Vercel (via CLI):

```
vercel pull    → baixa as configurações do projeto
vercel build   → gera o resultado final (aqui, no GitHub, não na Vercel)
vercel deploy --prebuilt → envia o resultado pronto
```

---

## 4. Como usar (passo a passo)

### 4.1 Rodar tudo no seu computador primeiro

Requer **Node 22 ou superior**.

```bash
npm ci               # instala dependências
npm run lint         # qualidade de código
npm run test:unit
npm run test:integration
npm run test:coverage
npm run test:perf
npm run build
npm run audit:prod
npm run dev          # servidor local em http://127.0.0.1:3000
```

### 4.2 Configurar a Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) e instale a CLI: `npm i -g vercel`.
2. Na pasta do projeto: `vercel link` (cria `.vercel/project.json`).
3. Abra `.vercel/project.json` e copie `orgId` e `projectId`.
4. Crie um token em [vercel.com/account/tokens](https://vercel.com/account/tokens).
5. **Desative** o deploy automático da Vercel pela integração com o Git (Project → Settings → Git), senão o deploy acontecerá duas vezes.

### 4.3 Configurar o GitHub

1. Suba o código para um repositório novo.
2. **Settings → Secrets and variables → Actions → New repository secret**, e crie:

   | Secret | Valor |
   |---|---|
   | `VERCEL_TOKEN` | o token do passo 4.2.4 |
   | `VERCEL_ORG_ID` | `orgId` do passo 4.2.3 |
   | `VERCEL_PROJECT_ID` | `projectId` do passo 4.2.3 |

3. **Settings → Environments**: crie `preview` e `production`. Em `production`, marque **Required reviewers** se quiser aprovar manualmente cada deploy.
4. **Settings → Branches → Add rule** para `main`: exija Pull Request e o check **CI OK**.
5. (Opcional) **Settings → Code security**: ative *Dependency graph* e *Code scanning* (necessários para Dependency Review e CodeQL em repositórios privados).

### 4.4 Ver funcionando

```bash
git checkout -b minha-mudanca
# ...edite algo...
git commit -am "teste do pipeline" && git push -u origin minha-mudanca
```

Abra o Pull Request → aba **Actions** mostra o pipeline rodando → o bot comenta o link do preview. Faça o merge → produção.

---

## 5. Entendendo trechos importantes dos arquivos

```yaml
on:
  pull_request:
  push:
    branches: [main]
```
**Gatilhos.** Quando o workflow dispara.

```yaml
concurrency:
  group: pipeline-${{ github.ref }}
  cancel-in-progress: false
```
**Fila.** Evita dois deploys simultâneos na mesma branch. No `ci.yml` usamos `cancel-in-progress: true` para descartar testes velhos; no deploy, **não** cancelamos no meio.

```yaml
permissions:
  contents: read
```
**Menor privilégio.** O robô só ganha permissão extra nos jobs que realmente precisam (ex.: comentar em PR).

```yaml
strategy:
  matrix:
    node: [22, 24]
```
**Matriz.** O mesmo job roda uma vez para cada versão listada, em paralelo.

```yaml
needs: [unit, integration]
```
**Dependência.** O job só começa quando os listados terminam com sucesso.

```yaml
uses: ./.github/workflows/ci.yml
```
**Workflow reutilizável.** O `pipeline.yml` "chama" o `ci.yml` como uma função, sem copiar e colar.

```yaml
shell: bash
run: npm run test:perf | tee perf-result.txt
```
**Cuidado com o `| tee`.** Sem `shell: bash` explícito, uma falha no comando antes do `|` seria ignorada. Com ele, o job falha corretamente.

```yaml
if: always()
```
Executa o passo **mesmo se os anteriores falharam** (útil para publicar relatórios).

---

## 6. ✅ O que foi testado

Tudo foi executado de verdade antes da entrega:

| Verificação | Resultado |
|---|---|
| Lint (ESLint) | ✅ sem erros |
| Unit | ✅ 7/7 |
| Integração | ✅ 6/6 |
| Cobertura | ✅ 100% (gate de 90/90/80) |
| Performance | ✅ ~27 mil req/s, p99 = 1 ms |
| Build | ✅ gera `public/build-info.json` |
| npm audit | ✅ 0 vulnerabilidades |
| Sintaxe dos workflows | ✅ validada com **actionlint** |
| **Testes negativos** | ✅ código sem teste derruba a cobertura; limite de performance impossível derruba o job |

### ⚠️ O que NÃO dá para provar fora do GitHub

Estes pontos só são confirmados depois do primeiro push real:

- Execução dos workflows nos runners do GitHub (os mesmos comandos foram simulados localmente, na mesma ordem).
- CodeQL, Dependency Review e Gitleaks (dependem do GitHub; podem exigir ativar *Code scanning* em repositório privado).
- Deploy na Vercel (depende dos seus tokens e do projeto linkado).

Se algo falhar no primeiro run, o erro vai estar no log do job — cole aqui e eu ajudo a corrigir.

---

## 7. Ideias para evoluir

- Adicionar **testes end-to-end** com Playwright rodando contra a URL do preview.
- Rodar **Lighthouse CI** para medir performance do front-end.
- Trocar os thresholds de performance por um histórico (comparar com a `main`).
- Fixar as Actions por **SHA** (em vez de `@v4`) para segurança extra contra ataques de cadeia de suprimentos.
- Adicionar **rollback automático** se o smoke test de produção falhar (`vercel rollback`).
