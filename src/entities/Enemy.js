import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, type) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type;
        this.setCollideWorldBounds(false);
        this.speed = type === 'light' ? 80 : 120;
        this.attackRange = type === 'light' ? 200 : 250;

        this.baseSpeed = this.speed;
        this.speedMultiplier = 1;
        this.chaseDistance = this.type === 'light' ? 600 : 1200;
        this.lastAttackTime = 0;
        this.attackCooldown = 1000;
        this.maxHealth = 60;
        this.health = 60;

        if (scene.player && scene.player.height > 0 && this.height > 0) {
            const heroDisplayHeight = scene.player.height * scene.player.scaleY;
            const targetHeight = heroDisplayHeight * 0.5;
            const baseScale = targetHeight / this.height;
            const typeScale = this.type === 'light' ? 0.85 : 1;
            this.setScale(baseScale * typeScale);
        } else {
            const typeScale = this.type === 'light' ? 0.85 : 1;
            this.setScale(0.8 * typeScale);
        }

        this.setOrigin(0.5, 1);

        this.updateCollisionBox();

        this.healthBar = scene.add.graphics();
        this.healthBar.setDepth(104);
        this.healthBar.setVisible(this.type !== 'light');
        this.updateHealthBar();

        this.debugBody = scene.add.graphics();
        this.debugBody.setDepth(1000);

        if (!scene.monsterSound) {
            scene.monsterSound = scene.sound.add('monstro', {
                loop: true,
                volume: 0.18
            });
            scene.monsterSound.play();
            scene.monsterSoundEnemyCount = 0;
        }
        scene.monsterSoundEnemyCount = (scene.monsterSoundEnemyCount || 0) + 1;

        if (!scene.monsterSoundShutdownRegistered) {
            scene.events.once('shutdown', () => {
                if (scene.monsterSound) {
                    scene.monsterSound.stop();
                    scene.monsterSound.destroy();
                    scene.monsterSound = null;
                }
                scene.monsterSoundEnemyCount = 0;
            });
            scene.monsterSoundShutdownRegistered = true;
        }

        this.on('destroy', () => {
            if (this.debugBody) {
                this.debugBody.destroy();
            }

            scene.monsterSoundEnemyCount = Math.max(0, (scene.monsterSoundEnemyCount || 1) - 1);
            if (scene.monsterSoundEnemyCount === 0 && scene.monsterSound) {
                scene.monsterSound.stop();
                scene.monsterSound.destroy();
                scene.monsterSound = null;
            }
        });

        this.state = 'IDLE';
        this.target = scene.player;

        if (this.type === 'light') {
            this.play('enemy_light_walk');
        } else {

            this.play('enemy_shadow_idle');
        }

    }

    update() {
        if (!this.active || !this.target) return;

        const targetPoint = this.getTargetHitPoint();
        const selfPoint = this.getSelfHitPoint();
        const distance = Phaser.Math.Distance.Between(
            selfPoint.x, selfPoint.y,
            targetPoint.x, targetPoint.y
        );

        const playerIsVisible = this.target.fuel > 0 && this.target.isLightOn;

        if (this.type === 'light') {

            if (playerIsVisible && distance < (this.chaseDistance || 600)) {
                this.state = 'CHASE';
            } else {
                this.state = 'IDLE';
            }
        } else {

            if (!playerIsVisible && distance < (this.chaseDistance || 1200)) {
                this.state = 'CHASE';
            } else if (playerIsVisible) {
                this.state = 'FLEE';
            } else {
                this.state = 'IDLE';
            }
        }

        const canAttackTarget = this.canAttackTarget();
        const approachPoint = this.getTargetApproachPoint(selfPoint, targetPoint);

        if (this.state === 'CHASE') {
            if (!canAttackTarget) {
                const angle = Phaser.Math.Angle.Between(
                    selfPoint.x, selfPoint.y,
                    approachPoint.x, approachPoint.y
                );
                const effectiveSpeed = (this.baseSpeed || this.speed) * (this.speedMultiplier || 1);
                this.setVelocity(
                    Math.cos(angle) * effectiveSpeed,
                    Math.sin(angle) * effectiveSpeed
                );
            } else {
                this.setVelocity(0);
            }

            this.setFlipX(this.body.velocity.x < 0);
            this.setRotation(Math.sin(this.scene.time.now * 0.01) * 0.1);
        } else if (this.state === 'FLEE') {
            const angle = Phaser.Math.Angle.Between(
                targetPoint.x, targetPoint.y,
                selfPoint.x, selfPoint.y
            );
            const effectiveSpeed = (this.baseSpeed || this.speed) * (this.speedMultiplier || 1);
            this.setVelocity(
                Math.cos(angle) * effectiveSpeed,
                Math.sin(angle) * effectiveSpeed
            );
            this.setFlipX(this.body.velocity.x < 0);
            this.setRotation(Math.sin(this.scene.time.now * 0.01) * 0.1);
        } else {
            this.setVelocity(0);
            this.setRotation(0);
        }

        if (this.type === 'light' && playerIsVisible && canAttackTarget) {
            this.tryAttack();
        }

        if (this.type === 'shadow' && !playerIsVisible && canAttackTarget) {
            this.tryAttack();
        }

        this.updateHealthBar();
        this.updateDebugGraphic();

        if (this.target.isAttacking) {
            this.checkBeamHit();
        }

        if (this.type !== 'light' && this.target.isLightOn && this.target.fuel > 0) {
            this.checkLanternLight();
        }
    }

    tryAttack() {
        const now = this.scene.time.now;

        if (this.canAttackTarget() && now - this.lastAttackTime > this.attackCooldown) {
            this.attack();
            this.lastAttackTime = now;
        }
    }

    attack() {
        if (!this.target || !this.target.takeDamage) return;
        if (!this.canAttackTarget()) return;

        this.target.takeDamage(20, this.type);

        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.active) this.clearTint();
        });
    }

    checkBeamHit() {
        const player = this.target;
        const playerAttackX = player.x + (player.flipX ? -player.lightXOffset : player.lightXOffset);
        const playerAttackY = player.y + player.lightYOffset;
        const enemyHit = this.getSelfHitPoint();
        const enemyHitX = enemyHit.x;
        const enemyHitY = enemyHit.y;

        const angleToEnemy = Phaser.Math.Angle.Between(
            playerAttackX, playerAttackY,
            enemyHitX, enemyHitY
        );

        const playerRotation = player.flipX ? Math.PI : 0;
        const diff = Phaser.Math.Angle.Normalize(angleToEnemy - playerRotation);
        const threshold = 0.55;

        if (Math.abs(diff) < threshold || Math.abs(diff - Math.PI * 2) < threshold) {
            const dist = Phaser.Math.Distance.Between(
                playerAttackX, playerAttackY,
                enemyHitX, enemyHitY
            );

            if (dist < 400) {
                this.takeDamage(2);
            }
        }
    }

    checkLanternLight() {
        const player = this.target;
        const enemyHit = this.getSelfHitPoint();
        const enemyHitX = enemyHit.x;
        const enemyHitY = enemyHit.y;
        const dist = Phaser.Math.Distance.Between(
            player.x + player.lightXOffset,
            player.y + player.lightYOffset,
            enemyHitX,
            enemyHitY
        );

        if (dist < player.lightRadius) {
            this.takeDamage(1);
        }
    }

    updateHealthBar() {
        if (!this.active) return;

        if (this.type === 'light') {
            this.healthBar.clear();
            this.healthBar.setVisible(false);
            return;
        }

        this.healthBar.clear();

        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(this.x - 20, this.y - 70, 40, 6);

        const healthPercent = Math.max(0, this.health / this.maxHealth);
        const barColor = this.type === 'light' ? 0xff4444 : 0xaa0000;

        this.healthBar.fillStyle(barColor, 1);
        this.healthBar.fillRect(this.x - 20, this.y - 70, 40 * healthPercent, 6);
    }

    updateCollisionBox() {
        if (!this.body) return;

        const sourceWidth = this.width || this.displayWidth || 1;
        const sourceHeight = this.height || this.displayHeight || 1;

        const hitboxSettings = {
            light: {
                centerX: sourceWidth * 0.5,
                bottomY: sourceHeight - 1,
                widthScale: 0.5,
                height: Math.max(8, sourceHeight * 0.12)
            },
            shadow: {
                centerX: sourceWidth * 0.5,
                bottomY: sourceHeight * 0.9,
                widthScale: 0.35,
                height: Math.max(12, sourceHeight * 0.12)
            }
        };

        const { centerX, bottomY, widthScale, height } = hitboxSettings[this.type] || hitboxSettings.shadow;
        const bodyWidth = sourceWidth * widthScale;
        const bodyHeight = height;
        const offsetX = centerX - (bodyWidth / 2);
        const offsetY = bottomY - bodyHeight;

        this.body.setSize(bodyWidth, bodyHeight, false);
        this.body.setOffset(offsetX, offsetY);
    }

    canAttackTarget(maxX = 34, maxY = 38) {
        if (!this.body || !this.target?.body) return false;

        const a = this.getSelfHitPoint();
        const b = this.getTargetHitPoint();
        const approachPoint = this.getTargetApproachPoint(a, b);

        return Math.abs(a.x - approachPoint.x) <= maxX && Math.abs(a.y - approachPoint.y) <= maxY;
    }

    getSelfHitPoint() {
        const sourceWidth = this.width || this.displayWidth || 1;
        const sourceHeight = this.height || this.displayHeight || 1;

        const combatSettings = {
            light: {
                centerX: sourceWidth * 0.5,
                centerY: sourceHeight * 0.5
            },
            shadow: {
                centerX: sourceWidth * 0.5,
                centerY: sourceHeight * 0.7
            }
        };

        const { centerX, centerY } = combatSettings[this.type] || combatSettings.shadow;

        return {
            x: this.x + this.scaleX * (centerX - this.displayOriginX),
            y: this.y + this.scaleY * (centerY - this.displayOriginY)
        };
    }

    getTargetHitPoint() {
        if (this.target?.getCombatPoint) {
            return this.target.getCombatPoint();
        }

        if (!this.target?.body) {
            return { x: this.target?.x || this.x, y: this.target?.y || this.y };
        }

        return {
            x: this.target.body.center.x,
            y: this.target.body.center.y
        };
    }

    getTargetApproachPoint(selfPoint = this.getSelfHitPoint(), targetPoint = this.getTargetHitPoint()) {
        if (!this.attackSide || Math.abs(selfPoint.x - targetPoint.x) > 120) {
            this.attackSide = selfPoint.x < targetPoint.x ? -1 : 1;
        }

        const sideOffset = this.type === 'light' ? 58 : 66;

        return {
            x: targetPoint.x + this.attackSide * sideOffset,
            y: targetPoint.y
        };
    }

    updateDebugGraphic() {
        if (!this.debugBody) return;

        if (this.scene.game.debugMode) {
            this.debugBody.visible = true;
            this.debugBody.clear();
            this.debugBody.lineStyle(2, 0xff00ff, 1);
            if (this.body) {
                this.debugBody.strokeRect(this.body.x, this.body.y, this.body.width, this.body.height);
            }
        } else {
            this.debugBody.clear();
            this.debugBody.visible = false;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.updateHealthBar();

        this.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => {
            if (this.active) this.clearTint();
        });

        if (this.health <= 0) {
            this.healthBar.destroy();
            this.die();
        }
    }

    die() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.5,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
    }
}
