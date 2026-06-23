export function showDialogue(scene, text, duration = 4000, fadeDuration = 800) {
    const screenWidth = scene.scale.width;
    const screenHeight = scene.scale.height;

    const padding = 20;
    const maxWidth = Math.min(900, screenWidth * 0.9);
    const yPosition = screenHeight - 140;

    const dialogText = scene.add.text(
        screenWidth / 2,
        yPosition,
        '',
        {
            fontFamily: 'Georgia',
            fontSize: '60px',
            color: '#ffffff',
            align: 'center',
            wordWrap: {
                width: maxWidth - padding * 2
            }
        }
    )
    .setOrigin(0.5)
    .setDepth(1000);

    const dialogBg = scene.add.rectangle(
        screenWidth / 2,
        yPosition,
        maxWidth,
        90,
        0x000000,
        0
    )
    .setOrigin(0.5)
    .setDepth(999);

    const container = scene.add.container(
        0,
        0,
        [dialogBg, dialogText]
    ).setDepth(1000);

    dialogBg.setScrollFactor(0);
    dialogText.setScrollFactor(0);
    container.setScrollFactor(0);

    container.setAlpha(0);

    scene.tweens.add({
        targets: container,
        alpha: 1,
        duration: 400,
        ease: 'Power2'
    });

    let currentText = '';
    let index = 0;

    const typingEvent = scene.time.addEvent({
        delay: 40,
        repeat: text.length - 1,
        callback: () => {
            currentText += text[index];
            dialogText.setText(currentText);

            index++;

            const bounds = dialogText.getBounds();

            dialogBg.width = bounds.width + padding * 2;
            dialogBg.height = bounds.height + padding * 1.8;
        }
    });

    scene.time.delayedCall(duration, () => {
        scene.tweens.add({
            targets: container,
            alpha: 0,
            duration: fadeDuration,
            ease: 'Power2',
            onComplete: () => {
                typingEvent.remove();

                if (container && container.destroy) {
                    container.destroy();
                }
            }
        });
    });

    return container;
}