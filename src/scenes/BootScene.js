import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Carregar a imagem do personagem
        this.load.image('tela_inicial', './assets/tela_inicial.png');
        this.load.image('hero', './assets/hero.png');
        this.load.image('vaguetti', './assets/Vaguetti.png');

        // Monstros principais:
        // skeleton-walk é sprite sheet 192x48 (4 frames 48x48)
        this.load.spritesheet('enemy_light_tex', '/assets/skeleton-walk.png', {
            frameWidth: 48,
            frameHeight: 48
        });

        // sprite_transparente.gif é gif animado (armazenado como imagem estática em alguns casos)
        this.load.image('enemy_shadow_tex', '/assets/sprite_transparente.gif');

        // Assets gerais de fase
        this.load.image('bg_dark_forest', '/assets/forest/vegetation/dark%20forest.png');
        this.load.image('moto_foda', '/assets/moto%20foda.png');


        this.load.on('loaderror', (file) => {
            if (file.key === 'enemy_light_tex' || file.key === 'enemy_shadow_tex') {
                console.warn('Falha no carregamento de', file.key, '-> fallback placeholder será usado.');
            }
        });
    }

    create() {
        this.createGameTextures();
        
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

    createGameTextures() {
        // Textura do gradiente de luz do lampião
        const size = 256;
        const canvas = this.textures.createCanvas('light_mask', size, size);
        const ctx = canvas.getContext();
        
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        canvas.refresh();

        // Criar animações globais para inimigos
        if (!this.anims.exists('enemy_light_walk')) {
            this.anims.create({
                key: 'enemy_light_walk',
                frames: this.anims.generateFrameNumbers('enemy_light_tex', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('enemy_shadow_idle')) {
            // Caso o GIF de sombra não seja animado em Phaser, mantém um frame estático.
            this.anims.create({
                key: 'enemy_shadow_idle',
                frames: [{ key: 'enemy_shadow_tex', frame: null }],
                frameRate: 1,
                repeat: -1
            });
        }

        // Textura do feixe de luz (Ataque)
        const beamW = 400;
        const beamH = 100;
        const beamCanvas = this.textures.createCanvas('light_beam', beamW, beamH);
        const beamCtx = beamCanvas.getContext();
        
        const beamGrad = beamCtx.createRadialGradient(0, beamH/2, 0, 0, beamH/2, beamW);
        beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        beamCtx.fillStyle = beamGrad;
        beamCtx.beginPath();
        beamCtx.moveTo(0, beamH * 0.4);
        beamCtx.lineTo(beamW, 0);
        beamCtx.lineTo(beamW, beamH);
        beamCtx.lineTo(0, beamH * 0.6);
        beamCtx.closePath();
        beamCtx.fill();
        beamCanvas.refresh();

        // Textura de partícula (fumaça/névoa)
        const particleSize = 32;
        const pCanvas = this.textures.createCanvas('smoke', particleSize, particleSize);
        const pCtx = pCanvas.getContext();
        const pGrad = pCtx.createRadialGradient(particleSize/2, particleSize/2, 0, particleSize/2, particleSize/2, particleSize/2);
        pGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        pCtx.fillStyle = pGrad;
        pCtx.fillRect(0, 0, particleSize, particleSize);
        pCanvas.refresh();
    }
}
