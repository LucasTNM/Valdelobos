export async function consultarIA(dados) {
    try {
        const response = await fetch(
            "https://n8n.incluc0de.com.br/webhook-test/horror-game",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            }
        );

        return await response.json();

    } catch (erro) {

        console.error("Erro ao consultar IA:", erro);

        return null;
    }
}
