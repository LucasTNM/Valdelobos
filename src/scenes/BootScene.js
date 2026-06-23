import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {

        this.load.image('tela_inicial', './assets/tela_inicial.png');

        this.load.image('vaguetti_frame_0', './assets/Vaguetti/sprite_vaguettev2_fundoremovido1.png');
        this.load.image('vaguetti_frame_1', './assets/Vaguetti/sprite_vaguettev2_fundoremovido2.png');
        this.load.image('vaguetti_frame_2', './assets/Vaguetti/sprite_vaguettev2_fundoremovido3.png');
        this.load.image('vaguetti_frame_3', './assets/Vaguetti/sprite_vaguettev2_fundoremovido4.png');
        this.load.image('vaguetti_frame_4', './assets/Vaguetti/sprite_vaguettev2_fundoremovido5.png');
        this.load.image('vaguetti_frame_5', './assets/Vaguetti/sprite_vaguettev2_fundoremovido6.png');

        this.load.image('vaguetti', './assets/Vaguetti/sprite_vaguettev2_fundoremovido7.png');

        this.load.spritesheet('enemy_light_tex', './assets/skeleton-walk.png', {
            frameWidth: 48,
            frameHeight: 48
        });

        this.load.image('enemy_shadow_tex', './assets/sprite_transparente.gif');

        this.load.image('estrada_pixel_art', './assets/estrada_pixel_art.png');
        this.load.image('bg_dark_forest', './assets/forest/vegetation/dark%20forest.png');
        this.load.image('moto_foda', './assets/moto_foda.png');
        this.load.image('sprite_motoqueiro', './assets/Vaguetti/sprite_motoqueiro.png');
        this.load.image('sprite_pescador', './assets/Vaguetti/sprite_pescador.png');

        this.load.audio('passo', './assets/audio/sfx/passo.mp3');
        this.load.audio('moto', './assets/audio/sfx/moto.mp3');
        this.load.audio('floresta', './assets/audio/sfx/floresta.mp3');
        this.load.audio('noite', './assets/audio/sfx/noite.mp3');
        this.load.audio('monstro', './assets/audio/sfx/monstro.mp3');
        this.load.audio('susto', './assets/audio/sfx/susto.mp3');
        this.load.audio('lamp', './assets/audio/sfx/lamp.mp3');

        this.load.video('jumpscare_white', './assets/videos/jumpscare_white_mp4.mp4', 'loadeddata', false, true);
        this.load.audio('jumpscare_white', './assets/audio/music/jumpscare_white_mp3.mp3');
        this.load.video('jumpscare_black', './assets/videos/jumpscare_black_mp4.mp4', 'loadeddata', false, true);
        this.load.audio('jumpscare_black', './assets/audio/music/jumpscare_black_mp3.mp3');

        this.load.image('fishing_scene', './assets/fishing-scene.png');
        this.load.image('pesca_night', './assets/pesca_night.png');

        this.load.image('tree_1_1', './assets/Lost Pixel Art - Forest/Trees/Tree_1 - 1.png');
        this.load.image('tree_1_2', './assets/Lost Pixel Art - Forest/Trees/Tree_1 - 2.png');
        this.load.image('tree_1_3', './assets/Lost Pixel Art - Forest/Trees/Tree_1 - 3.png');
        this.load.image('tree_1_4', './assets/Lost Pixel Art - Forest/Trees/Tree_1 - 4.png');

        this.load.image('tree_2_1', './assets/Lost Pixel Art - Forest/Trees/Tree_2 - 1.png');
        this.load.image('tree_2_2', './assets/Lost Pixel Art - Forest/Trees/Tree_2 - 2.png');
        this.load.image('tree_2_3', './assets/Lost Pixel Art - Forest/Trees/Tree_2 - 3.png');
        this.load.image('tree_2_4', './assets/Lost Pixel Art - Forest/Trees/Tree_2 - 4.png');

        this.load.image('flower_1_1', './assets/Flowers/Flower_1 - 1.png');
        this.load.image('flower_1_2', './assets/Flowers/Flower_1 - 2.png');
        this.load.image('flower_1_3', './assets/Flowers/Flower_1 - 3.png');
        this.load.image('flower_1_4', './assets/Flowers/Flower_1 - 4.png');

        this.load.image('flower_2_1', './assets/Flowers/Flower_2 - 1.png');
        this.load.image('flower_2_2', './assets/Flowers/Flower_2 - 2.png');
        this.load.image('flower_2_3', './assets/Flowers/Flower_2 - 3.png');
        this.load.image('flower_2_4', './assets/Flowers/Flower_2 - 4.png');

        this.load.image('flower_3_1', './assets/Flowers/Flower_3 - 1.png');
        this.load.image('flower_3_2', './assets/Flowers/Flower_3 - 2.png');
        this.load.image('flower_3_3', './assets/Flowers/Flower_3 - 3.png');
        this.load.image('flower_3_4', './assets/Flowers/Flower_3 - 4.png');

        this.load.image('flower_4_1', './assets/Flowers/Flower_4 - 1.png');
        this.load.image('flower_4_2', './assets/Flowers/Flower_4 - 2.png');
        this.load.image('flower_4_3', './assets/Flowers/Flower_4 - 3.png');
        this.load.image('flower_4_4', './assets/Flowers/Flower_4 - 4.png');

        this.load.image('bush_1', './assets/Bushes/Bush - 1.png');
        this.load.image('bush_2', './assets/Bushes/Bush - 2.png');

        this.load.image('grass_1', './assets/Grass/Grass - 1.png');
        this.load.image('grass_2', './assets/Grass/Grass - 2.png');
        this.load.image('grass_3', './assets/Grass/Grass - 3.png');
        this.load.image('grass_4', './assets/Grass/Grass - 4.png');

        this.load.on('loaderror', (file) => {
            if (file.key === 'enemy_light_tex' || file.key === 'enemy_shadow_tex') {
                console.warn('Falha no carregamento de', file.key, '-> fallback placeholder será usado.');
            }
        });
    }

    create() {
        this.createGameTextures();

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const telaInicial = this.add.image(0, 0, 'tela_inicial');
        telaInicial.setOrigin(0, 0);
        telaInicial.setDisplaySize(this.scale.width, this.scale.height);
        telaInicial.setDepth(0);

        const titleSize = Math.max(32, this.scale.width / 20);
        this.add.text(centerX, centerY + 150, 'SOBREVIVÊNCIA', {
            fontFamily: 'Arial, sans-serif',
            fontSize: titleSize + 'px',
            fontStyle: 'bold',
            color: '#FF6B00',
            align: 'center',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5).setDepth(1);

        this.add.text(centerX, centerY + 200, 'EM VALDELOBOS', {
            fontFamily: 'Arial, sans-serif',
            fontSize: (titleSize * 0.6) + 'px',
            color: '#FFD700',
            align: 'center',
            fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(1);

        const clickText = this.add.text(centerX, centerY + 280, 'Pressione ENTER ou CLIQUE para continuar', {
            fontFamily: 'Arial, sans-serif',
            fontSize: (titleSize * 0.35) + 'px',
            color: '#CCCCCC',
            align: 'center'
        }).setOrigin(0.5).setDepth(1);

        this.tweens.add({
            targets: clickText,
            alpha: { from: 0.3, to: 1 },
            duration: 1000,
            repeat: -1,
            yoyo: true
        });

        this.input.keyboard.once('keydown-ENTER', () => {
            this.startIntro();
        });

        this.input.once('pointerdown', () => {
            this.startIntro();
        });
    }

    startIntro() {

        if (!this.scale.isFullscreen) {
            this.scale.startFullscreen();
        }

        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('MenuScene');
        });
    }

    createGameTextures() {

        const size = 256;
        const canvas = this.textures.createCanvas('light_mask', size, size);
        const ctx = canvas.getContext();

        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        canvas.refresh();

        if (!this.anims.exists('vaguetti_walk')) {
            this.anims.create({
                key: 'vaguetti_walk',
                frames: [
                    { key: 'vaguetti_frame_0', frame: 0 },
                    { key: 'vaguetti_frame_1', frame: 0 },
                    { key: 'vaguetti_frame_2', frame: 0 },
                    { key: 'vaguetti_frame_3', frame: 0 },
                    { key: 'vaguetti_frame_4', frame: 0 },
                    { key: 'vaguetti_frame_5', frame: 0 }
                ],
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists('enemy_light_walk')) {
            this.anims.create({
                key: 'enemy_light_walk',
                frames: this.anims.generateFrameNumbers('enemy_light_tex', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }

        if (!this.anims.exists('enemy_shadow_idle')) {

            this.anims.create({
                key: 'enemy_shadow_idle',
                frames: [{ key: 'enemy_shadow_tex', frame: null }],
                frameRate: 1,
                repeat: -1
            });
        }

        if (!this.anims.exists('tree_1_sway')) {
            this.anims.create({
                key: 'tree_1_sway',
                frames: [
                    { key: 'tree_1_1', frame: 0 },
                    { key: 'tree_1_2', frame: 0 },
                    { key: 'tree_1_3', frame: 0 },
                    { key: 'tree_1_4', frame: 0 }
                ],
                frameRate: 3,
                repeat: -1
            });
        }

        if (!this.anims.exists('tree_2_sway')) {
            this.anims.create({
                key: 'tree_2_sway',
                frames: [
                    { key: 'tree_2_1', frame: 0 },
                    { key: 'tree_2_2', frame: 0 },
                    { key: 'tree_2_3', frame: 0 },
                    { key: 'tree_2_4', frame: 0 }
                ],
                frameRate: 3,
                repeat: -1
            });
        }

        if (!this.anims.exists('flower_1_bloom')) {
            this.anims.create({
                key: 'flower_1_bloom',
                frames: [
                    { key: 'flower_1_1', frame: 0 },
                    { key: 'flower_1_2', frame: 0 },
                    { key: 'flower_1_3', frame: 0 },
                    { key: 'flower_1_4', frame: 0 }
                ],
                frameRate: 4,
                repeat: -1
            });
        }

        if (!this.anims.exists('flower_2_bloom')) {
            this.anims.create({
                key: 'flower_2_bloom',
                frames: [
                    { key: 'flower_2_1', frame: 0 },
                    { key: 'flower_2_2', frame: 0 },
                    { key: 'flower_2_3', frame: 0 },
                    { key: 'flower_2_4', frame: 0 }
                ],
                frameRate: 4,
                repeat: -1
            });
        }

        if (!this.anims.exists('flower_3_bloom')) {
            this.anims.create({
                key: 'flower_3_bloom',
                frames: [
                    { key: 'flower_3_1', frame: 0 },
                    { key: 'flower_3_2', frame: 0 },
                    { key: 'flower_3_3', frame: 0 },
                    { key: 'flower_3_4', frame: 0 }
                ],
                frameRate: 4,
                repeat: -1
            });
        }

        if (!this.anims.exists('flower_4_bloom')) {
            this.anims.create({
                key: 'flower_4_bloom',
                frames: [
                    { key: 'flower_4_1', frame: 0 },
                    { key: 'flower_4_2', frame: 0 },
                    { key: 'flower_4_3', frame: 0 },
                    { key: 'flower_4_4', frame: 0 }
                ],
                frameRate: 4,
                repeat: -1
            });
        }

        if (!this.anims.exists('grass_sway')) {
            this.anims.create({
                key: 'grass_sway',
                frames: [
                    { key: 'grass_1', frame: 0 },
                    { key: 'grass_2', frame: 0 },
                    { key: 'grass_3', frame: 0 },
                    { key: 'grass_4', frame: 0 }
                ],
                frameRate: 5,
                repeat: -1
            });
        }

        const beamW = 400;
        const beamH = 100;
        const beamCanvas = this.textures.createCanvas('light_beam', beamW, beamH);
        const beamCtx = beamCanvas.getContext();

        const beamGrad = beamCtx.createRadialGradient(0, beamH/2, 0, 0, beamH/2, beamW);
        beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        beamCtx.fillStyle = beamGrad;
        beamCtx.beginPath();
        beamCtx.moveTo(0, beamH * 0.4);
        beamCtx.lineTo(beamW, 0);
        beamCtx.lineTo(beamW, beamH);
        beamCtx.lineTo(0, beamH * 0.6);
        beamCtx.closePath();
        beamCtx.fill();
        beamCanvas.refresh();

        const particleSize = 32;
        const pCanvas = this.textures.createCanvas('smoke', particleSize, particleSize);
        const pCtx = pCanvas.getContext();
        const pGrad = pCtx.createRadialGradient(particleSize/2, particleSize/2, 0, particleSize/2, particleSize/2, particleSize/2);
        pGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        pCtx.fillStyle = pGrad;
        pCtx.fillRect(0, 0, particleSize, particleSize);
        pCanvas.refresh();
    }
}
