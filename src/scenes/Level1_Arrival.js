import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';

export default class Level1_Arrival extends Phaser.Scene {
    constructor() {
        super('Level1_Arrival');
        this.lastDamageTime = 0;
        this.damageCooldown = 1000; // 1 segundo entre danos
    }

   preload() {
    this.load.image('vaguetti', './assets/Vaguetti/sprite_vaguettev2_fundoremovido7.png');
    this.load.image('forest_trees', './assets/ForestVegetation/forest_tiles_trees_with_shadows.png');
    this.load.image('clean_florest', './assets/clean_florest.png');
    this.load.image('moto_foda', './assets/moto_foda.png');
}

    create() {
        // Redefinir limites do mundo para permitir exploração horizontal
        const worldWidth = this.scale.width * 2;
        const worldHeight = this.scale.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Reset keyboard listeners para evitar conflitos
        this.input.keyboard.off('keydown-SPACE');
        this.input.keyboard.off('keydown-ESC');

        // Fundo - Dark Forest - RESPONSIVO
        const w = worldWidth;
        const h = worldHeight;
        
        // Fundo do level (clean florest) como background principal
        this.add.image(0, 0, 'clean_florest').setOrigin(0, 0).setDisplaySize(w, h).setDepth(-1);

        // Criar árvores animadas nas partes superior e inferior
        this.createAnimatedTrees(w, h);

        // Criar flores, arbustos e grama
        this.createFlora(w, h);

        // Camada de escuridão (Night Overlay) - Crepúsculo (6:30 da noite)
        this.nightOverlay = this.add.graphics();
        this.nightOverlay.fillStyle(0x000000, 0.5); // Começa já escuro (50% opaco)
        this.nightOverlay.fillRect(0, 0, w, h);
        this.nightOverlay.setScrollFactor(0);
        this.nightOverlay.setDepth(100); // Acima de tudo exceto luz e UI

        // Transição suave para o pôr do sol
        this.tweens.add({
            targets: this.nightOverlay,
            alpha: 0.7, // Fica ainda mais escuro ao passar do tempo
            duration: 5000, // 5 segundos para escurecer
            delay: 3000
        });

        // Personagem Vaguetti (Player)
        this.player = new Player(this, this.scale.width * 0.15, h * 0.65);
        const vaguettiScale = Math.min(h / 600, 1) * 1.0;
        this.player.setScale(vaguettiScale);
        this.player.setDepth(10);
        this.player.light.setDepth(101); // Acima da escuridão
        this.player.beam.setDepth(102);
        this.player.fuelBar.setDepth(103);

        // Feedback de controles
        const controlText = this.add.text(this.scale.width * 0.5, h * 0.9, 
            'WASD: Mover | F: Ligar/Desligar Lampião | ESPAÇO: Feixe de Luz', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.time.delayedCall(5000, () => {
            this.tweens.add({ targets: controlText, alpha: 0, duration: 1000 });
        });

        // Cena segura: sem spawn de inimigos nem colisões hostis

        // Configurar Câmera
        this.cameras.main.setBounds(0, 0, w, h);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // Título da cena com animação - RESPONSIVO (Fixado na tela)
        const uiScale = this.scale.width / 1200;
        const titleSize = Math.max(24, this.scale.width / 25);
        const descSize = Math.max(12, this.scale.width / 70);

        const title = this.add.text(this.scale.width * 0.5, h * 0.08, 'A Chegada em Valdelobos', {
            fontFamily: 'Arial, sans-serif',
            fontSize: titleSize + 'px',
            fontStyle: 'bold',
            color: '#FF6B00',
            align: 'center',
            shadow: {
                offsetX: 2, offsetY: 2, color: '#000000', blur: 8, fill: true
            }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        // Descrição narrativa
        this.add.text(this.scale.width * 0.5, h * 0.16, 'Você chegou de moto. Siga a pé em direção ao rio (direita).', {
            fontFamily: 'Arial, sans-serif',
            fontSize: descSize + 'px',
            color: '#CCCCCC',
            align: 'center',
            wordWrap: { width: this.scale.width * 0.8 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        // Botão ESC para voltar ao menu
        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });

        // Adicionar partículas de névoa
        this.createFogParticles(w, h);

        // Zona de transição no final da fase
        this.transitionZone = this.add.zone(w - 50, h * 0.5, 100, h);
        this.physics.add.existing(this.transitionZone, true);
        
        this.physics.add.overlap(this.player, this.transitionZone, () => {
            this.continueGame();
        });
    }

    createBackgroundForest(w, h) {
        const spacing = 200; // Mais denso
        const treeCount = Math.ceil(w / spacing);
        
        for (let i = 0; i < treeCount; i++) {
            const x = i * spacing + Math.random() * 100;
            const tree = this.add.sprite(x, h * 0.15 + Math.random() * 50, 'forest_trees');
            tree.setScale(0.2 + Math.random() * 0.15);
            tree.setTint(0x223322); // Mais escuro e azulado
            tree.setDepth(1);
        }
    }

    createSideTreesWithSprites(w, h) {
        const spacing = 350;
        const treeCount = Math.ceil(w / spacing);
        
        for (let i = 0; i < treeCount; i++) {
            // Superior/Fundo
            const tx = i * spacing + Math.random() * 50;
            const topTree = this.add.sprite(tx, h * 0.4, 'forest_trees');
            topTree.setScale(0.5);
            topTree.setDepth(2);
            topTree.setTint(0x1a2a1a);

            // Inferior/Frente
            const bx = i * spacing + 150 + Math.random() * 50;
            const bottomTree = this.add.sprite(bx, h * 0.88, 'forest_trees');
            bottomTree.setScale(0.8);
            bottomTree.setDepth(20); // Bem na frente
            bottomTree.setTint(0x0a1a0a);
        }
    }

    createRoad(graphics, w, h) {
        const roadY = h * 0.63;
        const roadHeight = h * 0.25;

        // Asfalto com textura simulada
        graphics.fillStyle(0x333333, 1);
        graphics.fillRect(0, roadY, w, roadHeight);
        
        // Bordas da estrada
        graphics.fillStyle(0x222222, 1);
        graphics.fillRect(0, roadY - 5, w, 5);
        graphics.fillRect(0, roadY + roadHeight, w, 10);

        // Detalhes da estrada - linhas amarelas duplas no centro
        graphics.fillStyle(0xccaa00, 0.6);
        const markCount = Math.ceil(w / 150);
        for (let i = 0; i < markCount; i++) {
            graphics.fillRect(i * 150 + 50, roadY + roadHeight * 0.48, 60, 4);
            graphics.fillRect(i * 150 + 50, roadY + roadHeight * 0.52, 60, 4);
        }
    }

    createMotorcycle(graphics, motoX, motoY) {
        const h = this.scale.height;
        const scale = Math.max(0.8, h / 600);

        // Corpo da moto
        graphics.fillStyle(0x1a1a1a, 1);
        graphics.fillRect(motoX - 60 * scale, motoY - 20 * scale, 120 * scale, 35 * scale);

        // Banco
        graphics.fillStyle(0x330000, 1);
        graphics.fillEllipse(motoX - 10 * scale, motoY - 30 * scale, 40 * scale, 20 * scale);

        // Guidom
        graphics.lineStyle(3, 0x666666, 1);
        graphics.beginPath();
        graphics.moveTo(motoX + 40 * scale, motoY - 20 * scale);
        graphics.lineTo(motoX + 40 * scale, motoY - 40 * scale);
        graphics.strokePath();

        // Rodas
        this.drawWheel(graphics, motoX - 40 * scale, motoY + 20 * scale, 15 * scale);
        this.drawWheel(graphics, motoX + 40 * scale, motoY + 20 * scale, 15 * scale);

        // Farol
        graphics.fillStyle(0xFFFF99, 0.8);
        graphics.fillEllipse(motoX - 55 * scale, motoY - 20 * scale, 8 * scale, 12 * scale);
    }

    drawWheel(graphics, x, y, radius) {
        graphics.lineStyle(4, 0x333333, 1);
        graphics.strokeCircle(x, y, radius);
        graphics.lineStyle(2, 0x666666, 1);
        graphics.strokeCircle(x, y, radius - 4);
        graphics.fillStyle(0x444444, 1);
        graphics.fillCircle(x, y, 3);
    }

    createFogParticles(w, h) {
        const g = this.make.graphics({x: 0, y: 0, add: false});
        g.fillStyle(0x888888, 0.3);
        g.fillCircle(8, 8, 8);
        g.generateTexture('fog_texture_l1', 16, 16);

        // Partículas de névoa animadas
        this.fogParticles = this.add.particles(0, 0, 'fog_texture_l1', {
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
        this.fogParticles.setDepth(15);
    }

    continueGame() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('FishingScene');
        });
    }

    spawnEnemy(x, y, type) {
        const tex = type === 'light' ? 'enemy_light_tex' : 'enemy_shadow_tex';
        const enemy = new Enemy(this, x, y, tex, type);
        enemy.setDepth(10);
        this.enemies.add(enemy);
    }

    handlePlayerDamage(enemy) {
        // Verificar cooldown para não dar dano múltiplas vezes rapidamente
        const now = this.time.now;
        if (now - this.lastDamageTime < this.damageCooldown) {
            return;
        }
        this.lastDamageTime = now;
        
        // Inimigo de sombra só causa dano se a luz estiver desligada
        if (enemy.type === 'shadow' && this.player.isLightOn) {
            return; // Não causa dano
        }
        this.player.takeDamage(10);
    }

    gameOver() {
        this.physics.pause();
        this.player.setTint(0x444444);
        this.cameras.main.fade(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOver');
        });
    }

    createAnimatedTrees(w, h) {
        // Árvores na parte superior (background/fundo) - distribuição mais caótica
        const topSpacing = 280;
        const topTreeCount = Math.ceil(w / topSpacing) + 3;
        
        for (let i = 0; i < topTreeCount; i++) {
            const x = i * topSpacing + Math.random() * 200 - 50; // Mais aleatoriedade
            const y = h * 0.12 + Math.random() * 60; // Altura mais variável
            const treeType = Math.random() > 0.5 ? 'tree_1_sway' : 'tree_2_sway';
            const scale = 0.5 + Math.random() * 0.5; // Tamanho mais variável
            const tree = this.add.sprite(x, y, treeType === 'tree_1_sway' ? 'tree_1_1' : 'tree_2_1');
            tree.setScale(scale);
            tree.setDepth(3);
            tree.play(treeType);
        }

        // Árvores na parte inferior (frente) - distribuição caótica
        const bottomSpacing = 250;
        const bottomTreeCount = Math.ceil(w / bottomSpacing) + 3;
        
        for (let i = 0; i < bottomTreeCount; i++) {
            const x = i * bottomSpacing + Math.random() * 250 - 100; // Muito mais aleatoriedade
            const y = h * 0.82 + Math.random() * 40; // Altura variável
            const treeType = Math.random() > 0.5 ? 'tree_1_sway' : 'tree_2_sway';
            const scale = 0.7 + Math.random() * 0.5; // Tamanho variável
            const tree = this.add.sprite(x, y, treeType === 'tree_1_sway' ? 'tree_1_1' : 'tree_2_1');
            tree.setScale(scale);
            tree.setDepth(25); // Na frente do player
            tree.play(treeType);
        }
    }

    createFlora(w, h) {
        // Grama na parte inferior do cenário - mais distribuída
        const grassSpacing = 120;
        const grassCount = Math.ceil(w / grassSpacing) + 5;
        
        for (let i = 0; i < grassCount; i++) {
            const x = i * grassSpacing + Math.random() * 80 - 40;
            const y = h * 0.84 + Math.random() * 25; // Mais variação de altura
            const grass = this.add.sprite(x, y, 'grass_1');
            grass.setScale(0.4 + Math.random() * 0.35);
            grass.setDepth(22); // Abaixo das árvores inferiores
            grass.play('grass_sway');
        }

        // Arbustos espalhados pelo cenário - distribuição mais natural
        const bushSpacing = 350;
        const bushCount = Math.ceil(w / bushSpacing) + 4;
        
        for (let i = 0; i < bushCount; i++) {
            const x = i * bushSpacing + Math.random() * 200 - 100;
            const yVariation = Math.random() > 0.5 ? h * 0.20 : h * 0.78; // Parte superior ou inferior
            const y = yVariation + Math.random() * 40;
            const bushType = Math.random() > 0.5 ? 'bush_1' : 'bush_2';
            const bush = this.add.sprite(x, y, bushType);
            bush.setScale(0.4 + Math.random() * 0.35);
            
            if (yVariation > h * 0.5) {
                bush.setDepth(23); // Acima das flores, abaixo das árvores inferiores
            } else {
                bush.setDepth(2); // Atrás se for na parte superior
            }
        }

        // Flores distribuídas pelo cenário - MUITO MENORES E MAIS BAIXAS
        const flowerSpacing = 180;
        const flowerCount = Math.ceil(w / flowerSpacing) + 8;
        const flowerTypes = ['flower_1_bloom', 'flower_2_bloom', 'flower_3_bloom', 'flower_4_bloom'];
        const flowerFirstFrames = ['flower_1_1', 'flower_2_1', 'flower_3_1', 'flower_4_1'];
        
        for (let i = 0; i < flowerCount; i++) {
            const x = i * flowerSpacing + Math.random() * 120 - 60;
            const y = h * 0.87 + Math.random() * 20; // Bem perto do chão
            const flowerIndex = Math.floor(Math.random() * flowerTypes.length);
            const flower = this.add.sprite(x, y, flowerFirstFrames[flowerIndex]);
            flower.setScale(0.18 + Math.random() * 0.15); // MUITO MENOR (era 0.4-0.8)
            flower.setDepth(21); // Abaixo da grama e arbustos inferiores mas acima de tudo na base
            flower.play(flowerTypes[flowerIndex]);
        }
    }

    update() {
        if (this.player) {
            this.player.update();
        }
        
        // Fumaça saindo do lampião
        if (this.player && this.player.fuel > 0) {
            if (Math.random() > 0.8) {
                const smoke = this.add.image(this.player.x + this.player.lightXOffset, this.player.y + this.player.lightYOffset, 'smoke');
                smoke.setDepth(101);
                smoke.setAlpha(0.3);
                smoke.setScale(0.5);
                this.tweens.add({
                    targets: smoke,
                    y: smoke.y - 100,
                    x: smoke.x + (Math.random() - 0.5) * 50,
                    alpha: 0,
                    scale: 1.5,
                    duration: 1500,
                    onComplete: () => smoke.destroy()
                });
            }
        }
    }
}
