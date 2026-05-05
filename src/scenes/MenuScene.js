import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
        this.buttonHoverScale = 1.1;
        this.selectedIndex = 0;
        this.buttons = [];
        this.debugMode = false;
        this.debugMenuItems = [
            { text: 'Fishing', scene: 'Fishing' },
            { text: 'Chegada (Arrival)', scene: 'Level1_Arrival' },
            { text: 'Acampamento', scene: 'Level4_Camp' },
            { text: 'Floresta Escura', scene: 'Level5_DarkForest' },
            { text: 'Estrada', scene: 'Level6_Road' },
            { text: 'Fuga', scene: 'Level6_Escape' },
            { text: 'Game Over', scene: 'GameOver' }
        ];
    }

    create() {
        // Fundo escuro com gradiente
        this.cameras.main.setBackgroundColor('#000000');
        
        // Adicionar efeito de floresta/nevoa ao fundo
        this.createBackgroundParticles();

        // Título do jogo com efeito de luz
        this.createTitle();

        // Criar painel de debug e menu principal
        this.createDebugInfo();
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
        this.clearMenuButtons();

        const baseMenuItems = [
            { text: 'INICIAR JOGO', scene: 'Fishing' },
            { text: 'MODO DEBUG', scene: 'TOGGLE_DEBUG' },
            { text: 'SAIR', scene: null }
        ];

        const menuItems = this.debugMode
            ? [...this.debugMenuItems, { text: 'VOLTAR AO MENU', scene: 'BACK_TO_MENU' }, { text: 'SAIR', scene: null }]
            : baseMenuItems;

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
        container.buttonWidth = buttonWidth;
        container.buttonHeight = buttonHeight;
        container.buttonScale = scale;

        return container;
    }

    highlightButton(index) {
        this.buttons.forEach((btn, i) => {
            if (btn && btn.bg && btn.text) {
                const width = btn.buttonWidth || 240;
                const height = btn.buttonHeight || 40;
                const radius = 8 * (btn.buttonScale || 1);

                btn.bg.clear();
                if (i === index) {
                    btn.bg.fillStyle(0xFF6B00, 0.9);
                    btn.bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
                    btn.bg.lineStyle(3, 0xFFFFFF, 1);
                    btn.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

                    btn.text.setColor('#FFFFFF');
                    btn.setScale((btn.buttonScale || 1) * 1.05);

                    // Efeito de luz
                    this.tweens.killTweensOf(btn);
                    this.tweens.add({
                        targets: btn,
                        scale: (btn.buttonScale || 1) * 1.1,
                        duration: 300,
                        ease: 'Power2.easeOut'
                    });
                } else {
                    btn.bg.fillStyle(0x2a2a2a, 0.8);
                    btn.bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
                    btn.bg.lineStyle(2, 0xFF6B00, 0.5);
                    btn.bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

                    btn.text.setColor('#FFD700');
                    btn.setScale(btn.buttonScale || 1);
                }
            }
        });

        this.selectedIndex = index;
    }

    selectButton(index) {
        this.highlightButton(index);
    }

    createDebugInfo() {
        const infoText = [
            'DEBUG: pressione D para alternar o modo debug',
            'Use ↑ / ↓ e ENTER para selecionar uma fase',
            'Pressione ESC para voltar ao menu',
            'Modo debug: DESATIVADO'
        ];

        this.debugInfo = this.add.text(this.scale.width * 0.02, this.scale.height * 0.96, infoText.join('\n'), {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            color: '#FFFFFF',
            align: 'left',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            padding: { x: 10, y: 8 }
        }).setOrigin(0, 1).setScrollFactor(0).setDepth(200);
    }

    clearMenuButtons() {
        this.buttons.forEach((btn) => {
            if (btn) {
                btn.destroy();
            }
        });
        this.buttons = [];
    }

    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        this.game.debugMode = this.debugMode;
        this.createMainMenu();

        if (this.debugInfo) {
            const debugState = this.debugMode ? 'ATIVO' : 'DESATIVADO';
            this.debugInfo.setText([
                'DEBUG: pressione D para alternar o modo debug',
                'Use ↑ / ↓ e ENTER para selecionar uma fase',
                'Pressione ESC para voltar ao menu',
                `Modo debug: ${debugState}`
            ].join('\n'));
        }
    }

    handleButtonClick(sceneName, index) {
        if (sceneName === 'TOGGLE_DEBUG') {
            this.toggleDebugMode();
            return;
        }

        if (sceneName === 'BACK_TO_MENU') {
            if (this.debugMode) {
                this.toggleDebugMode();
            }
            return;
        }

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

        // Tecla 'D' ativa/desativa o modo debug
        this.input.keyboard.on('keydown-D', () => {
            this.toggleDebugMode();
        });

        // Tecla 'ESC' volta ao menu principal quando estiver no modo debug
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.debugMode) {
                this.toggleDebugMode();
            }
        });

        // Tecla 'F' alterna Tela Cheia a qualquer momento
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
