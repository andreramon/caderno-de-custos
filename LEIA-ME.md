# Caderno de Custos

App para calcular o custo das receitas, montar orçamentos, mandar o orçamento em PDF para o cliente, lançar as vendas e ver o lucro do mês. Funciona offline, pode ser instalado no Android e, opcionalmente, guarda tudo na nuvem com o Firebase.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O app inteiro (telas, cálculos, backup, sincronização) |
| `sw.js` | Guarda o app no celular para abrir sem internet |
| `manifest.webmanifest` | Nome, cor e ícone para instalar como app |
| `icon-*.png` | Ícones |

## 1. Publicar grátis no GitHub Pages

1. Crie um repositório público no GitHub (por exemplo, `caderno-de-custos`).
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
4. Em um ou dois minutos o app estará em `https://SEU-USUARIO.github.io/caderno-de-custos/`.

Netlify ou Cloudflare Pages também servem: é só arrastar a pasta.

> O service worker só funciona em HTTPS (o GitHub Pages já é). Para testar no computador, rode `npx serve .` dentro da pasta e abra `http://localhost:3000`.

## 2. Ligar a nuvem (Firebase, plano gratuito)

Sem esta etapa o app funciona normalmente, com os dados só no celular e backup em arquivo.

1. Acesse https://console.firebase.google.com e crie um projeto (pode desativar o Google Analytics).
2. **Authentication → Começar → Método de login → Google → Ativar.**
3. Em **Authentication → Configurações → Domínios autorizados**, adicione `SEU-USUARIO.github.io`.
4. **Firestore Database → Criar banco de dados** (escolha a região `southamerica-east1`, São Paulo, e o modo de produção).
5. Na aba **Regras** do Firestore, cole e publique:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

   Assim, cada pessoa só enxerga os próprios dados.

6. Em **Configurações do projeto → Seus apps**, clique no ícone **Web (`</>`)**, registre o app e copie o bloco `firebaseConfig`.
7. No app, toque na engrenagem, cole o bloco em **Nuvem**, toque em **Ligar a nuvem** e depois em **Entrar com Google**.

Os dados que já estiverem no celular sobem para a conta no primeiro login. Sem internet, o app continua funcionando e sincroniza quando a conexão voltar.

A chave `apiKey` do Firebase não é secreta: quem protege os dados são as regras do passo 5 e o login.

## 3. Instalar no Android

1. Abra o link do app no Chrome.
2. Toque no menu (⋮) e em **Instalar app** ou **Adicionar à tela inicial**.
3. Pronto: ícone na tela, abre em tela cheia e funciona sem internet.

## Orçamento para o cliente

1. Na engrenagem, preencha **Seu negócio** (nome, WhatsApp, cidade, chave Pix e uma observação padrão). Isso aparece no topo e no fim do PDF.
2. Em **Orçar**, monte o pedido e toque em **Fazer orçamento para o cliente**.
3. Os preços de cada item já vêm calculados com a margem escolhida (os custos extras são distribuídos entre os itens). Dá para mudar qualquer valor, arredondar para cima, trocar o nome do item e incluir itens avulsos, como taxa de entrega.
4. **Gerar PDF e compartilhar** abre o menu de compartilhar do Android (WhatsApp, e-mail, Drive). No computador, o PDF é baixado.
5. **WhatsApp (texto)** manda o orçamento como mensagem. Se o WhatsApp do cliente estiver preenchido, a conversa com ele já abre.

O cliente vê só itens, quantidades, valor de cada, total, validade e observações. Custos e lucro aparecem apenas no app, no quadro "Só você vê".

Quando o cliente fechar, abra o orçamento e toque em **Virou venda**: o lançamento já vem preenchido com as receitas e o valor.

O gerador de PDF (jsPDF) é baixado na primeira vez que o app abre com internet e fica guardado para uso offline.

## Relatório em PDF

Na aba **Relatório**, escolha o mês e toque em **Gerar PDF do relatório**. O PDF traz o total que entrou, os custos, o lucro, a margem e uma linha por evento. No celular ele abre o menu de compartilhar; no computador, é baixado.

## Despesas do mês

No **Relatório**, em **Despesas do mês**, toque em **Adicionar despesa**:

- **Todo mês:** gás, luz, internet, transporte. Entra automaticamente em todos os meses a partir do mês em que foi cadastrada.
- **Só neste mês:** gastos que não se repetem, como o conserto de um equipamento.

Se a conta de um mês vier diferente (a de luz, por exemplo), abra a despesa naquele mês e preencha **Valor em (mês)**. Os outros meses continuam com o valor normal. Quando uma despesa acabar, use **Parar de contar a partir de (mês)**: os meses anteriores continuam com ela.

O relatório, a tela Início e o PDF mostram o **Sobrou no mês** = lucro das vendas − despesas do mês.

## Despesas no preço (formação de preço)

O preço sugerido segue o método usado por empresas, o **markup divisor**:

