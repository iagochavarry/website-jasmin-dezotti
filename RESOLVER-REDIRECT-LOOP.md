# 🔧 Como Resolver o Erro ERR_TOO_MANY_REDIRECTS

## ⚠️ Problema

O site está apresentando erro "ERR_TOO_MANY_REDIRECTS" (loop infinito de redirecionamentos).

## ✅ Soluções (em ordem de prioridade)

### 1. Limpar Cache Local

**No seu computador:**

```bash
# Limpar cache do navegador
- Chrome/Edge: Ctrl+Shift+Delete (Windows) ou Cmd+Shift+Delete (Mac)
- Selecione "Cookies e dados de sites" e "Imagens e arquivos em cache"
- Período: "Todo o período"
- Clique em "Limpar dados"

# Ou abra em modo anônimo/privado
- Chrome: Ctrl+Shift+N (Windows) ou Cmd+Shift+N (Mac)
```

### 2. Limpar Build e Cache do Next.js

**No terminal do projeto:**

```bash
# Parar o servidor se estiver rodando
# Depois execute:

rm -rf .next
rm -rf node_modules/.cache
npm run build
npm run start

# Ou se usar pnpm:
pnpm build
pnpm start
```

### 3. Verificar Configurações do Servidor de Hospedagem

#### **Se estiver usando Vercel:**

1. Acesse o dashboard do Vercel
2. Vá em Settings → Domains
3. Verifique se há redirecionamentos configurados
4. **IMPORTANTE:** Remova qualquer redirecionamento automático de HTTP→HTTPS ou www→non-www
5. O Vercel já faz isso automaticamente!

#### **Se estiver usando Netlify:**

1. Acesse Site Settings → Domain Management
2. Verifique "HTTPS" e "Force HTTPS"
3. Remova qualquer arquivo `_redirects` ou configuração em `netlify.toml`

#### **Se estiver usando servidor próprio (Apache/Nginx):**

**Apache (.htaccess):**

```apache
# Remova ou comente TODAS as linhas de RewriteRule
# Mantenha apenas:
<IfModule mod_headers.c>
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

**Nginx:**

```nginx
# No arquivo de configuração do site, remova linhas como:
# return 301 https://$host$request_uri;
# rewrite ^ https://$host$request_uri? permanent;
```

### 4. Verificar Cloudflare (se estiver usando)

1. Acesse o dashboard do Cloudflare
2. Vá em SSL/TLS → Overview
3. Configure para **"Full"** ou **"Full (strict)"**
4. **NÃO use "Flexible"** - isso causa loops!
5. Em Page Rules, remova qualquer regra de redirecionamento

### 5. Fazer Deploy Limpo

```bash
# No terminal do projeto:
git add .
git commit -m "fix: remove redirect loops"
git push

# Se usar Vercel/Netlify, isso fará um novo deploy automático
```

## 🎯 Causa Raiz do Problema

O loop acontece quando há **múltiplas camadas** tentando fazer o mesmo redirecionamento:

- ❌ Servidor (Apache/Nginx) redireciona HTTP → HTTPS
- ❌ Cloudflare redireciona HTTP → HTTPS
- ❌ Next.js tenta redirecionar HTTP → HTTPS
- ❌ Resultado: Loop infinito!

**Solução:** Deixe apenas UMA camada fazer o redirecionamento (preferencialmente o servidor/CDN).

## 📋 Checklist de Verificação

- [ ] Limpei o cache do navegador
- [ ] Testei em modo anônimo/privado
- [ ] Removi redirecionamentos do next.config.js ✅ (já feito)
- [ ] Verifiquei configurações do Vercel/Netlify
- [ ] Verifiquei configurações do Cloudflare (se aplicável)
- [ ] Fiz rebuild e redeploy limpo
- [ ] Removi arquivo .htaccess problemático

## 🆘 Se nada funcionar

1. Desative temporariamente o Cloudflare (se estiver usando)
2. Acesse o site diretamente pelo IP ou domínio sem CDN
3. Se funcionar, o problema está nas configurações do CDN
4. Reconfigure o CDN corretamente

## 📞 Contato para Suporte

Se o problema persistir, verifique:

- Logs do servidor de hospedagem
- Console do navegador (F12) → Network tab
- Headers das requisições para identificar onde está o loop
