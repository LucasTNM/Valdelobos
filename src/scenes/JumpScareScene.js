import Phaser from 'phaser';

const JUMPSCARE_CONFIG = {
    light: {
        videoKey: 'jumpscare_white',
        audioKey: 'jumpscare_white'
    },
    shadow: {
        videoKey: 'jumpscare_black',
        audioKey: 'jumpscare_black'
    }
};

export default class JumpScareScene extends Phaser.Scene {
    constructor() {
        super('JumpScareScene');
    }

    create() {
        const type = this.scene.settings.data?.type || 'light';
        const config = JUMPSCARE_CONFIG[type] || JUMPSCARE_CONFIG.light;
        const { width, height } = this.scale;

        // Garantir que não exista áudio residual de outras cenas.
        this.sound.stopAll();

        this.jumpscareSound = this.sound.add(config.audioKey, { loop: false, volume: 1 });
        this.jumpscareVideo = this.add.video(width / 2, height / 2, config.videoKey)
            .setOrigin(0.5)
            .setDepth(1);

        const updateVideoSize = () => {
            const videoWidth = typeof this.jumpscareVideo.getVideoWidth === 'function'
                ? this.jumpscareVideo.getVideoWidth()
                : (this.jumpscareVideo.video?.videoWidth || this.jumpscareVideo.width);
            const videoHeight = typeof this.jumpscareVideo.getVideoHeight === 'function'
                ? this.jumpscareVideo.getVideoHeight()
                : (this.jumpscareVideo.video?.videoHeight || this.jumpscareVideo.height);

            if (!videoWidth || !videoHeight) {
                return;
            }

            const screenRatio = width / height;
            const videoRatio = videoWidth / videoHeight;
            let displayWidth = width;
            let displayHeight = height;

            if (videoRatio > screenRatio) {
                displayHeight = width / videoRatio;
            } else {
                displayWidth = height * videoRatio;
            }

            this.jumpscareVideo.setDisplaySize(displayWidth, displayHeight);
            this.jumpscareVideo.setPosition(width / 2, height / 2);
        };

        this.jumpscareVideo.once('play', updateVideoSize);
        this.jumpscareVideo.once('complete', () => {
            if (this.jumpscareSound && this.jumpscareSound.isPlaying) {
                this.jumpscareSound.stop();
            }
            if (this.jumpscareVideo) {
                this.jumpscareVideo.destroy();
            }
            this.scene.start('MenuScene');
        });

        if (this.jumpscareSound) {
            this.jumpscareSound.play();
        }
        this.jumpscareVideo.play(false);
    }
}
