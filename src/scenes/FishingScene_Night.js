import Phaser from 'phaser';
import Player from '../entities/Player';

export default class FishingScene_Night extends Phaser.Scene {
    constructor() {
        super('FishingScene_Night');
    }

    preload() {
        this.load.image('pesca_night', './assets/pesca_night.png');
        this.load.image('vaguetti', './assets/Vaguetti/sprite_vaguettev2_fundoremovido7.png');
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        this.add.image(0, 0, 'pesca_night')
            .setOrigin(0, 0)
            .setDisplaySize(screenWidth, screenHeight)
            .setDepth(-1);

        this.physics.world.setBounds(0, 0, screenWidth, screenHeight);

        this.player = new Player(this, screenWidth * 0.75, screenHeight * 0.25);
        const vaguettiScale = Math.min(screenHeight / 600, 1) * 0.7;
        this.player.setScale(vaguettiScale);
        this.player.setDepth(10);
        this.player.light.setDepth(11).setScale(vaguettiScale);
        this.player.beam.setDepth(12);
        this.player.fuelBar.setDepth(13);

        this.cameras.main.setBounds(0, 0, screenWidth, screenHeight);

        this.time.delayedCall(15000, () => {
            this.cameras.main.fadeOut(2500, 0, 0, 0);
            this.time.delayedCall(2500, () => {
                this.scene.start('Level4_Camp');
            });
        });
    }

    update() {
        this.player.update();
    }
}
