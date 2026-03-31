import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';

export default class Level6_Road extends Phaser.Scene {
    constructor() {
        super('Level6_Road');
        this.lastDamageTime = 0;
        this.damageCooldown = 1000; // 1 segundo entre danos
    }

    preload() {
        this.load.image('vaguetti', './assets/Vaguetti/sprite_vaguettev2_fundoremovido7.png');
        this.load.image('road', './assets/road.png');
        this.load.image('moto', './assets/moto_foda.png');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Aumentar o mundo para acomodar movimento para frente (5x o background)
        const worldWidth = w * 5;
        const worldHeight = h;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Fundo: Road repetido 5 vezes
        for (let i = 0; i < 5; i++) {
            this.add.image(i * w, 0, 'road')
                .setOrigin(0, 0)
                .setDisplaySize(w, h)
                .setDepth(-1);
        }

        // Player
        this.player = new Player(this, 150, h * 0.7);
        const vaguettiScale = Math.min(h / 600, 1) * 0.7;
        this.player.setScale(vaguettiScale);
        this.player.setDepth(10);
        this.player.light.setDepth(101);
        this.player.beam.setDepth(102);
        this.player.fuelBar.setDepth(103);

        // Câmera segue o jogador
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        // A Moto (Objetivo Final) - no final da estrada
        this.motoContainer = this.add.container(worldWidth * 0.75, h * 0.7);
        const motoImg = this.add.image(0, 0, 'moto');
        motoImg.setScale(0.8);
        this.motoContainer.add(motoImg);
        this.physics.add.existing(this.motoContainer, true);
        this.motoContainer.setDepth(15);

        // Inimigos Perseguidores
        this.enemies = this.physics.add.group({ runChildUpdate: true });
        this.enemySpawned = false;

        // Iniciar spawn de inimigos após o jogador andar um pouco
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                if (!this.enemySpawned && !this.isEnding) {
                    this.enemySpawned = true;
                    this.startEnemyWave();
                }
            }
        });

        this.physics.add.overlap(this.player, this.enemies, (p, e) => this.handlePlayerDamage(e));

        // UI
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

        // Lógica de Vitória
        this.physics.add.overlap(this.player, this.motoContainer, () => {
            this.victory();
        });
    }

    startEnemyWave() {
        // Onda 1: Inimigos vindo de trás
        this.time.addEvent({
            delay: 500,
            callback: () => {
                this.spawnEnemy('behind-top');
                this.spawnEnemy('behind-bottom');
            }
        });

        // Onda 2: Mais inimigos vindo de trás + inimigos dos lados
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                this.spawnEnemy('behind-top');
                this.spawnEnemy('behind-bottom');
                this.spawnEnemy('top');
                this.spawnEnemy('bottom');
            }
        });

        // Onda 3: Ataque intenso de várias direções
        this.time.addEvent({
            delay: 6000,
            callback: () => {
                this.spawnEnemy('top');
                this.spawnEnemy('bottom');
                this.spawnEnemy('behind-top');
                this.spawnEnemy('behind-bottom');
                this.spawnEnemy('behind-top');
            }
        });

        // Onda 4: Perseguição final
        this.time.addEvent({
            delay: 10000,
            callback: () => {
                this.spawnEnemy('top');
                this.spawnEnemy('bottom');
                this.spawnEnemy('behind-top');
            }
        });
    }

    spawnEnemy(direction) {
        if (this.isEnding || !this.enemySpawned) return;

        const w = this.scale.width;
        const h = this.scale.height;
        const type = Math.random() > 0.5 ? 'light' : 'shadow';
        const tex = type === 'light' ? 'enemy_light_tex' : 'enemy_shadow_tex';

        let spawnX, spawnY;

        switch (direction) {
            case 'behind-top':
                // De trás, na parte superior
                spawnX = this.player.x - 1000 + Math.random() * 200;
                spawnY = h * 0.3;
                break;
            case 'behind-bottom':
                // De trás, na parte inferior
                spawnX = this.player.x - 1000 + Math.random() * 200;
                spawnY = h * 0.9;
                break;
            case 'top':
                // De cima
                spawnX = this.player.x - 300 + Math.random() * 600;
                spawnY = h * 0.05;
                break;
            case 'bottom':
                // De baixo
                spawnX = this.player.x - 300 + Math.random() * 600;
                spawnY = h * 1.0;
                break;
        }

        const enemy = new Enemy(this, spawnX, spawnY, tex, type);
        enemy.setDepth(10);
        this.enemies.add(enemy);
    }

    victory() {
        if (this.isEnding) return;
        this.isEnding = true;
        
        // Fazer a câmera parar de seguir o player
        this.cameras.main.stopFollow();
        
        // Destruir inimigos restantes
        this.enemies.clear(true, true);
        
        const w = this.scale.width;
        const h = this.scale.height;
        const worldWidth = w * 5;
        
        // Animar o player e a moto saindo da tela para FRENTE (aumentando X)
        this.tweens.add({
            targets: this.player,
            x: worldWidth * 0.9,
            duration: 3000,
            ease: 'Linear'
        });
        
        this.tweens.add({
            targets: this.motoContainer,
            x: worldWidth * 0.95,
            duration: 3000,
            ease: 'Linear'
        });

        this.add.text(w * 0.5, h * 0.5, 'VOCÊ ESCAPOU!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '64px',
            color: '#00FF00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.time.delayedCall(3000, () => {
            this.scene.start('MenuScene');
        });
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
        this.player.takeDamage(25);
    }

    gameOver() {
        this.scene.start('GameOver');
    }

    update() {
        this.player.update();
    }
}
