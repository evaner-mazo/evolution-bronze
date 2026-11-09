# Evolution API 2.3.7 com o remendo do ack de <status> no Baileys.
# Ver patch-baileys-status-ack.js para o porquê. Quando a Evolution lançar uma
# versão com Baileys >= o PR WhiskeySockets/Baileys#2866, trocar a imagem de
# volta para a oficial e apagar este repositório.
FROM evoapicloud/evolution-api:v2.3.7

COPY patch-baileys-status-ack.js /tmp/patch-baileys-status-ack.js

# O script falha (e a build para) se a versão do Baileys não for a rc.9 ou se a
# âncora do código não existir. node --check garante que o arquivo continua válido.
RUN node /tmp/patch-baileys-status-ack.js /evolution/node_modules/baileys \
 && node --check /evolution/node_modules/baileys/lib/Socket/messages-recv.js \
 && grep -q "remendo status-ack" /evolution/node_modules/baileys/lib/Socket/messages-recv.js \
 && rm /tmp/patch-baileys-status-ack.js
