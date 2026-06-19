import Phaser from 'phaser';

export default class FinalScene extends Phaser.Scene {
    constructor() {
        super('FinalScene');
    }

    create() {
        // Fundo preto dramático
        this.cameras.main.setBackgroundColor('#000000');

        // Texto inicial na tela (estilo máquina de escrever ou rádio)
        this.storyText = this.add.text(400, 300, 'Sintonizando rádio...', {
            fontFamily: 'Courier, monospace',
            fontSize: '20px',
            color: '#aaaaaa',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        // Chama a função assíncrona que vai falar com o n8n
        this.fetchNarrativeFromN8n();

        // Botão para pular/continuar
        const continueText = this.add.text(400, 550, 'Pressione ESPAÇO para continuar', {
            fontSize: '14px', color: '#555555'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('MenuScene');
        });
    }

    async fetchNarrativeFromN8n() {
        const n8nUrl = 'https://n8n.incluc0de.com.br/webhook/narrador';

        try {
            // O jogo tenta buscar o texto (timeout natural do navegador)
            const response = await fetch(n8nUrl);
            
            if (!response.ok) {
                throw new Error(`Erro na resposta do servidor: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const storyText = typeof data?.final === 'string' && data.final.trim().length > 0
                ? data.final
                : null;

            if (!storyText) {
                throw new Error('Resposta do n8n não contém texto válido');
            }

            // Se der certo, substitui o texto da tela pelo texto do n8n
            this.animateText(storyText);

        } catch (error) {
            console.warn("n8n offline ou bloqueado. Usando texto de fallback.", error);
            
            // O PLANO B (FALLBACK): Se o n8n falhar, o jogo NÃO QUEBRA.
            // Ele apenas mostra essa história padrão.
            this.animateText("A noite caiu e o rádio pifou. Você está sozinho em Valdelobos. Confie apenas na sua luz.");
        }
    }

    // Função extra para deixar o texto aparecendo bonito (opcional, mas recomendado)
    animateText(text) {
        if (typeof text !== 'string' || text.length === 0) {
            text = "A noite caiu e o rádio pifou. Você está sozinho em Valdelobos. Confie apenas na sua luz.";
        }

        this.storyText.setText(''); // Limpa o texto
        this.storyText.setColor('#ffffff'); // Deixa branco
        
        let i = 0;
        this.time.addEvent({
            callback: () => {
                this.storyText.text += text[i];
                i++;
            },
            repeat: text.length - 1,
            delay: 50 // Velocidade de digitação (50ms por letra)
        });
    }
}