// Remendo para o Baileys 7.0.0-rc.9 (Evolution API v2.3.7).
//
// Desde fins de setembro de 2026 o WhatsApp manda o status (stories) de alguns
// contatos como stanza <status> de nível superior. O Baileys não tem handler
// para ela e nunca confirma (ack). ~50 minutos depois o servidor derruba o
// stream ("stream errored out", ack class="status"); na reconexão o mesmo
// status é reentregue e o ciclo recomeça, até o socket ficar "open" e surdo.
// Upstream: WhiskeySockets/Baileys#2858 (fix no PR #2866, ainda não lançado).
// Evolution: evolution-foundation/evolution-api#2778.
//
// Uso: node patch-baileys-status-ack.js <caminho>/node_modules/baileys
// Sai com erro se a versão não for rc.9 ou se a âncora não existir, para a
// imagem não ser construída com um remendo que não se aplica.

const fs = require('fs');
const path = require('path');

const raiz = process.argv[2];
if (!raiz) {
  console.error('uso: node patch-baileys-status-ack.js <caminho do pacote baileys>');
  process.exit(2);
}

const pkg = JSON.parse(fs.readFileSync(path.join(raiz, 'package.json'), 'utf8'));
const VERSAO_ESPERADA = '7.0.0-rc.9';
if (pkg.version !== VERSAO_ESPERADA) {
  console.error(`baileys ${pkg.version} encontrado; o remendo foi escrito para ${VERSAO_ESPERADA}. Reveja antes de aplicar.`);
  process.exit(3);
}

const alvo = path.join(raiz, 'lib', 'Socket', 'messages-recv.js');
let src = fs.readFileSync(alvo, 'utf8');

const MARCA = '// [remendo status-ack]';
if (src.includes(MARCA)) {
  console.log('remendo já aplicado em', alvo);
  process.exit(0);
}

const ancora = `    ws.on('CB:ack,class:message', (node) => {`;
const ocorrencias = src.split(ancora).length - 1;
if (ocorrencias !== 1) {
  console.error(`âncora encontrada ${ocorrencias} vez(es) em ${alvo}; esperava 1.`);
  process.exit(4);
}

const handler = `    ${MARCA} confirma a stanza <status> que o WhatsApp passou a mandar
    // solta; sem o ack o servidor fecha o stream a cada ~50 min
    // (WhiskeySockets/Baileys#2858). Ack sem código de erro: um NACK deixa a
    // stanza pendente no servidor.
    ws.on('CB:status', (node) => {
        sendMessageAck(node).catch(error => onUnexpectedError(error, 'acking status stanza'));
    });
`;

src = src.replace(ancora, handler + ancora);
fs.writeFileSync(alvo, src);
console.log('remendo aplicado em', alvo);
