import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import FishingScene from './scenes/FishingScene';
import Level1_Arrival from './scenes/Level1_Arrival';
import Level4_Camp from './scenes/Level4_Camp';
import level6_Escape from './scenes/level6_Escape';
import GameOver from './scenes/GameOver';

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
        MenuScene,
        FishingScene,
        Level1_Arrival,
        Level4_Camp,
        level6_Escape,
        GameOver
    ]
};

// Inicializa o jogo
const game = new Phaser.Game(config);

// Redimensiona o jogo quando a janela mudar de tamanho
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});