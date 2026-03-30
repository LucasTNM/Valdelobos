import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';

export default class Level4_Camp extends Phaser.Scene {
    constructor() {
        super('Level4_Camp');
    }

    preload() {
        this.load.image('vaguetti', './assets/Vaguetti.png');
        this.load.image('forest_trees', './assets/ForestVegetation/forest_tiles_trees_with_shadows.png');
        this.load.image('bg_dark_forest', './assets/ForestVegetation/dark_forest.png');
        this.load.image('querosene', './assets/querosene.png');
    }

    create() {
        const worldWidth = this.scale.width * 2;
        const worldHeight = this.scale.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        const w = worldWidth;
        const h = worldHeight;

        // Fundo do level (dark forest)
        this.add.image(0, 0, 'bg_dark_forest').setOrigin(0, 0).setDisplaySize(w, h).setDepth(-1);

        const graphics = this.add.graphics();

        // Fundo escuro (Acampamento à noite) com alpha para mostrar a floresta
        graphics.fillStyle(0x050505, 0.55);
        graphics.fillRect(0, 0, w, h);

        // Chão de terra
        graphics.fillStyle(0x2b1d0e, 1);
        graphics.fillRect(0, h * 0.6, w, h * 0.4);

        // Árvores ao fundo
        this.createCampForest(w, h);

        // Barracas rasgadas (Cena 4)
        this.createTents(graphics, h);

        // Fogueira apagada
        this.createCampfire(graphics, w * 0.5, h * 0.7);

        // Player
        this.player = new Player(this, 100, h * 0.7);
        const vaguettiScale = Math.min(h / 600, 1) * 0.7;
        this.player.setScale(vaguettiScale);
        this.player.setDepth(10);
        this.player.light.setDepth(101);
        this.player.beam.setDepth(102);
        this.player.fuelBar.setDepth(103);

        // Grupo de Inimigos
        this.enemies = this.physics.add.group({ runChildUpdate: true });
        this.spawnEnemies(w, h);

        // Night Overlay
        this.nightOverlay = this.add.graphics();
        this.nightOverlay.fillStyle(0x000000, 0.9);
        this.nightOverlay.fillRect(0, 0, w, h);
        this.nightOverlay.setScrollFactor(0);
        this.nightOverlay.setDepth(100);

        // Câmera
        this.cameras.main.setBounds(0, 0, w, h);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // Itens: Frascos de Querosene
        this.createFuelItems(w, h);

        // UI Text
        const titleSize = Math.max(24, this.scale.width / 25);
        this.add.text(this.scale.width * 0.5, h * 0.08, 'O Acampamento Abandonado', {
            fontFamily: 'Arial, sans-serif',
            fontSize: titleSize + 'px',
            color: '#FF6B00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.add.text(this.scale.width * 0.5, h * 0.16, 'Colete o querosene e encontre a saída (direita).', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '16px',
            color: '#CCCCCC'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        // Transição
        this.transitionZone = this.add.zone(w - 50, h * 0.5, 100, h);
        this.physics.add.existing(this.transitionZone, true);
        this.physics.add.overlap(this.player, this.transitionZone, () => {
            this.continueGame();
        });
        // Partículas de névoa no acampamento
        this.add.particles(0, 0, 'fog_texture_l1', {
            speed: { min: -10, max: 10 },
            scale: { start: 2, end: 0 },
            lifespan: 4000,
            alpha: 0.2,
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(0, 0, w, h)
            }
        }).setDepth(15);
    }

    createCampForest(w, h) {
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * w;
            const tree = this.add.sprite(x, h * 0.4, 'forest_trees');
            tree.setScale(0.4 + Math.random() * 0.2);
            tree.setTint(0x1a1a1a);
        }
    }

    createTents(graphics, h) {
        const tentX = [400, 800, 1200];
        tentX.forEach(x => {
            graphics.fillStyle(0x4a412a, 1);
            graphics.beginPath();
            graphics.moveTo(x - 60, h * 0.7);
            graphics.lineTo(x, h * 0.6);
            graphics.lineTo(x + 60, h * 0.7);
            graphics.closePath();
            graphics.fillPath();
            
            // Rasgos
            graphics.lineStyle(2, 0x000000, 0.8);
            graphics.beginPath();
            graphics.moveTo(x - 10, h * 0.65);
            graphics.lineTo(x + 5, h * 0.68);
            graphics.strokePath();
        });
    }

    createCampfire(graphics, x, y) {
        graphics.fillStyle(0x333333, 1);
        for (let i = 0; i < 5; i++) {
            graphics.fillCircle(x + (i - 2) * 15, y, 10);
        }
        // Cinzas
        graphics.fillStyle(0x111111, 1);
        graphics.fillEllipse(x, y, 60, 20);

        // Algumas toras de madeira
        graphics.fillStyle(0x3a2a1a, 1);
        graphics.fillRect(x - 40, y - 5, 30, 10);
        graphics.fillRect(x + 10, y - 5, 30, 10);
    }

    createFuelItems(w, h) {
        this.fuelGroup = this.physics.add.group();
        const fuelPositions = [600, 1000, 1500];
        
        fuelPositions.forEach(x => {
            // Imagem do querosene
            const fuelImg = this.add.image(0, 0, 'querosene');
            fuelImg.setScale(0.5);
            
            // Brilho externo (aura)
            const aura = this.add.image(0, 0, 'light_mask');
            aura.setScale(0.2);
            aura.setTint(0x00ffff);
            aura.setAlpha(0.3);
            
            const container = this.add.container(x, h * 0.7, [aura, fuelImg]);
            this.physics.add.existing(container);
            this.fuelGroup.add(container);
            
            // Animação de flutuar e girar levemente
            this.tweens.add({
                targets: container,
                y: h * 0.68,
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.tweens.add({
                targets: aura,
                scale: 0.25,
                alpha: 0.1,
                duration: 1200,
                yoyo: true,
                repeat: -1
            });
        });

        this.physics.add.overlap(this.player, this.fuelGroup, (p, fuel) => {
            fuel.destroy();
            this.player.fuel = Math.min(this.player.maxFuel, this.player.fuel + 30);
            
            const txt = this.add.text(this.player.x, this.player.y - 50, '+30 QUEROSENE', {
                fontSize: '14px',
                color: '#00ffff'
            }).setOrigin(0.5).setAlpha(1).setDepth(100);
            
            // Texto desaparece
            this.tweens.add({
                targets: txt,
                y: this.player.y - 100,
                alpha: 0,
                duration: 1000,
                onComplete: () => txt.destroy()
            });
        });

        this.physics.add.overlap(this.player, this.enemies, () => this.handlePlayerDamage());
    }

    spawnEnemies(w, h) {
        for (let i = 0; i < 5; i++) {
            const x = 500 + Math.random() * (w - 600);
            const type = Math.random() > 0.5 ? 'light' : 'shadow';
            const tex = type === 'light' ? 'enemy_light_tex' : 'enemy_shadow_tex';
            const enemy = new Enemy(this, x, h * 0.7, tex, type);
            enemy.setDepth(10);
            this.enemies.add(enemy);
        }
    }

    handlePlayerDamage() {
        this.player.takeDamage(20);
    }

    gameOver() {
        this.scene.start('GameOver');
    }

    continueGame() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('level6_Escape');
        });
    }

    update() {
        this.player.update();
    }
}
