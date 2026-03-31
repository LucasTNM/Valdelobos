import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, type) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type; // 'light' ou 'shadow'
        this.setCollideWorldBounds(false);

        this.speed = type === 'light' ? 80 : 120;
        this.maxHealth = 60;
        this.health = 60;

        // ATAQUE
        this.attackRange = 60; // Reduzido de 100 para 60
        this.attackCooldown = 800;
        this.lastAttackTime = 0;

        // Escala
        if (scene.player && scene.player.height > 0 && this.height > 0) {
            const heroDisplayHeight = scene.player.height * scene.player.scaleY;
            const targetHeight = heroDisplayHeight * 0.5;
            const scale = targetHeight / this.height;
            this.setScale(scale);
        } else {
            this.setScale(0.8);
        }

        this.setOrigin(0.5, 1);

        // Hitbox centralizada e maior
        if (this.body) {
            const bodyWidth = this.displayWidth * 0.6;
            const bodyHeight = this.displayHeight * 0.7;
            const offsetX = (this.displayWidth - bodyWidth) / 2;
            // Com origin (0.5, 1), o corpo físico começa do topo (y=0)
            // então o offset vertical deve posicionar no corpo, não acima
            const offsetY = this.displayHeight * 0.30; // 15% do topo = pula a cabeça
            this.body.setSize(bodyWidth, bodyHeight);
            this.body.setOffset(offsetX, offsetY);
        }

        // Barra de vida
        this.healthBar = scene.add.graphics();
        this.healthBar.setDepth(104);
        this.updateHealthBar();

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

        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            this.target.x, this.target.y
        );

        const playerIsVisible = this.target.fuel > 0 && this.target.isLightOn;

        // ========================
        // IA
        // ========================
        if (this.type === 'light') {
            // Só age com luz acesa
            if (playerIsVisible && distance < 400) {
                this.state = 'CHASE';
            } else {
                this.state = 'IDLE';
            }
        } else {
            // Sombra age no escuro
            if (!playerIsVisible && distance < 800) {
                this.state = 'CHASE';
            } else if (playerIsVisible && distance < 200) {
                // Foge da luz
                this.state = 'IDLE';
                const angle = Phaser.Math.Angle.Between(
                    this.target.x, this.target.y,
                    this.x, this.y
                );
                this.setVelocity(
                    Math.cos(angle) * this.speed,
                    Math.sin(angle) * this.speed
                );
                return;
            } else {
                this.state = 'IDLE';
            }
        }

        // ========================
        // MOVIMENTO (com correção)
        // ========================
        if (this.state === 'CHASE') {
            if (distance > this.attackRange) {
                this.scene.physics.moveToObject(this, this.target, this.speed);
            } else {
                this.setVelocity(0); // evita orbitar
            }

            this.setFlipX(this.body.velocity.x < 0);
            this.setRotation(Math.sin(this.scene.time.now * 0.01) * 0.1);
        } else {
            this.setVelocity(0);
            this.setRotation(0);
        }

        // ========================
        // ATAQUE POR TIPO
        // ========================
        if (this.type === 'light' && playerIsVisible && distance < this.attackRange) {
            this.tryAttack();
        }

        if (this.type === 'shadow' && !playerIsVisible && distance < this.attackRange) {
            this.tryAttack();
        }

        this.updateHealthBar();

        if (this.target.isAttacking) {
            this.checkBeamHit();
        }
    }

    tryAttack() {
        const now = this.scene.time.now;

        if (now - this.lastAttackTime > this.attackCooldown) {
            this.attack();
            this.lastAttackTime = now;
        }
    }

    attack() {
        if (!this.target || !this.target.takeDamage) return;

        this.target.takeDamage(20); // Aumentado de 10 para 20

        // Feedback visual
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.active) this.clearTint();
        });
    }

    checkBeamHit() {
        const player = this.target;

        const angleToEnemy = Phaser.Math.Angle.Between(
            player.x, player.y, // removido o -40
            this.x, this.y - (this.displayHeight * 0.4) // centro vertical do inimigo
        );

        const playerRotation = player.flipX ? Math.PI : 0;
        const diff = Phaser.Math.Angle.Normalize(angleToEnemy - playerRotation);
        const threshold = 0.3;

        if (Math.abs(diff) < threshold || Math.abs(diff - Math.PI * 2) < threshold) {
            const dist = Phaser.Math.Distance.Between(
                player.x, player.y,
                this.x, this.y
            );

            if (dist < 400) {
                this.takeDamage(2);
            }
        }
    }

    updateHealthBar() {
        if (!this.active) return;

        this.healthBar.clear();

        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(this.x - 20, this.y - 70, 40, 6);

        const healthPercent = Math.max(0, this.health / this.maxHealth);
        const barColor = this.type === 'light' ? 0xff4444 : 0xaa0000;

        this.healthBar.fillStyle(barColor, 1);
        this.healthBar.fillRect(this.x - 20, this.y - 70, 40 * healthPercent, 6);
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