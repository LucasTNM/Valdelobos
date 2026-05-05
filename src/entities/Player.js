import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'vaguetti');
        
        // Adicionar o jogador à cena e habilitar física
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configurações de física
        this.setCollideWorldBounds(true);
        this.setOrigin(0.5, 1);
        
        // Ajustar hitbox do player para ser mais precisa
        this.updateCollisionBox();
        
        // Velocidade de movimento
        this.speed = 200;

        // Atributos do Jogador
        this.maxFuel = 100;
        this.fuel = 100;
        this.maxHealth = 100;
        this.health = 100;
        this.isInvincible = false;
        this.fuelConsumptionRate = 3.0; // Aumentado de 1.5 para 3.0
        this.attackConsumptionRate = 20; // Aumentado de 10 para 20
        this.isAttacking = false;
        this.isLightOn = false; // Novo estado: lampião ligado/desligado
        
        // Armazenar a posição Y original para correto posicionamento da luz
        this.baseY = y;
        // Offsets para o lampião - calibrado para escala 0.7
        this.lightYOffset = -260; // Para cima
        this.lightXOffset = 50;   // Para frente
        
        // Luz do Lampião (Cor âmbar/quente)
        this.lightRadius = 200;
        this.light = scene.add.image(x + this.lightXOffset, y + this.lightYOffset, 'light_mask');
        this.light.setDisplaySize(this.lightRadius * 2, this.lightRadius * 2);
        this.light.setAlpha(0.6);
        this.light.setTint(0xffcc66); // Cor âmbar de lampião
        this.light.setBlendMode(Phaser.BlendModes.SCREEN); // SCREEN costuma dar um efeito melhor para luzes quentes
        this.light.setDepth(this.depth + 1);

        // Feixe de Luz (Ataque)
        this.beam = scene.add.image(x, y, 'light_beam');
        this.beam.setOrigin(0, 0.5);
        this.beam.setAlpha(0);
        this.beam.setTint(0xffaa44); // Feixe mais alaranjado/quente
        this.beam.setBlendMode(Phaser.BlendModes.ADD);
        this.beam.setDepth(this.depth + 2);

        // Barra de combustível (UI simples que segue)
        this.fuelBar = scene.add.graphics();
        this.updateFuelBar();

        // Debug visual de colisões
        this.debugBody = scene.add.graphics();
        this.debugBody.setDepth(1000);
        this.on('destroy', () => {
            if (this.debugBody) {
                this.debugBody.destroy();
            }
        });

        // Teclas de controle
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            toggleLight: Phaser.Input.Keyboard.KeyCodes.F
        });

        // Flag para controlar animação
        this.isAnimationPlaying = false;
    }

    update() {
        // Alternar lampião (Tecla F)
        if (Phaser.Input.Keyboard.JustDown(this.wasd.toggleLight)) {
            this.toggleLight();
        }
        
        // Verificar se há movimento
        let isMoving = false;
        
        // Movimentação horizontal
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

        // Movimentação vertical (opcional para exploração)
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.setVelocityY(-this.speed);
            isMoving = true;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.setVelocityY(this.speed);
            isMoving = true;
        } else {
            this.setVelocityY(0);
        }

        // Controlar animação com base no movimento
        if (isMoving) {
            if (!this.isAnimationPlaying) {
                this.setTexture('vaguetti_frame_0'); // Trocar para primeira frame da animação
                this.play('vaguetti_walk');
                this.isAnimationPlaying = true;
            }
        } else {
            if (this.isAnimationPlaying) {
                this.stop();
                this.setTexture('vaguetti'); // Voltar à imagem default
                this.isAnimationPlaying = false;
            }
        }

        // Lógica de Ataque (Espaço) - Somente se a luz estiver ligada e houver combustível
        if (this.cursors.space.isDown && this.fuel > 0 && this.isLightOn) {
            this.isAttacking = true;
            this.beam.setAlpha(0.8);
            this.beam.setX(this.x + this.lightXOffset);
            this.beam.setY(this.y + this.lightYOffset); // Usar o mesmo offset que a luz
            this.beam.setRotation(this.flipX ? Math.PI : 0);
            
            // Faíscas ao atacar
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

            // Consumo extra ao atacar
            this.fuel -= (this.attackConsumptionRate / 60); 
        } else {
            this.isAttacking = false;
            this.beam.setAlpha(0);
        }

        // Consumo passivo de querosene (Somente se ligado)
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

        // Atualizar brilho baseado no querosene (Somente se ligado)
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

        // Atualizar posições dos efeitos
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

        const bodyWidth = this.displayWidth * 0.4;
        const bodyHeight = this.displayHeight/2;
        const offsetX = (this.displayWidth - bodyWidth);
        const offsetY = this.displayHeight - bodyHeight;

        this.body.setSize(bodyWidth, bodyHeight);
        this.body.setOffset(offsetX, offsetY);
    }

    updateVisualScale() {
        if (this.light) {
            this.light.setScale(this.scaleX);
        }
        if (this.beam) {
            this.beam.setScale(this.scaleX);
        }
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
        
        // Posição da barra ajustada para escala
        const barOffsetY = -180;
        const barWidth = 80;
        const barHeight = 12;
        const barX = this.x - 40;
        const barY = this.y + barOffsetY;
        
        // Borda externa (moldura)
        this.fuelBar.lineStyle(2, 0x000000, 0.8);
        this.fuelBar.strokeRect(barX, barY, barWidth, barHeight);
        
        // Fundo das barras (mais escuro)
        this.fuelBar.fillStyle(0x1a1a1a, 0.8);
        this.fuelBar.fillRect(barX, barY, barWidth, barHeight);
        
        // Barra de Vida (Verde brilhante)
        const healthPercent = Math.max(0, this.health / this.maxHealth);
        this.fuelBar.fillStyle(0x00ff00, 1);
        this.fuelBar.fillRect(barX + 2, barY + 2, (barWidth - 4) * healthPercent, (barHeight / 2) - 2);
        
        // Borda interna da barra de vida
        this.fuelBar.lineStyle(1, 0x008800, 0.6);
        this.fuelBar.strokeRect(barX + 2, barY + 2, (barWidth - 4) * healthPercent, (barHeight / 2) - 2);

        // Barra de Combustível (Ciano/Cinza/Vermelho com gradiente de cor)
        const fuelPercent = Math.max(0, this.fuel / this.maxFuel);
        let fuelColor;
        
        if (fuelPercent > 0.5) {
            fuelColor = 0x00ffff; // Ciano - bom
        } else if (fuelPercent > 0.2) {
            fuelColor = 0xffaa00; // Laranja - cuidado
        } else {
            fuelColor = 0xff0000; // Vermelho - crítico
        }
        
        this.fuelBar.fillStyle(fuelColor, 1);
        this.fuelBar.fillRect(barX + 2, barY + (barHeight / 2), (barWidth - 4) * fuelPercent, (barHeight / 2) - 2);
        
        // Borda interna da barra de combustível
        this.fuelBar.lineStyle(1, 0x008888, 0.6);
        this.fuelBar.strokeRect(barX + 2, barY + (barHeight / 2), (barWidth - 4) * fuelPercent, (barHeight / 2) - 2);
    }

    takeDamage(amount) {
        if (this.isInvincible || this.health <= 0) return;
        
        this.health -= amount;
        this.isInvincible = true;
        this.setTint(0xff0000);
        this.scene.cameras.main.shake(100, 0.01);
        
        if (this.health <= 0) {
            this.health = 0;
            this.updateFuelBar();
            // Notificar a cena para o Game Over
            if (this.scene.gameOver) {
                this.scene.gameOver();
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
            
            // Efeito visual imediato de ligar/desligar
            if (!this.isLightOn) {
                this.light.setAlpha(0);
                this.isAttacking = false;
                this.beam.setAlpha(0);
            }
            
            // Som de clique (feedback visual por enquanto)
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
