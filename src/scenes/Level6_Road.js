import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import { playAmbient } from '../utils/ambientAudio';

export default class Level6_Road extends Phaser.Scene {
    constructor() {
        super('Level6_Road');
        this.lastDamageTime = 0;
        this.damageCooldown = 1000;
    }

    preload() {
        this.load.image('vaguetti', './assets/Vaguetti/sprite_vaguettev2_fundoremovido7.png');
        this.load.image('road', './assets/road.png');
        this.load.image('moto', './assets/moto_foda.png');
        this.load.image('querosene', './assets/querosene.png');
    }

    create() {
        this.isEnding = false;
        this.enemySpawned = false;
        this.lastDamageTime = 0;

        const w = this.scale.width;
        const h = this.scale.height;

        const worldWidth = w * 5;
        const worldHeight = h;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        for (let i = 0; i < 5; i++) {
            this.add.image(i * w, 0, 'road')
                .setOrigin(0, 0)
                .setDisplaySize(w, h)
                .setDepth(-1);
        }

        this.player = new Player(this, 150, h * 0.7);
        const vaguettiScale = Math.min(h / 600, 1) * 0.7;
        this.player.setScale(vaguettiScale);

        playAmbient(this, 'noite', 0.08);
        this.player.setDepth(10);
        this.player.light.setDepth(101);
        this.player.beam.setDepth(102);
        this.player.fuelBar.setDepth(103);

        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        this.motoContainer = this.add.container(worldWidth * 0.75, h * 0.7);
        this.motoImg = this.add.image(0, 0, 'moto');
        this.motoImg.setScale(0.6);
        this.motoContainer.add(this.motoImg);
        this.physics.add.existing(this.motoContainer, true);
        this.motoContainer.setDepth(15);

        this.motoSound = this.sound.add('moto', {
            loop: true,
            volume: 0.35
        });
        this.events.once('shutdown', () => {
            if (this.motoSound) {
                this.motoSound.stop();
                this.motoSound.destroy();
            }
        });

        this.enemies = this.physics.add.group({ runChildUpdate: true });

        this.createFuelItems && this.createFuelItems(w, h);

        this.time.addEvent({
            delay: 0,
            callback: () => {
                if (!this.enemySpawned && !this.isEnding) {
                    this.enemySpawned = true;
                    this.startEnemyWave();
                }
            }
        });

        this.time.addEvent({
            delay: 4500,
            loop: true,
            callback: () => {
                if (!this.isEnding) {
                    const directions = ['behind-top', 'behind-bottom', 'top', 'bottom'];
                    const direction = Phaser.Math.RND.pick(directions);
                    this.spawnEnemy(direction);
                }
            }
        });

        const titleSize = Math.max(24, w / 25);
        this.add.text(w * 0.5, h * 0.1, 'A ESTRADA DE FUGA', {
            fontFamily: 'Arial, sans-serif',
            fontSize: titleSize + 'px',
            color: '#FF6B00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.add.text(w * 0.5, h * 0.18, 'Corra para a moto! Inimigos se aproximam!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            color: '#FF4444'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.physics.add.overlap(this.player, this.motoContainer, () => {
            this.victory();
        });
    }

    startEnemyWave() {

        this.time.addEvent({
            delay: 0,
            callback: () => {
                this.spawnEnemy('behind-top');
                this.spawnEnemy('behind-bottom');
                this.spawnEnemy('behind-top');
            }
        });

        this.time.addEvent({
            delay: 3000,
            callback: () => {
                this.spawnEnemy('behind-top');
                this.spawnEnemy('behind-bottom');
                this.spawnEnemy('top');
                this.spawnEnemy('bottom');
                this.spawnEnemy('behind-top');
            }
        });

        this.time.addEvent({
            delay: 6000,
            callback: () => {
                this.spawnEnemy('top');
                this.spawnEnemy('bottom');
                this.spawnEnemy('behind-top');
                this.spawnEnemy('behind-bottom');
                this.spawnEnemy('behind-top');
                this.spawnEnemy('top');
            }
        });

        this.time.addEvent({
            delay: 10000,
            callback: () => {
                this.spawnEnemy('top');
                this.spawnEnemy('bottom');
                this.spawnEnemy('behind-top');
                this.spawnEnemy('behind-bottom');
            }
        });
    }

    spawnEnemy(direction) {
        if (this.isEnding || !this.enemySpawned) return;

        const w = this.scale.width;
        const h = this.scale.height;
        const type = Math.random() < 0.7 ? 'light' : 'shadow';
        const tex = type === 'light' ? 'enemy_light_tex' : 'enemy_shadow_tex';

        let spawnX, spawnY;

        switch (direction) {
            case 'behind-top':

                spawnX = this.player.x - 600 + Math.random() * 400;
                spawnY = h * 0.4;
                break;
            case 'behind-bottom':

                spawnX = this.player.x - 600 + Math.random() * 400;
                spawnY = h * 0.6;
                break;
            case 'top':

                spawnX = this.player.x - 200 + Math.random() * 400;
                spawnY = h * 0.2;
                break;
            case 'bottom':

                spawnX = this.player.x - 200 + Math.random() * 400;
                spawnY = h * 0.8;
                break;
        }

        const enemy = new Enemy(this, spawnX, spawnY, tex, type);
        enemy.setDepth(10);
        this.enemies.add(enemy);
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

    victory() {
        if (this.isEnding) return;
        this.isEnding = true;

        this.cameras.main.stopFollow();

        this.enemies.clear(true, true);

        const w = this.scale.width;
        const h = this.scale.height;
        const worldWidth = w * 5;

        this.tweens.add({
            targets: this.player,
            x: worldWidth * 0.9,
            duration: 3000,
            ease: 'Linear',
            onStart: () => {
                this.player.setVisible(false);
            },
            onComplete: () => {
                this.player.setVisible(true);
            }
        });

        this.tweens.add({
            targets: this.motoContainer,
            x: worldWidth * 0.95,
            duration: 3000,
            ease: 'Linear',
            onStart: () => {
                this.motoImg.setTexture('sprite_motoqueiro');
                this.motoImg.setScale(0.6);
                if (this.motoSound && !this.motoSound.isPlaying) {
                    this.motoSound.play();
                }
            },
            onComplete: () => {
                if (this.motoSound && this.motoSound.isPlaying) {
                    this.motoSound.stop();
                }
                this.motoImg.setTexture('moto_foda');
                this.motoImg.setScale(0.6);
            }
        });

        this.add.text(w * 0.5, h * 0.5, 'VOCÊ ESCAPOU!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '64px',
            color: '#00FF00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.time.delayedCall(3000, () => {
            this.scene.start('FinalScene');
        });
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
        this.player.takeDamage(25, enemy.type);
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

    update() {
        this.player.update();
    }
}
