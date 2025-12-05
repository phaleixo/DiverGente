# Uso das páginas de confirmação e reset

Este diretório contém páginas usadas pelo fluxo de autenticação do Supabase:

- `index.html` — redirecionador que envia para `reset.html` ou `confirm.html` baseado em `?type=` na query string.
- `reset.html` — página que permite ao usuário definir uma nova senha (usa `access_token`/`token`).
- `confirm.html` — página que verifica o token e mostra confirmação de email.

Configuração recomendada no Supabase

1. Em `Authentication → Settings` defina `Site URL` para a pasta base:

   `https://phaleixo.github.io/confirmacao/`

2. Em `Authentication → Settings → Redirect URLs` adicione as URLs completas que podem receber callbacks do Supabase:

   - `https://phaleixo.github.io/confirmacao/`
   - `https://phaleixo.github.io/confirmacao/reset.html`
   - `https://phaleixo.github.io/confirmacao/confirm.html`

Como funciona

- Quando o Supabase gera um link (por exemplo de recuperação de senha), ele acrescenta parâmetros na query string (ex.: `?type=recovery&access_token=...`).
- Se o `Site URL` for a pasta (`/confirmacao/`), o link enviado por email ficará no formato:
  `https://phaleixo.github.io/confirmacao/?type=recovery&access_token=...`
- `index.html` detecta `type=recovery` e redireciona automaticamente para `reset.html` preservando os parâmetros. Para `type=signup` (ou similares) redireciona para `confirm.html`.

Ações necessárias antes de publicar

1. Substitua as placeholders `REPLACE_WITH_YOUR_SUPABASE_URL` dentro de `reset.html` e `confirm.html` pelo seu `SUPABASE_URL` (ex: `https://xyz.supabase.co`).
2. Commit e push para o repositório. Ative GitHub Pages (Settings → Pages) para publicar a pasta `docs/`.
3. No painel do Supabase (Auth settings) use a `Site URL` e `Redirect URLs` indicadas acima.

Observações

- Mantendo `Site URL` apontando para a pasta base você evita ter de configurar templates diferentes; o index fará o roteamento automático.
- Garanta HTTPS (GitHub Pages já fornece) para proteger o token na query string.
