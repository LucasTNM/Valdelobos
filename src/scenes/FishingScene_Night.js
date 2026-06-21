import Phaser from 'phaser';
import Player from '../entities/Player';
import { fadeAmbient, playAmbient } from '../utils/ambientAudio';
import { showDialogue } from '../utils/dialogue';

export default class FishingScene_Night extends Phaser.Scene {
    constructor() {
        super('FishingScene_Night');
    }

    preload() {
        this.load.image('pesca_night', './assets/pesca_night.png');
        this.load.image('vaguetti', './assets/Vaguetti/sprite_vaguettev2_fundoremovido7.png');
        this.load.image('sprite_pescador', './assets/Vaguetti/sprite_pescador.png');
    }

    create() {
        this.isFishing = false;

        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;

        // ===== POSIÇÃO DO PESCADOR =====
        // Coordenadas sincronizadas com FishingScene
        // Agora usa os mesmos valores fixos do FishingScene para alinhar os spots.
        this.fishingSpotConfig = {
            x: screenWidth * 0.66,
            y: screenHeight * 0.48,
            width: screenWidth * 0.1,
            height: screenHeight * 0.09,
            sitOffsetY: 0
        };

        this.fishingSpot = this.add.zone(this.fishingSpotConfig.x, this.fishingSpotConfig.y, this.fishingSpotConfig.width, this.fishingSpotConfig.height)
            .setOrigin(0.5)
            .setRectangleDropZone(this.fishingSpotConfig.width, this.fishingSpotConfig.height)
            .setVisible(false);
        this.physics.add.existing(this.fishingSpot, true);

        this.add.image(0, 0, 'pesca_night')
            .setOrigin(0, 0)
            .setDisplaySize(screenWidth, screenHeight)
            .setDepth(-1);

        playAmbient(this, 'noite', 0.08);
        this.events.once('shutdown', () => {
            if (this.sustoSound) {
                this.sustoSound.stop();
                this.sustoSound.destroy();
                this.sustoSound = null;
            }
        });

        this.physics.world.setBounds(0, 0, screenWidth, screenHeight);

        this.player = new Player(this, screenWidth * 0.75, screenHeight * 0.25);
        this.physics.add.overlap(this.player, this.fishingSpot, () => this.startFishing(), null, this);
        const vaguettiScale = Math.min(screenHeight / 600, 1) * 0.7;
        this.player.setScale(vaguettiScale);
        this.player.setDepth(10);
        this.player.light.setDepth(11).setScale(vaguettiScale);
        this.player.beam.setDepth(12);
        this.player.fuelBar.setDepth(13);

        // Manter o estado de pesca da cena anterior se ela estiver sendo iniciada em continuidade
        const previousState = this.scene.settings.data || {};
        if (previousState.wasFishing) {
            if (previousState.playerState) {
                this.player.health = previousState.playerState.health;
                this.player.fuel = previousState.playerState.fuel;
                this.player.isLightOn = previousState.playerState.isLightOn;
            }
            this.player.body.setVelocity(0, 0);
            this.player.body.enable = false;
            this.player.isFishing = true;
            this.player.setVisible(false);
            this.player.light.setVisible(false);
            this.player.beam.setVisible(false);
            this.player.setPosition(this.fishingSpotConfig.x, this.fishingSpotConfig.y + this.fishingSpotConfig.sitOffsetY);
            this.player.updateFuelBar();

            this.fishingSprite = this.add.image(this.fishingSpotConfig.x, this.fishingSpotConfig.y, 'sprite_pescador')
                .setOrigin(0.5, 0.5)
                .setDepth(15);

            if (this.player.scaleX) {
                this.fishingSprite.setScale(this.player.scaleX * 0.8);
            }

            // Aplicar o mesmo ajuste X usado na cena diurna para manter alinhamento
            if (this.fishingSprite) {
                const adjust = this.scale.width * 0.02;
                this.fishingSprite.x -= adjust;
            }
        }

        this.cameras.main.setBounds(0, 0, screenWidth, screenHeight);

        this.time.delayedCall(12000, () => {
            if (!this.sustoSound) {
                this.sustoSound = this.sound.add('susto', {
                    loop: false,
                    // Volume do susto: ajuste aqui para reduzir o nível sem perder o impacto.
                    volume: 0.27
                });
            }

            if (this.ambientSound && this.ambientSound.isPlaying) {
                fadeAmbient(this, 0.02, 800);
            }

            this.sustoSound.once('complete', () => {
                this.standUp();
                this.cameras.main.fadeOut(1500, 0, 0, 0);
                this.time.delayedCall(1500, () => {
                    this.scene.start('LoreScene', {
                        nextScene: 'Level4_Camp'
                    });
                });
            });

            showDialogue(this, 'QUE BARULHO FOI ESSE?');
            this.sustoSound.play();
        });
    }

    standUp() {
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
        this.player.updateFuelBar();
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
