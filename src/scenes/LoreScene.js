import Phaser from 'phaser';

export default class LoreScene extends Phaser.Scene {
    constructor() {
        super('LoreScene');
    }

    create() {
        this.nextScene = this.scene.settings.data?.nextScene || 'Level1_Arrival';

        this.cameras.main.setBackgroundColor('#000000');

        this.storyText = this.add.text(400, 300, 'Sintonizando rádio...', {
            fontFamily: 'Courier, monospace',
            fontSize: '20px',
            color: '#aaaaaa',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        this.fetchNarrativeFromN8n();

        this.add.text(400, 550, 'Pressione ESPAÇO para continuar', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            color: '#555555'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start(this.nextScene);
        });
    }

    async fetchNarrativeFromN8n() {

        const n8nUrl = 'https://n8n.incluc0de.com.br/webhook/narrador';

        const fallbackText = "A noite caiu e o rádio pifou. Você está sozinho em Valdelobos. Confie apenas na sua luz.";

        try {
            const response = await fetch(n8nUrl);

            if (!response.ok) {
                throw new Error(`Erro na resposta do servidor: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            const storyText = typeof data?.lore === 'string' && data.lore.trim().length > 0
                ? data.lore
                : null;

            if (!storyText) {
                throw new Error('Resposta do n8n não contém a chave "lore" ou o texto está vazio');
            }

            this.animateText(storyText);

        } catch (error) {
            console.warn("n8n offline ou chave incorreta. Usando texto de fallback.", error);

            this.animateText(fallbackText);
        }
    }

    animateText(text) {
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

        const totalDuration = Math.max(0, text.length * 50);
        this.time.delayedCall(totalDuration + 800, () => {
            this.scene.start(this.nextScene);
        });
    }
}