import Phaser from 'phaser';

export default class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    create() {
        const { width, height } = this.scale;

        // Fundo preto
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

        // Texto GAME OVER
        this.add.text(width / 2, height * 0.4, 'GAME OVER', {
            fontSize: '64px',
            color: '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Botão Jogar Novamente
        const restartButton = this.add.text(width / 2, height * 0.6, 'JOGAR NOVAMENTE', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        restartButton.on('pointerover', () => restartButton.setStyle({ color: '#ffff00' }));
        restartButton.on('pointerout', () => restartButton.setStyle({ color: '#ffffff' }));
        
        restartButton.on('pointerdown', () => {
            window.location.reload();
        });

        // Adicionar comando de teclado também
        this.input.keyboard.once('keydown-SPACE', () => {
            window.location.reload();
        });
        this.input.keyboard.once('keydown-ENTER', () => {
            window.location.reload();
        });

        this.add.text(width / 2, height * 0.7, '(Pressione ESPAÇO ou ENTER)', {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);
    }
}
