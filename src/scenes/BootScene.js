import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Carregar a imagem do personagem
        this.load.image('tela_inicial', './assets/tela_inicial.png');
        this.load.image('hero', './assets/hero.png');
    }

    create() {
        // Tela de splash com a imagem - RESPONSIVO E FULLSCREEN
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Adicionar a imagem de fundo cobrindo toda a tela
        const telaInicial = this.add.image(0, 0, 'tela_inicial');
        telaInicial.setOrigin(0, 0);
        telaInicial.setDisplaySize(this.scale.width, this.scale.height);
        telaInicial.setDepth(0);

        // Adicionar sombra sob o personagem (opcional - pode remover se a imagem de fundo é suficiente)
        // this.add.graphics().fillStyle(0x000000, 0.5).fillEllipse(centerX, centerY + 100, 120, 30);

        // Título do jogo - ajustado para a tela
        const titleSize = Math.max(32, this.scale.width / 20);
        this.add.text(centerX, centerY + 150, 'SOBREVIVÊNCIA', {
            fontFamily: 'Arial, sans-serif',
            fontSize: titleSize + 'px',
            fontStyle: 'bold',
            color: '#FF6B00',
            align: 'center',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5).setDepth(1);

        this.add.text(centerX, centerY + 200, 'EM VALDELOBOS', {
            fontFamily: 'Arial, sans-serif',
            fontSize: (titleSize * 0.6) + 'px',
            color: '#FFD700',
            align: 'center',
            fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(1);

        // Mensagem de clique
        const clickText = this.add.text(centerX, centerY + 280, 'Pressione ENTER ou CLIQUE para continuar', {
            fontFamily: 'Arial, sans-serif',
            fontSize: (titleSize * 0.35) + 'px',
            color: '#CCCCCC',
            align: 'center'
        }).setOrigin(0.5).setDepth(1);

        // Animação de pulsação do texto
        this.tweens.add({
            targets: clickText,
            alpha: { from: 0.3, to: 1 },
            duration: 1000,
            repeat: -1,
            yoyo: true
        });

        // Interatividade - teclado
        this.input.keyboard.once('keydown-ENTER', () => {
            this.goToMenu();
        });

        // Interatividade - mouse
        this.input.once('pointerdown', () => {
            this.goToMenu();
        });
    }

    goToMenu() {
        // Verifica se já está em tela cheia; se não estiver, solicita a entrada.
        if (!this.scale.isFullscreen) {
            this.scale.startFullscreen();
        }

        // Continua a transição de cena normalmente
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('MenuScene');
        });
    }
}
