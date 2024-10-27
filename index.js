const axios = require('axios');
const cron = require('node-cron');

// URL do Webhook do Discord
const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL';

// ID da última transação verificada
let lastTransactionId = null;

// Função para verificar novas transações
async function checkNewTransaction() {
    try {
        const response = await axios.get(
            'https://public-api.solscan.io/account/transactions?address=CLcWPcRq7UfSeAZBsN2dPXpdcJaBzfyMu1n9U9Nthrh2'
        );

        const transactions = response.data;

        if (transactions && transactions.length > 0) {
            const latestTransaction = transactions[0];

            // Verifique se a última transação registrada é nova
            if (latestTransaction.txHash !== lastTransactionId) {
                lastTransactionId = latestTransaction.txHash;

                // Filtra para notificar apenas transações de compra (com sinal "+")
                const amount = latestTransaction.amount;
                if (amount && amount.startsWith("+")) {
                    console.log("Nova transação de compra detectada!", latestTransaction);
                    
                    // Envia a notificação para o Discord
                    sendToDiscord(latestTransaction);
                }
            }
        }
    } catch (error) {
        console.error("Erro ao verificar transações:", error);
    }
}

// Função para enviar uma notificação para o Discord
function sendToDiscord(transaction) {
    axios.post(DISCORD_WEBHOOK_URL, {
        content: `🚨 Nova transação de COMPRA detectada! Hash: ${transaction.txHash}, Quantidade: ${transaction.amount}`
    })
    .then(() => {
        console.log("Notificação enviada ao Discord com sucesso!");
    })
    .catch(error => {
        console.error("Erro ao enviar notificação para o Discord:", error);
    });
}

// Configuração do cron job para verificar transações a cada minuto
cron.schedule('* * * * *', checkNewTransaction);

console.log("Monitoramento de transações iniciado.");
