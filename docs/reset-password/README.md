# Página estática de redefinição de senha

Este diretório contém uma página HTML estática (para hospedar no GitHub Pages) que captura o token de recuperação enviado pelo Supabase e permite ao usuário definir uma nova senha.

Como usar

1. Abra `docs/reset-password/index.html` e substitua a constante `SUPABASE_URL` pela URL do seu projeto Supabase (ex: `https://xyz.supabase.co`).
2. Commit e faça push para o repositório.
3. Habilite o GitHub Pages nas configurações do repositório:
   - Vá em Settings → Pages e escolha `Deploy from a branch` → `branch: master` e `folder: /docs` (ou outra combinação que você prefira).
   - O GitHub Pages publicará a pasta `docs/` em `https://<seu-usuario>.github.io/<seu-repo>/reset-password/`.
4. No Dashboard do Supabase → Authentication → Settings, configure `Site URL` apontando para a URL pública da página.
   Se você deseja usar o endereço que indicou, defina `Site URL` como:
   `https://phaleixo.github.io/DiverGente/confirmacao/reset.html`
   Opcional: adicione essa URL também em `Redirect URLs` se necessário.
   `https://phaleixo.github.io/DiverGente/confirmacao/reset.html` (para redefinir senha)
   `https://phaleixo.github.io/DiverGente/confirmacao/confirm.html` (para confirmação de email)
   `https://phaleixo.github.io/DiverGente/confirmacao/` (opcional — index fará o redirecionamento automático)
   Observações de segurança

- O token de recuperação é passado na URL. A página usa esse token para chamar o endpoint protegido `/auth/v1/user` do Supabase; não é necessário expor sua `anon key` nesta página.
- Use HTTPS (GitHub Pages já usa) para evitar vazamento do token.
- Tokens têm tempo de validade; se o usuário receber link expirado, ele deverá pedir um novo email.

Testes

- Envie um pedido de redefinição de senha pelo app (ou via Supabase) e verifique o email.
- Clique no link do email — ele deverá apontar para a URL do GitHub Pages. A página pedirá nova senha e, ao salvar, chamará o Supabase via `PUT /auth/v1/user` com `Authorization: Bearer <token>`.
