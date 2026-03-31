import Phaser from 'phaser';
import Player from '../entities/Player';

export default class FishingScene extends Phaser.Scene {
    constructor() {
        super('Fishing');
    }

    init() {
        console.log('FishingScene initialized');
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        console.log('FishingScene create() - screenWidth:', screenWidth, 'screenHeight:', screenHeight);

        // Background
        try {
            this.add.image(0, 0, 'fishing_scene')
                .setOrigin(0, 0)
                .setDisplaySize(screenWidth, screenHeight)
                .setDepth(-1);

            console.log('FishingScene background loaded successfully');
        } catch (error) {
            console.error('Error loading fishing_scene background:', error);

            // Fallback background
            this.add.graphics()
                .fillStyle(0x1a3a2a, 1)
                .fillRect(0, 0, screenWidth, screenHeight)
                .setDepth(-1);
        }

        // Moto (decorativa)
        try {
            const moto = this.add.image(
                screenWidth * 0.05,
                screenHeight * 0.05,
                'moto_foda'
            ).setOrigin(0, 0);

            moto.setScale(0.3).setDepth(5);
        } catch (error) {
            console.error('Error loading moto_foda:', error);
        }

        // Mundo físico limitado à tela
        this.physics.world.setBounds(0, 0, screenWidth, screenHeight);
        this.cameras.main.setBounds(0, 0, screenWidth, screenHeight);

        // Player fixo na beira do lago (posição ajustável)
        try {
            this.player = new Player(
                this,
                screenWidth * 0.5,  // Centralizado horizontalmente
                screenHeight * 0.6  // Posição mais baixa para garantir visibilidade
            );

            const scale = 0.8 * Math.min(screenWidth / 800, screenHeight / 600);

            this.player.setScale(scale);
            this.player.setDepth(10);

            // Ajuste de hitbox
            this.player.body.setSize(
                this.player.body.width * 0.6,
                this.player.body.height * 0.6
            );

            // Desativa movimento completamente
            this.player.body.setVelocity(0, 0);
            this.player.body.moves = false;

            // Elementos auxiliares do player
            if (this.player.light) {
                this.player.light.setDepth(11).setScale(scale);
            }

            if (this.player.beam) {
                this.player.beam.setDepth(12);
            }

            if (this.player.fuelBar) {
                this.player.fuelBar.setDepth(13);
            }

            console.log('Player created successfully');
        } catch (error) {
            console.error('Error creating player:', error);
        }

        // UI - título
        const titleSize = Math.max(24, this.scale.width / 25);

        this.add.text(
            screenWidth * 0.5,
            screenHeight * 0.05,
            'Pesca Noturna',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: titleSize + 'px',
                color: '#FFD700',
                fontStyle: 'bold',
                backgroundColor: '#00000088',
                padding: { x: 10, y: 5 }
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(200);

        // Texto de ação
        this.add.text(
            screenWidth * 0.5,
            screenHeight * 0.85,
            'Pescando...',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '20px',
                color: '#FFFFFF',
                backgroundColor: '#00000088',
                padding: { x: 10, y: 5 }
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(200);

        // Delay de 3 segundos e transição automática
        this.time.delayedCall(3000, () => {
            this.goToNextScene();
        });
    }

    goToNextScene() {
        this.cameras.main.fade(500, 0, 0, 0);

        this.time.delayedCall(500, () => {
            this.scene.start('Level1_Arrival');
        });
    }
}