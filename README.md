# evolution-bronze

Imagem da Evolution API 2.3.7 com um remendo de 3 linhas no Baileys 7.0.0-rc.9.

## Por quê

Desde fins de setembro de 2026 o WhatsApp manda o status (stories) de alguns
contatos como stanza `<status>` solta. O Baileys rc.9 não tem handler para ela
e nunca confirma. Uns 50 minutos depois o servidor fecha o stream
(`stream errored out`, `ack class="status"`), a Evolution reconecta, o mesmo
status é reentregue, e o ciclo recomeça até o socket ficar `open` e surdo:
aceita envios, não entrega, não recebe. Reiniciar container ou instância não
resolve; parear de novo resolve por algumas horas.

No Bronze da Tá o ciclo de 50 minutos começou em 03/11/2026 às 14h48 e a
sessão morreu em 04/11 (08h36) e 05/11 (de madrugada). Mesmo container serve a
instância da nutrição, que ganha o remendo junto.

- Bug no Baileys: https://github.com/WhiskeySockets/Baileys/issues/2858
- Correção upstream (aberta, não lançada): https://github.com/WhiskeySockets/Baileys/pull/2866
- Relato na Evolution: https://github.com/evolution-foundation/evolution-api/issues/2778

## O que faz

`patch-baileys-status-ack.js` insere, em `lib/Socket/messages-recv.js`, um
handler `CB:status` que responde o ack da stanza sem código de erro. O
Dockerfile parte da imagem oficial `evoapicloud/evolution-api:v2.3.7`, aplica
o script e falha a build se a versão do Baileys não for a rc.9 ou se a âncora
do código não existir.

## Como usar no Easypanel

1. Subir este repositório no GitHub (pode ser privado; o Easypanel pede o
   token do GitHub nas configurações do projeto).
2. No serviço da Evolution: Source → GitHub → este repositório, branch `main`,
   Build → Dockerfile. Variáveis, volumes e domínio continuam iguais.
3. Deploy. A build leva 1–2 minutos. Depois do deploy, parear a instância de
   novo (a sessão que morreu não volta sozinha).
4. Conferir nos logs do container que `stream errored out` com `class="status"`
   parou de aparecer e que a instância fica mais de 1 hora sem fechar/reabrir.

## Quando apagar

Quando a Evolution lançar uma versão com Baileys que já confirme `<status>`
(PR #2866 ou equivalente), trocar o Source de volta para a imagem oficial e
arquivar este repositório. O script sai com erro em qualquer versão diferente
da rc.9, de propósito.
