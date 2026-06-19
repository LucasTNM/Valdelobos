import Phaser from 'phaser';

export default class LoreScene extends Phaser.Scene {
    constructor() {
        super('LoreScene');
    }

    create() {
        this.nextScene = this.scene.settings.data?.nextScene || 'Level1_Arrival';

        // Fundo preto dramático para o início do mistério
        this.cameras.main.setBackgroundColor('#000000');

        // Texto inicial na tela (estilo máquina de escrever ou rádio antigo)
        this.storyText = this.add.text(400, 300, 'Sintonizando rádio...', {
            fontFamily: 'Courier, monospace',
            fontSize: '20px',
            color: '#aaaaaa',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        // Chama a função assíncrona que vai buscar a lore no n8n
        this.fetchNarrativeFromN8n();

        // Botão de instrução para o jogador avançar
        this.add.text(400, 550, 'Pressione ESPAÇO para continuar', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px', 
            color: '#555555'
        }).setOrigin(0.5);

        // Entrada do teclado para ir para a próxima cena configurada
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start(this.nextScene);
        });
    }

    async fetchNarrativeFromN8n() {
        // Sua URL de produção do n8n
        const n8nUrl = 'https://n8n.incluc0de.com.br/webhook/narrador';
        
        // Texto padrão (Plano B) caso o servidor n8n falhe ou esteja offline
        const fallbackText = "A noite caiu e o rádio pifou. Você está sozinho em Valdelobos. Confie apenas na sua luz.";

        try {
            const response = await fetch(n8nUrl);
            
            if (!response.ok) {
                throw new Error(`Erro na resposta do servidor: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // CORREÇÃO: Buscando especificamente pela chave 'lore' enviada pelo n8n
            const storyText = typeof data?.lore === 'string' && data.lore.trim().length > 0
                ? data.lore
                : null;

            if (!storyText) {
                throw new Error('Resposta do n8n não contém a chave "lore" ou o texto está vazio');
            }

            // Se tudo der certo, exibe o texto vindo do n8n com efeito de digitação
            this.animateText(storyText);

        } catch (error) {
            console.warn("n8n offline ou chave incorreta. Usando texto de fallback.", error);
            
            // Ativa o plano B para o jogo rodar sem quebrar de jeito nenhum
            this.animateText(fallbackText);
        }
    }

    // Função que cria o efeito de máquina de escrever letra por letra
    animateText(text) {
        this.storyText.setText(''); // Limpa o "Sintonizando rádio..."
        this.storyText.setColor('#ffffff'); // Muda a cor para branco total
        
        let i = 0;
        this.time.addEvent({
            callback: () => {
                this.storyText.text += text[i];
                i++;
            },
            repeat: text.length - 1,
            delay: 50 // Velocidade da digitação (50 milissegundos por letra)
        });

        const totalDuration = Math.max(0, text.length * 50);
        this.time.delayedCall(totalDuration + 800, () => {
            this.scene.start(this.nextScene);
        });
    }
}