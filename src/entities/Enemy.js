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

        // Collision body - MUITO MENOR e mais preciso
        if (this.body) {
            // Hitbox minúscula - apenas o core do corpo
            const bodyWidth = this.displayWidth * 0.35;
            const bodyHeight = this.displayHeight * 0.45;
            const offsetX = (this.displayWidth - bodyWidth) / 2;
            const offsetY = (this.displayHeight - bodyHeight);
            this.body.setSize(bodyWidth, bodyHeight);
            this.body.setOffset(offsetX, offsetY);
        }

        // Barra de vida do inimigo
        this.healthBar = scene.add.graphics();
        this.updateHealthBar();

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

        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
        const playerIsVisible = this.target.fuel > 0 && this.target.isLightOn;

        // Lógica de IA baseada no tipo
        if (this.type === 'light') {
            // Monstro da Luz: Atraído pela luz
            if (playerIsVisible && distance < 600) {
                this.state = 'CHASE';
            } else {
                this.state = 'IDLE';
            }
        } else {
            // Monstro da Escuridão: Caçador das sombras
            if (!playerIsVisible && distance < 800) {
                this.state = 'CHASE';
            } else if (playerIsVisible && distance < 200) {
                // Se o player ligar a luz na cara dele, ele recua
                this.state = 'IDLE';
                const angle = Phaser.Math.Angle.Between(this.target.x, this.target.y, this.x, this.y);
                this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
                return;
            } else {
                this.state = 'IDLE';
            }
        }

        // Executar movimento baseado no estado
        if (this.state === 'CHASE') {
            this.scene.physics.moveToObject(this, this.target, this.speed);
            this.setFlipX(this.body.velocity.x < 0);
            
            // Pequeno balanço ao perseguir
            this.setRotation(Math.sin(this.scene.time.now * 0.01) * 0.1);
        } else if (this.state === 'IDLE') {
            this.setVelocity(0);
            this.setRotation(0);
        }

        this.updateHealthBar();

        // Checar se está sendo atingido pelo feixe de luz
        if (this.target.isAttacking) {
            this.checkBeamHit();
        }
    }

    checkBeamHit() {
        const player = this.target;
        const angleToEnemy = Phaser.Math.Angle.Between(player.x, player.y - 40, this.x, this.y);
        const playerRotation = player.flipX ? Math.PI : 0;
        
        // Diferença de ângulo pequena (feixe de ~30 graus)
        const diff = Phaser.Math.Angle.Normalize(angleToEnemy - playerRotation);
        const threshold = 0.3; // Aproximadamente 17 graus para cada lado

        if (Math.abs(diff) < threshold || Math.abs(diff - Math.PI*2) < threshold) {
            const dist = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
            if (dist < 400) {
                this.takeDamage(2); // Dano contínuo duplicado (mais forte)
            }
        }
    }

    updateHealthBar() {
        if (!this.active) return;
        this.healthBar.clear();
        
        // Fundo (preto)
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(this.x - 20, this.y - 70, 40, 6);
        
        // Barra (Vermelha)
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
            if (this.active) this.setTint(this.tintValue);
        });

        if (this.health <= 0) {
            this.healthBar.destroy();
            this.die();
        }
    }

    die() {
        // Efeito de morte (partículas ou fade)
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
