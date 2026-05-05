import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, type) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.type = type; // 'light' ou 'shadow'
        this.setCollideWorldBounds(false); // Desativar colisão com bordas do mundo
        this.speed = type === 'light' ? 80 : 120;
        this.maxHealth = 60;
        this.health = 60;

        // Ajustar escala baseando no tamanho do jogador para ficar equivalente
        if (scene.player && scene.player.height > 0 && this.height > 0) {
            const heroDisplayHeight = scene.player.height * scene.player.scaleY;
            const targetHeight = heroDisplayHeight * 0.5; // reduzido para 50% do herói
            const scale = targetHeight / this.height;
            this.setScale(scale);
        } else {
            this.setScale(0.8); // fallback menor também
        }

        this.setOrigin(0.5, 1); // igual ao jogador para alinhamento de chão

        // Collision body - Hitbox separada por tipo de inimigo
        if (this.body) {
            // Configurações de hitbox específicas para cada tipo
            const hitboxSettings = {
                light: {
                    widthScale: 0.1,
                    heightScale: 0.2,
                    offsetXAdjustment: -100,
                    offsetYAdjustment: -175
                },
                shadow: {
                    widthScale: 0.35,
                    heightScale: 0.75,
                    offsetXAdjustment: -8,
                    offsetYAdjustment: -10
                }
            };

            const { widthScale, heightScale, offsetXAdjustment, offsetYAdjustment } = hitboxSettings[this.type] || hitboxSettings.shadow;
            const bodyWidth = this.displayWidth * widthScale;
            const bodyHeight = this.displayHeight * heightScale;
            const offsetX = (this.displayWidth - bodyWidth) / 2 + offsetXAdjustment;
            const offsetY = this.displayHeight - bodyHeight + offsetYAdjustment;

            this.body.setSize(bodyWidth, bodyHeight);
            this.body.setOffset(offsetX, offsetY);

            // Ajuste esses valores para calibrar o hitbox de cada inimigo:
            // - light.widthScale / light.heightScale / light.offsetXAdjustment / light.offsetYAdjustment
            // - shadow.widthScale / shadow.heightScale / shadow.offsetXAdjustment / shadow.offsetYAdjustment
        }

        // Barra de vida do inimigo
        this.healthBar = scene.add.graphics();
        this.healthBar.setDepth(104);
        this.updateHealthBar();

        // Debug visual de colisões
        this.debugBody = scene.add.graphics();
        this.debugBody.setDepth(1000);
        this.on('destroy', () => {
            if (this.debugBody) {
                this.debugBody.destroy();
            }
        });

        // Estados: IDLE, CHASE, ATTACK
        this.state = 'IDLE';
        this.target = scene.player;

        if (this.type === 'light') {
            this.play('enemy_light_walk');
        } else {
            // Dependendo do gif, o Phaser pode não animar automaticamente; mantenha o frame
            this.play('enemy_shadow_idle');
        }

        // Não tint para sprites detalhadas. Mantém original dos PNGs.
        // Se quiser depuração de tipo, ative o tint abaixo:
        // this.tintValue = type === 'light' ? 0xffaaaa : 0x5555ff;
        // this.setTint(this.tintValue);
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
            } else if (playerIsVisible && distance < 100) {
                // Se o player ligar a luz muito próxima, ele recua (distância reduzida)
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
        this.updateDebugGraphic();

        if (this.target.isAttacking) {
            this.checkBeamHit();
        }

        // Checar se está dentro da área de luz da lanterna
        if (this.target.isLightOn && this.target.fuel > 0) {
            this.checkLanternLight();
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

    checkLanternLight() {
        const player = this.target;
        const dist = Phaser.Math.Distance.Between(player.x + player.lightXOffset, player.y + player.lightYOffset, this.x, this.y);
        
        // Se estiver dentro do raio de luz da lanterna
        if (dist < player.lightRadius) {
            this.takeDamage(1); // Dano contínuo menor da luz ambiente
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