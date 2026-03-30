import Phaser from 'phaser';
import Player from '../entities/Player';

export default class FishingScene extends Phaser.Scene {
    constructor() {
        super('Fishing');
    }

    preload() {
        this.load.image('vaguetti', './assets/vaguettepng/default.png');
        this.load.image('fishing_scene', './assets/fishing-scene.png');
    }

    create() {
        // Dimensões da tela (viewport)
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
        
        // Dimensões da imagem de fundo (First-scene.png é 1536x960)
        const mapWidth = 1536;
        const mapHeight = 960;

        // Adicionar a imagem como fundo preenchendo toda a tela
        this.add.image(0, 0, 'fishing_scene').setOrigin(0, 0).setDisplaySize(screenWidth, screenHeight).setDepth(-1);

        // Configurar limites do mundo para permitir movimento livre
        this.physics.world.setBounds(0, 0, screenWidth, screenHeight);

        // Criar o Player
        this.player = new Player(this, screenWidth * 0.75, screenHeight * 0.25);
        const vaguettiScale = 0.35; // Escala bem reduzida
        this.player.setScale(vaguettiScale);
        this.player.body.setSize(this.player.body.width * 0.6, this.player.body.height * 0.6); // Hitbox reduzida
        this.player.setDepth(10);
        this.player.light.setDepth(11).setScale(vaguettiScale);
        this.player.beam.setDepth(12);
        this.player.fuelBar.setDepth(13);

        // Câmera não segue neste caso, pois a imagem já preenche a tela
        this.cameras.main.setBounds(0, 0, screenWidth, screenHeight);

        // UI - Instruções
        const titleSize = Math.max(24, this.scale.width / 25);
        this.add.text(this.scale.width * 0.5, this.scale.height * 0.05, 'Pesca Noturna', {
            fontFamily: 'Arial, sans-serif',
            fontSize: titleSize + 'px',
            color: '#FFD700',
            fontStyle: 'bold',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.add.text(this.scale.width * 0.5, this.scale.height * 0.12, 'Explore o mapa livremente | ENTER para continuar', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            color: '#CCCCCC',
            backgroundColor: '#00000088',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        // Controles para avançar
        this.input.keyboard.on('keydown-ENTER', () => this.goToNextScene());
    }

    goToNextScene() {
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('Level1_Arrival');
        });
    }

    update() {
        this.player.update();
    }
}