**Preço = custo de produção ÷ (1 − % de despesas − % de lucro)**

- **Custo de produção:** ingredientes da receita mais os custos só daquele pedido (entrega, ajudante).
- **% de despesas:** a parte de cada venda que paga as contas do mês. No modo automático = despesas fixas por mês ÷ vendas médias por mês (últimos 3 meses fechados). Também pode ser definido à mão ou desligado, em **Ajustes → Despesas no preço** ou pelo link **Ajustar** no Orçar.
- **% de lucro:** o que sobra livre, depois de pagar produção e despesas.

Exemplo: custo de R$ 98,70, despesas de 5% e lucro de 20% → preço de R$ 131,75, dos quais R$ 6,70 pagam as despesas e R$ 26,35 são lucro livre.

O percentual entra no preço sugerido do Orçar, na sugestão de preço das receitas, no quadro "Só você vê" do orçamento e no lucro livre mostrado ao lançar uma venda. No **relatório**, as despesas reais do mês são descontadas uma vez só, no "Sobrou no mês", para não contar em dobro. O relatório também compara o percentual usado nos preços com o peso real das despesas no mês e avisa se os preços não estão cobrindo as contas.

## Preços dos insumos: atualização rápida, histórico e alertas

- **Atualizar preços:** em **Cadastros → Insumos** (ou no atalho da tela Início), a tela **Atualizar preços** lista todos os insumos com o preço atual. Na volta do mercado, é só digitar o preço novo dos que mudaram. A tela mostra na hora se subiu ou caiu, e o botão diz quantos preços serão salvos.
- **Histórico:** cada mudança de preço fica guardada com a data. Ao abrir um insumo, aparece a lista de preços anteriores, o preço por kg, litro ou unidade, e a variação de um para o outro.
- **Impacto nas receitas:** depois de salvar, o app mostra o que mudou e como ficou o custo e o lucro livre de cada receita afetada. As que caíram abaixo da meta aparecem com o botão **Ajustar preço**.
- **Meta de lucro livre:** definida em **Ajustes** (padrão de 20%). Receitas abaixo da meta ficam marcadas na lista e geram um aviso na tela Início.
- **Preços parados:** insumos sem atualização há mais de 60 dias ficam marcados, e a tela Início lembra de atualizar.

## Como os dados são guardados

- **No celular:** IndexedDB, com pedido de armazenamento persistente para o Android não apagar os dados.
- **Na nuvem (opcional):** Firestore, em `users/{id-da-conta}/insumos`, `/receitas`, `/lancamentos`, `/orcamentos`, `/config` e `/despesas`.
- **Backup em arquivo:** um `.json` que pode ir para o Google Drive ou WhatsApp. O app lembra de fazer backup a cada 30 dias quando a nuvem está desligada.

## Como os números são calculados

- **Custo do insumo** = preço da embalagem ÷ tamanho da embalagem (em g, ml ou unidade).
- **Custo da receita** = soma dos ingredientes. **Custo de cada um** = custo da receita ÷ rendimento.
- **Preço sugerido no orçamento, em %** = custo total ÷ (1 − margem). Com 20%, um custo de R$ 80 vira R$ 100, e o lucro de R$ 20 é 20% do valor cobrado.
- **Preço sugerido no orçamento, em reais** = custo total + lucro desejado. O app mostra quanto isso representa em % do valor cobrado e em % sobre o custo.
- **Preço de venda da receita:** cada receita pode ter o preço de venda de cada unidade. Ele alimenta o **preço de tabela** no Orçar e preenche sozinho o **valor total** ao lançar uma venda (dá para alterar se houver desconto).
- **Lucro da venda** = valor da venda − (custo das receitas + custos extras). O percentual é sobre o valor da venda.
- O custo de cada venda fica **congelado no dia do lançamento**, então mudar o preço de um insumo depois não altera o lucro das semanas anteriores.

## Formas de pagamento e relatório

Ao lançar uma venda, escolha como ela é paga:

- **No pedido:** o valor todo conta na data em que o dinheiro entrou (hoje, por padrão).
- **Na entrega:** o valor conta na data do evento. Se o evento ainda não aconteceu, fica em **A receber**.
- **Entrada + restante na entrega:** a entrada conta na data em que foi paga, e o restante fica em **A receber** até a data do evento.

O relatório segue o **regime de caixa**: cada valor aparece no mês em que o dinheiro entrou. O custo da venda é contado na mesma proporção. Se entrou metade do valor em setembro, metade do custo também conta em setembro.

Os valores pendentes aparecem na tela Início e no relatório do mês previsto. Quando o dinheiro chegar, toque em **Recebi** e ele passa a contar no mês de hoje. Se tocar por engano, abra a venda e use **Desfazer**.

## Publicar uma versão nova

Depois de alterar o `index.html`, aumente o número em `caderno-custos-v2` (para `v3`, `v4`…) no `sw.js` e envie os dois. Na próxima vez que o app abrir com internet, ele se atualiza.
