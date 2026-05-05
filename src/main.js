import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import FishingScene from './scenes/FishingScene';
import Level1_Arrival from './scenes/Level1_Arrival';
import Level4_Camp from './scenes/Level4_Camp';
import Level5_DarkForest from './scenes/Level5_DarkForest';
import Level6_Road from './scenes/Level6_Road';
import Level6_Escape from './scenes/level6_Escape';
import GameOver from './scenes/GameOver';
import IntroScene from './scenes/IntroScene';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE, // Redimensiona com a janela
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
        fullscreenTarget: 'game-container',
        expandParent: true
    },
    parent: 'game-container',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        IntroScene,
        MenuScene,
        FishingScene,
        Level1_Arrival,
        Level4_Camp,
        Level5_DarkForest,
        Level6_Road,
        Level6_Escape,
        GameOver
    ]
};

// Inicializa o jogo
const game = new Phaser.Game(config);
game.debugMode = false;

// Redimensiona o jogo quando a janela mudar de tamanho
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});