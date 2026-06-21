import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import { playAmbient } from '../utils/ambientAudio';

export default class Level6_Escape extends Phaser.Scene {
    constructor() {
        super('Level6_Escape');
        this.lastDamageTime = 0;
        this.damageCooldown = 1000; // 1 segundo entre danos
    }

    preload() {
        this.load.image('vaguetti', './assets/Vaguetti/sprite_vaguettev2_fundoremovido7.png');
        this.load.image('dark_forest', './assets/dark_forest.png');
        this.load.image('querosene', './assets/querosene.png');
    }

    create() {
        this.isTransitioning = false;
        this.lastDamageTime = 0;

        const screenWidth = this.scale.width;
        const h = this.scale.height;
        const w = screenWidth * 2;
        this.physics.world.setBounds(0, 0, w, h);

        // Fundo: Dark Forest
        this.add.image(0, 0, 'dark_forest').setOrigin(0, 0).setDisplaySize(w, h).setDepth(-1);

        // Player
        this.player = new Player(this, 100, h * 0.7);
        const vaguettiScale = Math.min(h / 600, 1) * 1.0;
        this.player.setScale(vaguettiScale);

        // Áudio ambiente noturno
        playAmbient(this, 'noite', 0.08);
        this.player.setDepth(10);
        this.player.light.setDepth(101);
        this.player.beam.setDepth(102);
        this.player.fuelBar.setDepth(103);

        this.cameras.main.setBounds(0, 0, w, h);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // Grupo de Inimigos
        this.enemies = this.physics.add.group({ runChildUpdate: true });
        this.spawnEnemies(w, h);

        // Manter spawn ativo durante toda a fase final
        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => {
                if (!this.isTransitioning) {
                    const x = w * 0.2 + Math.random() * (w * 0.55);
                    const type = Math.random() < 0.55 ? 'light' : 'shadow';
                    const tex = type === 'light' ? 'enemy_light_tex' : 'enemy_shadow_tex';
                    const enemy = new Enemy(this, x, h * 0.7, tex, type);
                    enemy.setDepth(10);
                    this.enemies.add(enemy);
                }
            }
        });

        // Itens: Frascos de Querosene (reutiliza lógica do Level4_Camp)
        this.createFuelItems && this.createFuelItems(w, h);

        // UI
        const titleSize = Math.max(24, screenWidth / 25);
        this.add.text(screenWidth * 0.5, h * 0.1, 'A FLORESTA ESCURA', {
            fontFamily: 'Arial, sans-serif',
            fontSize: titleSize + 'px',
            color: '#FF6B00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.add.text(screenWidth * 0.5, h * 0.18, 'Siga para a direita em busca de uma saída.', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            color: '#CCCCCC'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        // Transição para o próximo nível
        this.transitionZone = this.add.zone(w - 50, h * 0.5, 100, h);
        this.physics.add.existing(this.transitionZone, true);
        this.physics.add.overlap(this.player, this.transitionZone, () => {
            this.continueGame();
        });
    }
    continueGame() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            // Após a fuga, ir para LoreScene antes de seguir para a estrada
            this.scene.start('Level6_Road');
        });
    }

    spawnEnemies(w, h) {
        for (let i = 0; i < 7; i++) {
            const x = w * 0.2 + Math.random() * (w * 0.55);
            const type = i === 0 || Math.random() < 0.55 ? 'light' : 'shadow';
            const tex = type === 'light' ? 'enemy_light_tex' : 'enemy_shadow_tex';
            const enemy = new Enemy(this, x, h * 0.7, tex, type);
            enemy.setDepth(10);
            this.enemies.add(enemy);
        }
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

    handlePlayerDamage(enemy) {
        if (!enemy.canAttackTarget || !enemy.canAttackTarget()) {
            return;
        }

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
