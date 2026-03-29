import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';

export default class level6_Escape extends Phaser.Scene {
    constructor() {
        super('level6_Escape');
    }

    preload() {
        this.load.image('vaguetti', '/assets/Vaguetti.png');
        this.load.image('forest_trees', '/assets/ForestVegetation/forest_tiles_trees_with_shadows.png');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Fundo do level (dark forest)
        this.add.image(0, 0, 'bg_dark_forest').setOrigin(0, 0).setDisplaySize(w, h).setDepth(-1);

        const graphics = this.add.graphics();

        // Fundo de escuridão semi-transparente para manter imagem de fundo visível
        graphics.fillStyle(0x000000, 0.65);
        graphics.fillRect(0, 0, w, h);

        // Estrada de terra (Reta final)
        graphics.fillStyle(0x3a2a1a, 1);
        graphics.fillRect(0, h * 0.6, w, h * 0.4);

        // Árvores fantasmagóricas
        for (let i = 0; i < 10; i++) {
            const tree = this.add.sprite(Math.random() * w, h * 0.45, 'forest_trees');
            tree.setScale(0.6);
            tree.setTint(0x0a0a0a);
        }

        // A Moto (Objetivo Final)
        this.motoContainer = this.add.container(w * 0.85, h * 0.7);
        const motoG = this.add.graphics();
        this.drawMotorcycle(motoG, 0, 0);
        this.motoContainer.add(motoG);
        this.physics.add.existing(this.motoContainer, true);

        // Player
        this.player = new Player(this, 100, h * 0.7);
        const vaguettiScale = Math.min(h / 600, 1) * 0.7;
        this.player.setScale(vaguettiScale);
        this.player.setDepth(10);
        this.player.light.setDepth(101);
        this.player.beam.setDepth(102);
        this.player.fuelBar.setDepth(103);

        // Night Overlay
        this.nightOverlay = this.add.graphics();
        this.nightOverlay.fillStyle(0x000000, 1);
        this.nightOverlay.fillRect(0, 0, w, h);
        this.nightOverlay.setScrollFactor(0);
        this.nightOverlay.setDepth(100);

        // Inimigos Perseguidores
        this.enemies = this.physics.add.group({ runChildUpdate: true });
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.isEnding) return;
                const type = Math.random() > 0.5 ? 'light' : 'shadow';
                const tex = type === 'light' ? 'enemy_light_tex' : 'enemy_shadow_tex';
                const enemy = new Enemy(this, this.player.x - 500, h * 0.7, tex, type);
                enemy.setDepth(10);
                this.enemies.add(enemy);
            },
            repeat: 5
        });

        this.physics.add.overlap(this.player, this.enemies, () => this.handlePlayerDamage());

        // UI
        const titleSize = Math.max(24, w / 25);
        this.add.text(w * 0.5, h * 0.2, 'CLÍMAX: A FUGA', {
            fontFamily: 'Arial, sans-serif',
            fontSize: titleSize + 'px',
            color: '#FF0000',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(200);

        this.add.text(w * 0.5, h * 0.3, 'Alcance sua moto para escapar!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            color: '#FFFFFF'
        }).setOrigin(0.5).setDepth(200);

        // Lógica de Vitória
        this.physics.add.overlap(this.player, this.motoContainer, () => {
            this.victory();
        });
    }

    drawMotorcycle(graphics, motoX, motoY) {
        const scale = 1.2;
        // Pneu traseiro
        graphics.lineStyle(6, 0x111111, 1);
        graphics.strokeCircle(motoX - 45 * scale, motoY + 15 * scale, 18 * scale);
        // Pneu dianteiro
        graphics.strokeCircle(motoX + 45 * scale, motoY + 15 * scale, 18 * scale);

        // Chassi
        graphics.fillStyle(0x333333, 1);
        graphics.fillRect(motoX - 50 * scale, motoY - 15 * scale, 100 * scale, 25 * scale);
        
        // Tanque (Vermelho escuro)
        graphics.fillStyle(0x660000, 1);
        graphics.fillEllipse(motoX, motoY - 20 * scale, 45 * scale, 20 * scale);

        // Banco
        graphics.fillStyle(0x1a1a1a, 1);
        graphics.fillRoundedRect(motoX - 35 * scale, motoY - 32 * scale, 40 * scale, 15 * scale, 5);

        // Guidom
        graphics.lineStyle(4, 0x777777, 1);
        graphics.beginPath();
        graphics.moveTo(motoX + 35 * scale, motoY - 15 * scale);
        graphics.lineTo(motoX + 45 * scale, motoY - 45 * scale);
        graphics.strokePath();
        
        // Farol (apagado inicialmente)
        this.headlight = this.add.graphics();
        this.headlight.fillStyle(0xffff00, 0.6);
        this.headlight.fillCircle(motoX + 48 * scale, motoY - 38 * scale, 10);
        this.headlight.setVisible(false);

        // Cone de luz do farol (para a direita, pois ele foge)
        this.lightCone = this.add.graphics();
        this.lightCone.fillStyle(0xffff00, 0.2);
        this.lightCone.beginPath();
        this.lightCone.moveTo(motoX + 50 * scale, motoY - 38 * scale);
        this.lightCone.lineTo(motoX + 600, motoY - 150);
        this.lightCone.lineTo(motoX + 600, motoY + 150);
        this.lightCone.closePath();
        this.lightCone.fillPath();
        this.lightCone.setVisible(false);
    }

    victory() {
        if (this.isEnding) return;
        this.isEnding = true;
        this.player.setVisible(false);
        this.player.light.setVisible(false);
        this.player.fuelBar.setVisible(false);
        this.headlight.setVisible(true);
        this.lightCone.setVisible(true);
        
        // Destruir inimigos restantes
        this.enemies.clear(true, true);
        
        const w = this.scale.width;
        const h = this.scale.height;

        this.add.text(w * 0.5, h * 0.5, 'VOCÊ ESCAPOU!', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '64px',
            color: '#00FF00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(200);

        this.time.delayedCall(3000, () => {
            this.scene.start('MenuScene');
        });
    }

    handlePlayerDamage() {
        this.player.takeDamage(25);
    }

    gameOver() {
        this.scene.start('GameOver');
    }

    update() {
        this.player.update();
    }
}
