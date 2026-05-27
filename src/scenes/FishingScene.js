import Phaser from 'phaser';
import Player from '../entities/Player';
import { playAmbient } from '../utils/ambientAudio';
import { showDialogue } from '../utils/dialogue';

export default class FishingScene extends Phaser.Scene {
    constructor() {
        super('FishingScene');
    }

    preload() {
        this.load.image('vaguetti', './assets/Vaguetti/sprite_vaguettev2_fundoremovido7.png');
        this.load.image('sprite_pescador', './assets/Vaguetti/sprite_pescador.png');
        this.load.image('fishing_scene', './assets/fishing-scene.png');
    }

    create() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        // Coordenadas e tamanho da área de pesca.
        // Ajuste x, y, width, height e sitOffsetY aqui para reposicionar o spot.
        this.fishingSpotConfig = {
            x: 1200,
            y: 540,
            width: 160,
            height: 100,
            sitOffsetY: -10
        };


        this.fishingSpot = this.add.zone(this.fishingSpotConfig.x, this.fishingSpotConfig.y, this.fishingSpotConfig.width, this.fishingSpotConfig.height)
            .setOrigin(0.5)
            .setRectangleDropZone(this.fishingSpotConfig.width, this.fishingSpotConfig.height)
            .setVisible(false);
        this.physics.add.existing(this.fishingSpot, true);

        this.add.image(0, 0, 'fishing_scene')
            .setOrigin(0, 0)
            .setDisplaySize(screenWidth, screenHeight)
            .setDepth(-1);

        this.physics.world.setBounds(0, 0, screenWidth, screenHeight);

        // Áudio ambiente da floresta
        playAmbient(this, 'floresta', 0.08);

        this.player = new Player(this, screenWidth * 0.75, screenHeight * 0.25);
        this.physics.add.overlap(this.player, this.fishingSpot, () => this.startFishing(), null, this);
        const vaguettiScale = Math.min(screenHeight / 600, 1) * 0.7;
        this.player.setScale(vaguettiScale);
        this.player.setDepth(10);
        this.player.light.setDepth(11).setScale(vaguettiScale);
        this.player.beam.setDepth(12);
        this.player.fuelBar.setDepth(13);

        this.cameras.main.setBounds(0, 0, screenWidth, screenHeight);

        showDialogue(this, 'DEVO ME SENTAR NO PIER PARA PESCAR.');

        this.time.delayedCall(20000, () => {
            this.cameras.main.fadeOut(2500, 0, 0, 0);
            this.time.delayedCall(2500, () => {
                this.scene.start('FishingScene_Night', {
                    wasFishing: true,
                    playerState: {
                        health: this.player.health,
                        fuel: this.player.fuel,
                        isLightOn: this.player.isLightOn
                    }
                });
            });
        });
    }

    update() {
        this.player.update();
    }

    startFishing() {
        if (this.isFishing) return;
        this.isFishing = true;

        const spot = this.fishingSpotConfig;
        this.player.setVelocity(0, 0);
        this.player.body.setVelocity(0, 0);
        this.player.body.enable = false;
        this.player.isFishing = true;
        this.player.setVisible(false);
        this.player.light.setVisible(false);
        this.player.beam.setVisible(false);
        this.player.setPosition(spot.x, spot.y + spot.sitOffsetY);

        this.fishingSprite = this.add.image(spot.x, spot.y, 'sprite_pescador')
            .setOrigin(0.5, 0.5)
            .setDepth(15);

        if (this.player.scaleX) {
            // Ajuste a escala do sprite de pesca aqui com setScale().
            // Aumente ou diminua o multiplicador para combinar com o tamanho do player.
            this.fishingSprite.setScale(this.player.scaleX * 0.8);
        }
    }

    stopFishing() {
        if (!this.isFishing) return;
        this.isFishing = false;

        if (this.fishingSprite) {
            this.fishingSprite.destroy();
            this.fishingSprite = null;
        }

        this.player.isFishing = false;
        this.player.body.enable = true;
        this.player.setVisible(true);
        this.player.light.setVisible(this.player.isLightOn);
        this.player.beam.setVisible(false);
    }
}
