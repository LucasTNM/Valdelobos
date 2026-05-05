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

        // Timeout de segurança para evitar ficar preso na intro (20 segundos)
        this.safetyTimeout = this.time.delayedCall(20000, () => {
            console.warn('IntroScene safety timeout triggered - forcing transition to FishingScene');
            this.forceTransitionToFishing();
        });

        // Fundo escuro para a introdução
        this.add.graphics().fillStyle(0x000000, 1).fillRect(0, 0, w, h);

        // Texto da premissa
        const premiseText = this.add.text(centerX, centerY - 100, 
            'O motociclista Leandro Vaguetti viaja até a remota floresta de Valdelobos\npara uma pescaria, mas se vê preso em um pesadelo quando o sol se põe.\n\nImerso em uma escuridão absoluta, ele descobre que a floresta é habitada\npor criaturas mortais: algumas atraídas pela luz, outras caçadoras das sombras.\n\nArmado apenas com um lampião a querosene, Leandro precisa racionar\nseu combustível em uma fuga desesperada.\n\nPara sobreviver à noite e alcançar sua moto, ele terá que dominar o equilíbrio\nentre iluminar seu caminho e se esconder no breu.',
            {
                fontFamily: 'Arial, sans-serif',
                fontSize: '18px',
                color: '#FFFFFF',
                align: 'center',
                wordWrap: { width: w * 0.8 }
            }
        ).setOrigin(0.5).setDepth(10);

        // Animação de fade in do texto
        premiseText.setAlpha(0);
        this.tweens.add({
            targets: premiseText,
            alpha: 1,
            duration: 2000
        });

        // Após 8 segundos, iniciar a sequência visual
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
        this.scene.start('Fishing');
    }

    showArrivalSequence() {
        const w = this.scale.width;
        const h = this.scale.height;

        console.log('showArrivalSequence started');

        // Limpar texto anterior
        this.children.getAll().forEach(child => {
            if (child.type === 'Text') child.destroy();
        });

        // Fundo da floresta (usando uma imagem existente ou placeholder)
        try {
            const forestBg = this.add.image(0, 0, 'estrada_pixel_art');
            forestBg.setOrigin(0, 0);
            forestBg.setDisplaySize(w, h);
            forestBg.setDepth(0);
            console.log('Forest background loaded');
        } catch (error) {
            console.error('Error loading forest background:', error);
            // Fallback: fundo de cor
            this.add.graphics().fillStyle(0x1a3a2a, 1).fillRect(0, 0, w, h).setDepth(0);
        }

        // Moto chegando da esquerda
        try {
            const moto = this.add.image(-200, h * 0.7, 'moto_foda');
            moto.setScale(1.0);
            moto.setDepth(5);

            // Animação da moto entrando
            this.tweens.add({
                targets: moto,
                x: w * 0.3,
                duration: 3000,
                ease: 'Power2'
            });
        } catch (error) {
            console.error('Error with moto animation:', error);
        }

        // Vaguetti na moto (inicialmente invisível)
        try {
            const vaguetti = this.add.sprite(w * 0.3, h * 0.7 - 50, 'vaguetti');
            vaguetti.setScale(1.0);
            vaguetti.setDepth(6);
            vaguetti.setAlpha(0);

            // Após a moto parar, mostrar Vaguetti
            this.time.delayedCall(3000, () => {
                console.log('Showing Vaguetti');
                vaguetti.setAlpha(1);
                // Vaguetti desce da moto
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

        // Iniciar animação de caminhada
        try {
            vaguetti.play('vaguetti_walk');
        } catch (error) {
            console.warn('Animation vaguetti_walk not found:', error);
        }

        // Caminhar para a direita até o local de pesca
        this.tweens.add({
            targets: vaguetti,
            x: w * 0.7,
            duration: 4000,
            onComplete: () => {
                console.log('Walking animation completed');
                
                // Parar de andar
                vaguetti.stop();
                vaguetti.setTexture('vaguetti'); // Voltar à imagem estática

                // Após alguns segundos, transição para o jogo
                this.time.delayedCall(3000, () => {
                    console.log('Iniciando fade to black');
                    
                    // Cancelar timeout de segurança
                    if (this.safetyTimeout) {
                        this.safetyTimeout.remove();
                    }
                    
                    // Usar câmera fade integrada do Phaser
                    this.cameras.main.fade(1500, 0, 0, 0, false);
                    
                    this.time.delayedCall(1600, () => {
                        console.log('Transitioning to Fishing scene');
                        try {
                            // Stop any active animations to prevent conflicts
                            this.tweens.killAll();
                            this.scene.start('Fishing');
                        } catch (error) {
                            console.error('Error starting Fishing scene:', error);
                            // Fallback: try starting by scene key
                            this.scene.stop('IntroScene');
                            this.scene.start('Fishing');
                        }
                    });
                });
            }
        });
    }
}
