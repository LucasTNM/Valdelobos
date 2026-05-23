export function playAmbient(scene, key, volume = 0.08) {
    if (!scene || !scene.sound) return null;

    if (scene.ambientSound && scene.ambientSound.key === key && scene.ambientSound.isPlaying) {
        return scene.ambientSound;
    }

    stopAmbient(scene);

    const ambientSound = scene.sound.add(key, {
        loop: true,
        volume
    });
    scene.ambientSound = ambientSound;
    ambientSound.play();

    if (!scene.ambientSoundShutdownRegistered) {
        scene.events.once('shutdown', () => {
            stopAmbient(scene);
        });
        scene.ambientSoundShutdownRegistered = true;
    }

    return ambientSound;
}

export function stopAmbient(scene) {
    if (!scene || !scene.ambientSound) return;

    const ambientSound = scene.ambientSound;
    scene.ambientSound = null;

    if (ambientSound.isPlaying) {
        ambientSound.stop();
    }
    if (ambientSound.destroy) {
        ambientSound.destroy();
    }
}

export function fadeAmbient(scene, targetVolume = 0.01, duration = 500) {
    if (!scene || !scene.ambientSound || !scene.tweens) return;

    scene.tweens.add({
        targets: scene.ambientSound,
        volume: targetVolume,
        duration,
        onComplete: () => {
            if (scene.ambientSound && scene.ambientSound.volume <= targetVolume + 0.001) {
                if (scene.ambientSound.isPlaying) {
                    scene.ambientSound.stop();
                }
                if (scene.ambientSound.destroy) {
                    scene.ambientSound.destroy();
                }
                scene.ambientSound = null;
            }
        }
    });
}
