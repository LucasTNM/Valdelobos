import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
        this.buttonHoverScale = 1.1;
        this.selectedIndex = 0;
        this.buttons = [];
    }

    create() {
        // Fundo escuro com gradiente
        this.cameras.main.setBackgroundColor('#000000');
        
        // Adicionar efeito de floresta/nevoa ao fundo
        this.createBackgroundParticles();

        // Título do jogo com efeito de luz
        this.createTitle();

        // Criar menu principal
        this.createMainMenu();

        // Interatividade com teclado
        this.setupKeyboardControls();
    }

    createBackgroundParticles() {
        // 1. Criamos a textura da partícula na memória (como fizemos no Level1)
        const g = this.make.graphics({x: 0, y: 0, add: false});
        g.fillStyle(0x888888, 0.2); // Cor cinza, com transparência baixa
        g.fillCircle(8, 8, 8);
        g.generateTexture('menu_fog', 16, 16);

        // 2. Usamos a sintaxe moderna do Phaser 3.60+ - RESPONSIVO
        this.add.particles(0, 0, 'menu_fog', {
            speed: { min: -30, max: 30 },
            angle: { min: 240, max: 300 },
            scale: { start: 0.8, end: 0 },
            lifespan: 3000,
            gravityY: -50,
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(0, 0, this.scale.width, this.scale.height)
            }
        });
    }

    createTitle() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        const titleSize = Math.max(32, this.scale.width / 16);
        const subtitleSize = Math.max(20, this.scale.width / 25);
        const descSize = Math.max(12, this.scale.width / 60);

        // Título principal com sombra e brilho
        this.add.text(centerX, centerY * 0.3, 'SOBREVIVÊNCIA', {
            fontFamily: 'Arial, sans-serif',
            fontSize: titleSize + 'px',
            fontStyle: 'bold',
            color: '#FFFFFF',
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 10,
                fill: true
            }
        }).setOrigin(0.5);

        // Subtítulo
        this.add.text(centerX, centerY * 0.3 + titleSize * 0.8, 'EM VALDELOBOS', {
            fontFamily: 'Arial, sans-serif',
            fontSize: subtitleSize + 'px',
            color: '#8B4513',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Decoração - linhas de fogo
        const lineWidth = this.scale.width * 0.6;
        const lineX = centerX - lineWidth / 2;
        const lineY = centerY * 0.3 + titleSize * 1.2;
        this.add.graphics().fillStyle(0xFF6B00, 0.6).fillRect(lineX, lineY, lineWidth, 2);
        this.add.graphics().fillStyle(0xFF6B00, 0.3).fillRect(lineX, lineY + 5, lineWidth, 1);

        // Descrição atmosférica
        this.add.text(centerX, lineY + 25, 'A noite cai sobre a floresta...', {
            fontFamily: 'Arial, sans-serif',
            fontSize: descSize + 'px',
            color: '#CC6600',
            fontStyle: 'italic',
            align: 'center'
        }).setOrigin(0.5);
    }

    createMainMenu() {
        const menuItems = [
            { text: 'INICIAR JOGO', scene: 'Fishing' },
            { text: 'SAIR', scene: null }
        ];

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;
        const startY = centerY * 0.7;
        const spacing = Math.max(70, this.scale.height / 8);
        const buttonScale = Math.max(0.8, this.scale.width / 1200);

        menuItems.forEach((item, index) => {
            const button = this.createButton(
                centerX,
                startY + index * spacing,
                item.text,
                index,
                item.scene,
                buttonScale
            );
            this.buttons.push(button);
        });

        // Destacar primeiro botão
        this.highlightButton(0);
    }

    createButton(x, y, text, index, sceneName, scale = 1) {
        const container = this.add.container(x, y);
        const buttonWidth = 240 * scale;
        const buttonHeight = 40 * scale;
        const fontSize = Math.max(14, 20 * scale);

        // Background do botão
        const bg = this.add.graphics();
        bg.fillStyle(0x2a2a2a, 0.8);
        bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8 * scale);
        bg.lineStyle(2, 0xFF6B00, 0.5);
        bg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8 * scale);

        // Texto
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Arial, sans-serif',
            fontSize: fontSize + 'px',
            fontStyle: 'bold',
            color: '#FFD700',
            align: 'center'
        }).setOrigin(0.5);

        container.add([bg, buttonText]);
        container.setInteractive(
            new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
            Phaser.Geom.Rectangle.Contains
        );
        container.setScale(scale);

        // Events do mouse
        container.on('pointerover', () => {
            this.selectButton(index);
        });

        container.on('pointerdown', () => {
            this.handleButtonClick(sceneName, index);
        });

        // Armazenar referências
        container.index = index;
        container.sceneName = sceneName;
        container.bg = bg;
        container.text = buttonText;

        return container;
    }

    highlightButton(index) {
        this.buttons.forEach((btn, i) => {
            if (i === index) {
                btn.bg.clear();
                btn.bg.fillStyle(0xFF6B00, 0.9);
                btn.bg.fillRoundedRect(-120, -20, 240, 40, 8);
                btn.bg.lineStyle(3, 0xFFFFFF, 1);
                btn.bg.strokeRoundedRect(-120, -20, 240, 40, 8);

                btn.text.setColor('#FFFFFF');
                btn.setScale(1.05);

                // Efeito de luz
                this.tweens.killTweensOf(btn);
                this.tweens.add({
                    targets: btn,
                    scale: 1.1,
                    duration: 300,
                    ease: 'Power2.easeOut'
                });
            } else {
                btn.bg.clear();
                btn.bg.fillStyle(0x2a2a2a, 0.8);
                btn.bg.fillRoundedRect(-120, -20, 240, 40, 8);
                btn.bg.lineStyle(2, 0xFF6B00, 0.5);
                btn.bg.strokeRoundedRect(-120, -20, 240, 40, 8);

                btn.text.setColor('#FFD700');
                btn.setScale(1);
            }
        });

        this.selectedIndex = index;
    }

    selectButton(index) {
        this.highlightButton(index);
    }

    handleButtonClick(sceneName, index) {
        // Regra de Ouro: Tenta forçar a tela cheia antes de iniciar a transição
        // Isso funciona aqui porque a função foi originada de um clique ou teclado!
        if (!this.scale.isFullscreen && sceneName !== null) {
            this.scale.startFullscreen();
        }

        // Efeito de saída
        this.cameras.main.fade(300, 0, 0, 0);

        this.time.delayedCall(300, () => {
            if (sceneName === null) {
                // Sair do jogo (Sai da tela cheia antes de destruir)
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                }
                this.game.destroy(true);
            } else {
                // Mudar de cena
                this.scene.start(sceneName);
            }
        });
    }

    setupKeyboardControls() {
        // Controles de navegação
        this.input.keyboard.on('keydown-UP', () => {
            const newIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
            this.selectButton(newIndex);
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            const newIndex = (this.selectedIndex + 1) % this.buttons.length;
            this.selectButton(newIndex);
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            const selectedButton = this.buttons[this.selectedIndex];
            this.handleButtonClick(selectedButton.sceneName, this.selectedIndex);
        });

        // BÔNUS DE GAME DESIGN: Tecla 'F' para alternar Tela Cheia a qualquer momento
        this.input.keyboard.on('keydown-F', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });
    }

    update() {
        // Animação contínua de pulsação suave nos botões não selecionados
        this.buttons.forEach((btn, index) => {
            if (index !== this.selectedIndex) {
                btn.setAlpha(0.85 + Math.sin(this.time.now * 0.003) * 0.1);
            } else {
                btn.setAlpha(1);
            }
        });
    }
}
