param(
    [string]$RepoUrl = "",
    [string]$SkipTests = "false"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " 🚀 AUTOMAÇÃO COMPLETA - LAB 4: GITHUB ACTIONS + VERCEL" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Verificação da versão do Node.js
$nodeVer = node -v
Write-Host "`n[1/5] Node.js detectado: $nodeVer" -ForegroundColor Green

# 2. Execução da esteira de CI local
if ($SkipTests -ne "true") {
    Write-Host "`n[2/5] Executando pipeline de CI local (Lint, Testes, Cobertura, Performance, Build, Audit)..." -ForegroundColor Yellow
    npm.cmd ci
    npm.cmd run lint
    npm.cmd run test:unit
    npm.cmd run test:integration
    npm.cmd run test:coverage
    npm.cmd run test:perf
    npm.cmd run build
    npm.cmd run audit:prod
    Write-Host "✅ Todas as etapas locais do CI passaram com 100% de sucesso!" -ForegroundColor Green
} else {
    Write-Host "`n[2/5] Testes locais ignorados (--SkipTests=true)." -ForegroundColor DarkGray
}

# 3. Configuração da Vercel CLI e leitura de orgId / projectId
Write-Host "`n[3/5] Verificando vínculo com a Vercel (.vercel/project.json)..." -ForegroundColor Yellow
if (-not (Test-Path ".vercel\project.json")) {
    Write-Host "Arquivo .vercel/project.json ainda não encontrado." -ForegroundColor Cyan
    $linkChoice = Read-Host "Deseja fazer login e linkar o projeto na Vercel agora? (S/N)"
    if ($linkChoice -match "^[sS]") {
        npx.cmd vercel login
        npx.cmd vercel link
    }
}

if (Test-Path ".vercel\project.json") {
    $vercelConfig = Get-Content ".vercel\project.json" | ConvertFrom-Json
    Write-Host "`n============================================================" -ForegroundColor Green
    Write-Host " 🔑 DADOS DA VERCEL PARA OS SECRETS DO GITHUB ACTIONS:" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host " VERCEL_ORG_ID     = $($vercelConfig.orgId)" -ForegroundColor White
    Write-Host " VERCEL_PROJECT_ID = $($vercelConfig.projectId)" -ForegroundColor White
    Write-Host " VERCEL_TOKEN      = (Crie em https://vercel.com/account/tokens)" -ForegroundColor White
    Write-Host "============================================================`n" -ForegroundColor Green
}

# 4. Verificação do Git e Commit Local
Write-Host "[4/5] Verificando repositório Git e commits locais..." -ForegroundColor Yellow
git status -s
git log --oneline -n 5

# 5. Push para o GitHub para disparar o GitHub Actions
Write-Host "`n[5/5] Configuração do repositório remoto no GitHub..." -ForegroundColor Yellow
$existingRemote = git remote get-url origin 2>$null
if (-not $existingRemote) {
    if (-not $RepoUrl) {
        $RepoUrl = Read-Host "Cole a URL do seu repositório novo no GitHub (ex: https://github.com/SEU-USUARIO/pipeline-demo.git) ou pressione Enter para pular"
    }
    if ($RepoUrl) {
        git remote add origin $RepoUrl
        $existingRemote = $RepoUrl
    }
}

if ($existingRemote) {
    Write-Host "Enviando branch 'main' e 'minha-mudanca' para $existingRemote..." -ForegroundColor Cyan
    git push -u origin main
    git push -u origin minha-mudanca
    Write-Host "`n🎉 Push concluído! Acesse a aba 'Actions' do seu repositório no GitHub para tirar o print das etapas concluídas!" -ForegroundColor Green
} else {
    Write-Host "`nℹ️ Quando criar o repositório no GitHub, basta rodar:" -ForegroundColor Cyan
    Write-Host "   .\automatizar.ps1 -RepoUrl 'https://github.com/SEU_USUARIO/SEU_REPO.git' -SkipTests true" -ForegroundColor White
}

