import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'vaguetti');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setOrigin(0.5, 1);

        this.updateCollisionBox();

        this.speed = 200;

        this.maxFuel = 100;
        this.fuel = 100;
        this.maxHealth = 100;
        this.health = 100;
        this.isInvincible = false;
        this.fuelConsumptionRate = 3.0;
        this.attackConsumptionRate = 20;
        this.isAttacking = false;
        this.isLightOn = false;

        this.baseY = y;

        this.lightYOffset = -260;
        this.lightXOffset = 50;

        this.lightRadius = 200;
        this.light = scene.add.image(x + this.lightXOffset, y + this.lightYOffset, 'light_mask');
        this.light.setDisplaySize(this.lightRadius * 2, this.lightRadius * 2);
        this.light.setAlpha(0.6);
        this.light.setTint(0xffcc66);
        this.light.setBlendMode(Phaser.BlendModes.SCREEN);
        this.light.setDepth(this.depth + 1);

        this.beam = scene.add.image(x, y, 'light_beam');
        this.beam.setOrigin(0, 0.5);
        this.beam.setAlpha(0);
        this.beam.setTint(0xffaa44);
        this.beam.setBlendMode(Phaser.BlendModes.ADD);
        this.beam.setDepth(this.depth + 2);

        this.fuelBar = scene.add.graphics();
        this.updateFuelBar();

        this.debugBody = scene.add.graphics();
        this.debugBody.setDepth(1000);

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            toggleLight: Phaser.Input.Keyboard.KeyCodes.F
        });

        this.stepSound = scene.sound.add('passo', {
            loop: true,
            volume: 0.18
        });

        this.lampSound = scene.sound.add('lamp', {
            loop: false,
            volume: 0.18,
            allowMultiple: false
        });

        this.isAnimationPlaying = false;

        this.on('destroy', () => {
            if (this.debugBody) {
                this.debugBody.destroy();
            }
            if (this.stepSound) {
                this.stepSound.stop();
                this.stepSound.destroy();
            }
        });
    }

    update() {

        if (Phaser.Input.Keyboard.JustDown(this.wasd.toggleLight)) {
            this.toggleLight();
        }

        if (this.isFishing) {
            this.setVelocity(0, 0);
            this.anims.stop();
            this.isAnimationPlaying = false;
            if (this.stepSound && this.stepSound.isPlaying) {
                this.stepSound.stop();
            }
            return;
        }

        let isMoving = false;

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.setVelocityX(-this.speed);
            this.setFlipX(true);
            isMoving = true;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.setVelocityX(this.speed);
            this.setFlipX(false);
            isMoving = true;
        } else {
            this.setVelocityX(0);
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.setVelocityY(-this.speed);
            isMoving = true;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.setVelocityY(this.speed);
            isMoving = true;
        } else {
            this.setVelocityY(0);
        }

        if (isMoving) {
            if (this.stepSound && !this.stepSound.isPlaying) {
                this.stepSound.play();
            }
        } else if (this.stepSound && this.stepSound.isPlaying) {
            this.stepSound.stop();
        }

        if (isMoving) {
            if (!this.isAnimationPlaying) {
                this.setTexture('vaguetti_frame_0');
                this.updateCollisionBox();
                this.play('vaguetti_walk');
                this.isAnimationPlaying = true;
            }
        } else {
            if (this.isAnimationPlaying) {
                this.stop();
                this.setTexture('vaguetti');
                this.updateCollisionBox();
                this.isAnimationPlaying = false;
            }
        }

        if (this.cursors.space.isDown && this.fuel > 0 && this.isLightOn) {
            this.isAttacking = true;
            this.beam.setAlpha(0.8);
            this.beam.setX(this.x + this.lightXOffset);
            this.beam.setY(this.y + this.lightYOffset);
            this.beam.setRotation(this.flipX ? Math.PI : 0);

            if (Math.random() > 0.6) {
                const sparkColor = Math.random() > 0.5 ? 0xffaa00 : 0xffff00;
                const spark = this.scene.add.circle(this.beam.x, this.beam.y, 2, sparkColor);
                spark.setDepth(102);
                const angle = this.flipX ? Math.PI : 0;
                this.scene.physics.add.existing(spark);
                spark.body.setVelocity(
                    Math.cos(angle + (Math.random()-0.5)) * 300,
                    (Math.random()-0.5) * 200
                );
                this.scene.tweens.add({
                    targets: spark,
                    alpha: 0,
                    duration: 400,
                    onComplete: () => spark.destroy()
                });
            }

            this.fuel -= (this.attackConsumptionRate / 60);
        } else {
            this.isAttacking = false;
            this.beam.setAlpha(0);
        }

        if (this.fuel > 0 && this.isLightOn) {
            this.fuel -= (this.fuelConsumptionRate / 60);
        } else if (this.fuel <= 0) {
            this.fuel = 0;
            this.isLightOn = false;
            this.light.setAlpha(0);
        }

        if (!this.isLightOn) {
            this.light.setAlpha(0);
            this.beam.setAlpha(0);
        }

        if (this.fuel > 0 && this.isLightOn) {
            const flicker = Math.random() * 0.05;
            this.light.setAlpha(0.4 + (this.fuel / this.maxFuel) * 0.4 + flicker);
            this.light.setDisplaySize(
                (this.lightRadius * 0.5 + (this.fuel / this.maxFuel) * this.lightRadius * 1.5) + flicker * 10,
                (this.lightRadius * 0.5 + (this.fuel / this.maxFuel) * this.lightRadius * 1.5) + flicker * 10
            );
        }

        const scaledLightX = this.lightXOffset * this.scaleX;
        const scaledLightY = this.lightYOffset * this.scaleY;

        this.light.setPosition(this.x + scaledLightX, this.y + scaledLightY);
        this.beam.setX(this.x + scaledLightX);
        this.beam.setY(this.y + scaledLightY);
        this.updateFuelBar();
        this.updateDebugGraphic();
    }

    updateDebugGraphic() {
        if (!this.debugBody) return;

        if (this.scene.game.debugMode) {
            this.debugBody.visible = true;
            this.debugBody.clear();
            this.debugBody.lineStyle(2, 0x00ffff, 1);
            if (this.body) {
                this.debugBody.strokeRect(this.body.x, this.body.y, this.body.width, this.body.height);
            }
        } else {
            this.debugBody.clear();
            this.debugBody.visible = false;
        }
    }

    updateCollisionBox() {
        if (!this.body) return;

        const bounds = this.getVisibleBounds();
        const visibleWidth = bounds.right - bounds.left + 1;
        const bodyWidth = visibleWidth * 0.7;
        const bodyHeight = 24;
        const offsetX = ((bounds.left + bounds.right) / 2) - (bodyWidth / 2);
        const offsetY = bounds.bottom - bodyHeight;

        this.body.setSize(bodyWidth, bodyHeight, false);
        this.body.setOffset(offsetX, offsetY);
    }

    getVisibleBounds() {
        const visibleBounds = {
            vaguetti: { left: 139, right: 253, top: 222, bottom: 421 },
            vaguetti_frame_0: { left: 140, right: 260, top: 222, bottom: 399 },
            vaguetti_frame_1: { left: 140, right: 252, top: 224, bottom: 402 },
            vaguetti_frame_2: { left: 140, right: 260, top: 226, bottom: 403 },
            vaguetti_frame_3: { left: 140, right: 265, top: 223, bottom: 395 },
            vaguetti_frame_4: { left: 139, right: 251, top: 222, bottom: 394 },
            vaguetti_frame_5: { left: 140, right: 257, top: 223, bottom: 398 }
        };

        return visibleBounds[this.texture.key] || visibleBounds.vaguetti;
    }

    getCombatPoint() {
        const bounds = this.getVisibleBounds();
        const centerX = (bounds.left + bounds.right) / 2;
        const centerY = (bounds.top + bounds.bottom) / 2;

        return {
            x: this.x + this.scaleX * (centerX - this.displayOriginX),
            y: this.y + this.scaleY * (centerY - this.displayOriginY)
        };
    }

    updateVisualScale() {
        if (this.light) {
            this.light.setScale(this.scaleX);
        }
        if (this.beam) {
            this.beam.setScale(this.scaleX);
        }
    }

    setVisible(value) {
        const result = super.setVisible(value);

        if (this.fuelBar) {
            this.fuelBar.setVisible(value);
        }
        if (this.healthBar) {
            this.healthBar.setVisible(value);
        }
        if (this.light) {
            this.light.setVisible(value && this.isLightOn);
        }
        if (this.beam) {
            this.beam.setVisible(value && this.beam.alpha > 0);
        }
        if (this.debugBody) {
            this.debugBody.setVisible(value && this.scene.game.debugMode);
        }

        return result;
    }

    setScale(x, y) {
        const result = super.setScale(x, y);
        this.updateCollisionBox();
        this.updateVisualScale();
        return result;
    }

    updateFuelBar() {
        if (!this.active) return;

        this.fuelBar.clear();

        const barOffsetY = -180;
        const barWidth = 80;
        const barHeight = 12;
        const barX = this.x - 40;
        const barY = this.y + barOffsetY;

        this.fuelBar.lineStyle(2, 0x000000, 0.8);
        this.fuelBar.strokeRect(barX, barY, barWidth, barHeight);

        this.fuelBar.fillStyle(0x1a1a1a, 0.8);
        this.fuelBar.fillRect(barX, barY, barWidth, barHeight);

        const healthPercent = Math.max(0, this.health / this.maxHealth);
        this.fuelBar.fillStyle(0x00ff00, 1);
        this.fuelBar.fillRect(barX + 2, barY + 2, (barWidth - 4) * healthPercent, (barHeight / 2) - 2);

        this.fuelBar.lineStyle(1, 0x008800, 0.6);
        this.fuelBar.strokeRect(barX + 2, barY + 2, (barWidth - 4) * healthPercent, (barHeight / 2) - 2);

        const fuelPercent = Math.max(0, this.fuel / this.maxFuel);
        let fuelColor;

        if (fuelPercent > 0.5) {
            fuelColor = 0x00ffff;
        } else if (fuelPercent > 0.2) {
            fuelColor = 0xffaa00;
        } else {
            fuelColor = 0xff0000;
        }

        this.fuelBar.fillStyle(fuelColor, 1);
        this.fuelBar.fillRect(barX + 2, barY + (barHeight / 2), (barWidth - 4) * fuelPercent, (barHeight / 2) - 2);

        this.fuelBar.lineStyle(1, 0x008888, 0.6);
        this.fuelBar.strokeRect(barX + 2, barY + (barHeight / 2), (barWidth - 4) * fuelPercent, (barHeight / 2) - 2);
    }

    takeDamage(amount, attackerType) {
        if (this.isInvincible || this.health <= 0) return;

        this.health -= amount;
        this.isInvincible = true;
        this.setTint(0xff0000);
        this.scene.cameras.main.shake(100, 0.01);

        if (this.health <= 0) {
            this.health = 0;
            this.updateFuelBar();

            if (this.scene.gameOver) {
                this.scene.gameOver(attackerType);
            }
        }

        this.scene.time.delayedCall(1000, () => {
            if (this.active) {
                this.isInvincible = false;
                this.clearTint();
            }
        });
    }

    toggleLight() {
        if (this.fuel > 0) {
            this.isLightOn = !this.isLightOn;

            if (!this.isLightOn) {
                this.light.setAlpha(0);
                this.isAttacking = false;
                this.beam.setAlpha(0);
            }

            if (this.lampSound) {
                this.lampSound.play();
            }

            const text = this.isLightOn ? 'LUZ LIGADA' : 'LUZ DESLIGADA';
            const color = this.isLightOn ? '#ffff00' : '#888888';
            const feedback = this.scene.add.text(this.x, this.y - 80, text, {
                fontSize: '12px',
                color: color,
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(110);

            this.scene.tweens.add({
                targets: feedback,
                y: feedback.y - 40,
                alpha: 0,
                duration: 800,
                onComplete: () => feedback.destroy()
            });
        }
    }
}
