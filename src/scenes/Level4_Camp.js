import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';

export default class Level4_Camp extends Phaser.Scene {
    constructor() {
        super('Level4_Camp');
    }

    preload() {
        this.load.image('vaguetti', './assets/vaguettepng/default.png');
        this.load.image('bg_dark_forest', './assets/dark_forest.png');
        this.load.image('querosene', './assets/querosene.png');
    }

    create() {
        const worldWidth = this.scale.width * 2;
        const worldHeight = this.scale.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        const w = worldWidth;
        const h = worldHeight;

        // Fundo do level (dark forest) - visível ao fundo
        this.add.image(0, 0, 'bg_dark_forest').setOrigin(0, 0).setDisplaySize(w, h).setDepth(-1);

        // Overlay escuro semitransparente para criar atmosfera noturna
        const darkOverlay = this.add.graphics();
        darkOverlay.fillStyle(0x000000, 0.6);
        darkOverlay.fillRect(0, 0, w, h);
        darkOverlay.setDepth(5);
        darkOverlay.setScrollFactor(0, 0);

        // Player
        this.player = new Player(this, w * 0.2, h * 0.7);
        const vaguettiScale = Math.min(h / 600, 1) * 0.7;
        this.player.setScale(vaguettiScale);
        this.player.setDepth(10);
        this.player.light.setDepth(101);
        this.player.beam.setDepth(102);
        this.player.fuelBar.setDepth(103);

        // Grupo de Inimigos
        this.enemies = this.physics.add.group({ runChildUpdate: true });
        this.spawnEnemies(w, h);

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

        // Partículas de névoa
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
            this.scene.start('Level5_DarkForest');
        });
    }

    update() {
        this.player.update();
    }
}
