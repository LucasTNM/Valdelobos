import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import { playAmbient } from '../utils/ambientAudio';
import { showDialogue } from '../utils/dialogue';

export default class Level4_Camp extends Phaser.Scene {
    constructor() {
        super('Level4_Camp');
        this.lastDamageTime = 0;
        this.damageCooldown = 1000;
    }

    preload() {
        this.load.image('vaguetti', './assets/Vaguetti/sprite_vaguettev2_fundoremovido7.png');
        this.load.image('bg_dark_forest', './assets/acapamento.jpg');
        this.load.image('querosene', './assets/querosene.png');
    }

    create() {
        this.isTransitioning = false;
        this.lastDamageTime = 0;

        const worldWidth = this.scale.width * 2;
        const worldHeight = this.scale.height;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        const w = worldWidth;
        const h = worldHeight;

        this.add.image(0, 0, 'bg_dark_forest').setOrigin(0, 0).setDisplaySize(w, h).setDepth(-1);

        const darkOverlay = this.add.graphics();
        darkOverlay.fillStyle(0x000000, 0.6);
        darkOverlay.fillRect(0, 0, w, h);
        darkOverlay.setDepth(5);
        darkOverlay.setScrollFactor(0, 0);

        this.player = new Player(this, w * 0.2, h * 0.7);
        const vaguettiScale = Math.min(h / 600, 1) * 0.7;
        this.player.setScale(vaguettiScale);

        playAmbient(this, 'noite', 0.08);
        this.player.setDepth(10);
        this.player.light.setDepth(101);
        this.player.beam.setDepth(102);
        this.player.fuelBar.setDepth(103);

        this.enemies = this.physics.add.group({ runChildUpdate: true });
        this.spawnEnemies(w, h);

        this.cameras.main.setBounds(0, 0, w, h);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        showDialogue(this, 'O QUE SÃO ESSAS COISAS?');

        this.createFuelItems(w, h);

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

        this.transitionZone = this.add.zone(w - 50, h * 0.5, 100, h);
        this.physics.add.existing(this.transitionZone, true);
        this.physics.add.overlap(this.player, this.transitionZone, () => {
            this.continueGame();
        });

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

            const fuelImg = this.add.image(0, 0, 'querosene');
            fuelImg.setScale(0.5);

            const aura = this.add.image(0, 0, 'light_mask');
            aura.setScale(0.2);
            aura.setTint(0x00ffff);
            aura.setAlpha(0.3);

            const container = this.add.container(x, h * 0.7, [aura, fuelImg]);
            this.physics.add.existing(container);
            this.fuelGroup.add(container);

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

            this.tweens.add({
                targets: txt,
                y: this.player.y - 100,
                alpha: 0,
                duration: 1000,
                onComplete: () => txt.destroy()
            });
        });

    }

    spawnEnemies(w, h) {

        const minX = Math.max(100, 200);
        const maxX = Math.max(minX + 100, w - 100);
        for (let i = 0; i < 5; i++) {
            const x = minX + Math.random() * (maxX - minX);
            const type = i < 2 || Math.random() < 0.65 ? 'light' : 'shadow';
            const tex = type === 'light' ? 'enemy_light_tex' : 'enemy_shadow_tex';
            const enemy = new Enemy(this, x, h * 0.7, tex, type);
            enemy.setDepth(10);

            if (enemy.updateCollisionBox) enemy.updateCollisionBox();
            enemy.speedMultiplier = 1.12;
            enemy.chaseDistance = (enemy.chaseDistance || 600) * 1.15;
            this.enemies.add(enemy);
        }
    }

    handlePlayerDamage(enemy) {
        if (!enemy.canAttackTarget || !enemy.canAttackTarget()) {
            return;
        }

        const now = this.time.now;
        if (now - this.lastDamageTime < this.damageCooldown) {
            return;
        }

        this.lastDamageTime = now;

        if (enemy.type === 'shadow' && this.player.isLightOn) {
            return;
        }
        this.player.takeDamage(20, enemy.type);
    }

    gameOver(cause) {
        this.physics.pause();
        this.player.setTint(0x444444);
        if (cause === 'light' || cause === 'shadow') {
            this.scene.start('JumpScareScene', { type: cause });
        } else {
            this.scene.start('GameOver');
        }
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
