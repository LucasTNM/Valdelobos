import Phaser from 'phaser';

export default class FinalScene extends Phaser.Scene {
    constructor() {
        super('FinalScene');
    }

    create() {

        this.cameras.main.setBackgroundColor('#000000');

        this.storyText = this.add.text(400, 300, 'Sintonizando rádio...', {
            fontFamily: 'Courier, monospace',
            fontSize: '20px',
            color: '#aaaaaa',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        this.fetchNarrativeFromN8n();

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

            this.animateText(storyText);

        } catch (error) {
            console.warn("n8n offline ou bloqueado. Usando texto de fallback.", error);

            this.animateText("A noite caiu e o rádio pifou. Você está sozinho em Valdelobos. Confie apenas na sua luz.");
        }
    }

    animateText(text) {
        if (typeof text !== 'string' || text.length === 0) {
            text = "A noite caiu e o rádio pifou. Você está sozinho em Valdelobos. Confie apenas na sua luz.";
        }

        this.storyText.setText('');
        this.storyText.setColor('#ffffff');

        let i = 0;
        this.time.addEvent({
            callback: () => {
                this.storyText.text += text[i];
                i++;
            },
            repeat: text.length - 1,
            delay: 50
        });
    }
}