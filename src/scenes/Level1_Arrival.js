import Phaser from 'phaser';

export default class Level1_Arrival extends Phaser.Scene {
    constructor() {
        super('Level1_Arrival');
    }

    preload() {
        // O Vite serve a pasta "public" na raiz. Comece direto pelo nome da pasta.
        this.load.image('vaguetti', '/assets/Vaguetti.png');
        this.load.image('forest_trees', '/assets/ForestVegetation/forest_tiles_trees_with_shadows.png');
    }

    create() {
        // Reset keyboard listeners para evitar conflitos
        this.input.keyboard.off('keydown-SPACE');
        this.input.keyboard.off('keydown-ESC');

        // Fundo - céu/floresta ao fundo - RESPONSIVO
        const graphics = this.add.graphics();
        const w = this.scale.width;
        const h = this.scale.height;
        
        // Céu noturno degradado
        graphics.fillStyle(0x0a0a1a, 1);
        graphics.fillRect(0, 0, w, h * 0.5);
        
        graphics.fillStyle(0x1a0a0a, 1);
        graphics.fillRect(0, h * 0.5, w, h * 0.5);

        // Grama/fundo verde escuro
        graphics.fillStyle(0x0d3d0d, 1);
        graphics.fillRect(0, h * 0.58, w, h * 0.42);

        // Camada de árvores ao fundo (usando sprite)
        this.createBackgroundForest();

        // Estrada principal
        this.createRoad(graphics);

        // Árvores nas laterais com sprites
        this.createSideTreesWithSprites();

        // Moto na estrada
        this.createMotorcycle(graphics);

        // Personagem Vaguetti
        const vaguetti = this.add.image(w * 0.15, h * 0.65, 'vaguetti');
        vaguetti.setOrigin(0.5, 1);
        const vaguettiScale = Math.min(h / 600, 1) * 0.7;
        vaguetti.setScale(vaguettiScale);

        // Título da cena com animação - RESPONSIVO
        const titleSize = Math.max(24, w / 25);
        const descSize = Math.max(12, w / 70);
        const actionSize = Math.max(10, w / 90);

        this.add.text(w * 0.5, h * 0.08, 'A Chegada em Valdelobos', {
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
        }).setOrigin(0.5);

        // Descrição narrativa
        this.add.text(w * 0.5, h * 0.16, 'Você avista uma moto abandonada na estrada florestal...', {
            fontFamily: 'Arial, sans-serif',
            fontSize: descSize + 'px',
            color: '#CCCCCC',
            align: 'center',
            wordWrap: { width: w * 0.8 }
        }).setOrigin(0.5);

        // Texto de interação
        const actionText = this.add.text(w * 0.5, h * 0.92, 'Pressione ESPAÇO para continuar', {
            fontFamily: 'Arial, sans-serif',
            fontSize: actionSize + 'px',
            color: '#FFD700',
            align: 'center'
        }).setOrigin(0.5);

        // Animação pulsante no texto de ação
        this.tweens.add({
            targets: actionText,
            alpha: { from: 0.5, to: 1 },
            duration: 1000,
            repeat: -1,
            yoyo: true
        });

        // Interatividade
        this.input.keyboard.once('keydown-SPACE', () => {
            this.continueGame();
        });

        // Botão ESC para voltar ao menu
        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });

        // Adicionar partículas de névoa
        this.createFogParticles();
    }

    createBackgroundForest() {
        // Criar árvores ao fundo usando o sprite - RESPONSIVO
        const w = this.scale.width;
        const h = this.scale.height;
        const positions = [
            { x: w * 0.06, y: h * 0.15, scale: 0.3 },
            { x: w * 0.18, y: h * 0.12, scale: 0.25 },
            { x: w * 0.31, y: h * 0.16, scale: 0.35 },
            { x: w * 0.47, y: h * 0.14, scale: 0.28 },
            { x: w * 0.63, y: h * 0.13, scale: 0.3 },
            { x: w * 0.81, y: h * 0.15, scale: 0.32 },
            { x: w * 0.94, y: h * 0.135, scale: 0.27 }
        ];

        positions.forEach(pos => {
            const tree = this.add.sprite(pos.x, pos.y, 'forest_trees');
            tree.setScale(pos.scale);
            tree.setTint(0x4a7a4a); // Tons mais escuros para distância
            tree.setDepth(1);
        });
    }

    createSideTreesWithSprites() {
        // Árvores da esquerda - RESPONSIVO
        const w = this.scale.width;
        const h = this.scale.height;
        const leftTrees = [
            { x: -w * 0.08, y: h * 0.33, scale: 0.5 },
            { x: -w * 0.12, y: h * 0.47, scale: 0.6 },
            { x: -w * 0.1, y: h * 0.58, scale: 0.55 },
            { x: -w * 0.15, y: h * 0.7, scale: 0.65 }
        ];

        leftTrees.forEach(tree => {
            const sprite = this.add.sprite(tree.x, tree.y, 'forest_trees');
            sprite.setScale(tree.scale);
            sprite.setDepth(5);
            sprite.setTint(0x5a8a5a);
        });

        // Árvores da direita - RESPONSIVO
        const rightTrees = [
            { x: w * 1.08, y: h * 0.35, scale: 0.52 },
            { x: w * 1.12, y: h * 0.5, scale: 0.62 },
            { x: w * 1.1, y: h * 0.62, scale: 0.58 },
            { x: w * 1.15, y: h * 0.73, scale: 0.68 }
        ];

        rightTrees.forEach(tree => {
            const sprite = this.add.sprite(tree.x, tree.y, 'forest_trees');
            sprite.setScale(tree.scale);
            sprite.setDepth(5);
            sprite.setTint(0x5a8a5a);
        });
    }

    createRoad(graphics) {
        // Estrada cinza - RESPONSIVO
        const w = this.scale.width;
        const h = this.scale.height;
        const roadY = h * 0.63;
        const roadHeight = h * 0.25;

        graphics.fillStyle(0x4a4a4a, 1);
        graphics.fillRect(0, roadY, w, roadHeight);

        // Detalhes da estrada - linhas brancas divisórias
        graphics.lineStyle(3, 0xFFFFFF, 0.4);
        graphics.beginPath();
        graphics.moveTo(0, roadY + roadHeight * 0.115);
        graphics.lineTo(w, roadY + roadHeight * 0.115);
        graphics.strokePath();

        // Marcações brancas na estrada
        graphics.fillStyle(0xFFFFFF, 0.3);
        const markCount = Math.ceil(w / 100);
        for (let i = 0; i < markCount; i++) {
            graphics.fillRect(i * (w / markCount) - 50, roadY + roadHeight * 0.1, 40, 10);
        }

        // Sombra/profundidade nas laterais
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRect(0, roadY + roadHeight * 0.7, w, roadHeight * 0.3);
    }

    createMotorcycle(graphics) {
        // Moto na estrada - RESPONSIVO
        const w = this.scale.width;
        const h = this.scale.height;
        const motoX = w * 0.75;
        const motoY = h * 0.7;
        const scale = Math.max(0.8, h / 600);

        // Corpo da moto
        graphics.fillStyle(0x1a1a1a, 1);
        graphics.fillRect(motoX - 60 * scale, motoY - 20 * scale, 120 * scale, 35 * scale);

        // Banco
        graphics.fillStyle(0x330000, 1);
        graphics.fillEllipse(motoX - 10 * scale, motoY - 30 * scale, 40 * scale, 20 * scale);

        // Guidom (volante)
        graphics.lineStyle(3, 0x666666, 1);
        graphics.beginPath();
        graphics.moveTo(motoX + 40 * scale, motoY - 20 * scale);
        graphics.lineTo(motoX + 40 * scale, motoY - 40 * scale);
        graphics.strokePath();

        graphics.fillStyle(0x444444, 1);
        graphics.fillEllipse(motoX + 40 * scale, motoY - 40 * scale, 12 * scale, 6 * scale);

        // Rodas
        this.drawWheel(graphics, motoX - 40 * scale, motoY + 20 * scale, 15 * scale);
        this.drawWheel(graphics, motoX + 40 * scale, motoY + 20 * scale, 15 * scale);

        // Farol
        graphics.fillStyle(0xFFFF99, 0.8);
        graphics.fillEllipse(motoX - 55 * scale, motoY - 20 * scale, 8 * scale, 12 * scale);

        // Efeito de movimento (linhas)
        graphics.lineStyle(2, 0xAAAAAA, 0.3);
        graphics.beginPath();
        graphics.moveTo(motoX - 100 * scale, motoY + 10 * scale);
        graphics.lineTo(motoX - 70 * scale, motoY + 10 * scale);
        graphics.strokePath();
    }

    drawWheel(graphics, x, y, radius) {
        // Roda
        graphics.lineStyle(4, 0x333333, 1);
        graphics.strokeCircle(x, y, radius);

        // Aro
        graphics.lineStyle(2, 0x666666, 1);
        graphics.strokeCircle(x, y, radius - 4);

        // Centro
        graphics.fillStyle(0x444444, 1);
        graphics.fillCircle(x, y, 3);
    }

    createFogParticles() {
        // 1. Criamos uma textura de névoa (uma bolinha difusa) programaticamente
        const g = this.make.graphics({x: 0, y: 0, add: false});
        g.fillStyle(0x888888, 0.3); // Cor cinza com transparência
        g.fillCircle(8, 8, 8);
        g.generateTexture('fog_texture', 16, 16); // Salva a textura na memória

        // 2. Criamos as partículas usando a nova sintaxe do Phaser 3.60+ - RESPONSIVO
        const w = this.scale.width;
        const h = this.scale.height;
        this.add.particles(0, 0, 'fog_texture', {
            speed: { min: -20, max: 20 },
            angle: { min: 220, max: 320 },
            scale: { start: 1.5, end: 0 },
            lifespan: 3000,
            gravityY: -10,
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(0, h * 0.33, w, h * 0.67)
            },
            frequency: 150
        });
    }

    continueGame() {
        // Transição suave
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene'); // Voltar ao menu
        });
    }

    update() {
        // Partes que precisam de atualização a cada frame
    }
}

