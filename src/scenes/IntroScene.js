import Phaser from 'phaser';

export default class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;
        const centerX = w / 2;
        const centerY = h / 2;

        console.log('IntroScene create() initialized');

        this.motoSound = null;
        this.events.once('shutdown', () => {
            if (this.motoSound) {
                this.motoSound.stop();
                this.motoSound.destroy();
            }
        });

        this.safetyTimeout = this.time.delayedCall(20000, () => {
            console.warn('IntroScene safety timeout triggered - forcing transition to Level1_Arrival');
            this.forceTransitionToFishing();
        });

        this.add.graphics().fillStyle(0x000000, 1).fillRect(0, 0, w, h);

        this.premiseText = this.add.text(centerX, centerY - 100, 'Carregando arquivos de Valdelobos...', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '18px',
            color: '#FFFFFF',
            align: 'center',
            wordWrap: { width: w * 0.8 }
        }).setOrigin(0.5).setDepth(10);

        this.premiseText.setAlpha(0);

        this.fetchIntroFromN8n();
    }

    async fetchIntroFromN8n() {
        const n8nUrl = 'https://n8n.incluc0de.com.br/webhook/narrador';

        let finalIntroText = 'O motociclista Leandro Vaguetti viaja até a remota floresta de Valdelobos\npara uma pescaria, mas se vê preso em um pesadelo quando o sol se põe.\n\nImerso em uma escuridão absoluta, ele descobre que a floresta é habitada\npor criaturas mortais: algumas atraídas pela luz, outras caçadoras das sombras.\n\nArmado apenas com um lampião a querosene, Leandro precisa racionar\nseu combustível em uma fuga desesperada.\n\nPara sobreviver à noite e alcançar sua moto, ele terá que dominar o equilíbrio\nentre iluminar seu caminho e se esconder no breu.';

        try {
            const response = await fetch(n8nUrl);

            if (response.ok) {
                const data = await response.json();

                if (typeof data?.intro === 'string' && data.intro.trim().length > 0) {
                    finalIntroText = data.intro;
                }
            }
        } catch (error) {
            console.warn("n8n offline ou bloqueado na Intro. Usando texto de fallback.", error);
        }

        this.premiseText.setText(finalIntroText);

        this.tweens.add({
            targets: this.premiseText,
            alpha: 1,
            duration: 2000
        });

        this.time.delayedCall(8000, () => {
            console.log('Calling showArrivalSequence');
            try {
                this.showArrivalSequence();
            } catch (error) {
                console.error('Error in showArrivalSequence:', error);
            }
        });
    }

    forceTransitionToFishing() {
        console.log('forceTransitionToFishing called');
        this.tweens.killAll();
        this.scene.start('Level1_Arrival');
    }

    showArrivalSequence() {
        const w = this.scale.width;
        const h = this.scale.height;

        console.log('showArrivalSequence started');

        this.children.getAll().forEach(child => {
            if (child.type === 'Text') child.destroy();
        });

        try {
            const forestBg = this.add.image(0, 0, 'estrada_pixel_art');
            forestBg.setOrigin(0, 0);
            forestBg.setDisplaySize(w, h);
            forestBg.setDepth(0);
            console.log('Forest background loaded');
        } catch (error) {
            console.error('Error loading forest background:', error);

            this.add.graphics().fillStyle(0x1a3a2a, 1).fillRect(0, 0, w, h).setDepth(0);
        }

        try {
            if (!this.motoSound) {
                this.motoSound = this.sound.add('moto', {
                    loop: true,
                    volume: 0.35
                });
            }

            const moto = this.add.image(-200, h * 0.7, 'sprite_motoqueiro');
            moto.setScale(0.6);
            moto.setDepth(5);

            this.tweens.add({
                targets: moto,
                x: w * 0.3,
                duration: 3000,
                ease: 'Power2',
                onStart: () => {
                    if (this.motoSound && !this.motoSound.isPlaying) {
                        this.motoSound.play();
                    }
                },
                onComplete: () => {
                    if (this.motoSound && this.motoSound.isPlaying) {
                        this.motoSound.stop();
                    }
                    moto.setTexture('moto_foda');
                    moto.setScale(1.0);
                }
            });
        } catch (error) {
            console.error('Error with moto animation:', error);
        }

        try {
            const vaguetti = this.add.sprite(w * 0.3, h * 0.7 - 50, 'vaguetti');
            vaguetti.setScale(1.0);
            vaguetti.setDepth(6);
            vaguetti.setAlpha(0);

            this.time.delayedCall(3000, () => {
                console.log('Showing Vaguetti');
                vaguetti.setAlpha(1);

                this.tweens.add({
                    targets: vaguetti,
                    y: h * 0.75,
                    duration: 1000,
                    onComplete: () => {
                        console.log('Vaguetti landed, walking to fishing spot');
                        this.walkToFishingSpot(vaguetti);
                    }
                });
            });
        } catch (error) {
            console.error('Error with Vaguetti:', error);
        }
    }

    walkToFishingSpot(vaguetti) {
        const w = this.scale.width;
        const h = this.scale.height;

        console.log('walkToFishingSpot started');

        try {
            vaguetti.play('vaguetti_walk');
        } catch (error) {
            console.warn('Animation vaguetti_walk not found:', error);
        }

        this.tweens.add({
            targets: vaguetti,
            x: w * 0.7,
            duration: 4000,
            onComplete: () => {
                console.log('Walking animation completed');

                vaguetti.stop();
                vaguetti.setTexture('vaguetti');

                this.time.delayedCall(3000, () => {
                    console.log('Iniciando fade to black');

                    if (this.safetyTimeout) {
                        this.safetyTimeout.remove();
                    }

                    this.cameras.main.fade(1500, 0, 0, 0, false);

                    this.time.delayedCall(1600, () => {
                        console.log('Transitioning to Level1_Arrival');
                        try {

                            this.tweens.killAll();
                            this.scene.start('Level1_Arrival');
                        } catch (error) {
                            console.error('Error starting Level1_Arrival:', error);

                            this.scene.stop('IntroScene');
                            this.scene.start('Level1_Arrival');
                        }
                    });
                });
            }
        });
    }
}