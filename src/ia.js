export default class CompanheiroIA {
    constructor() {
        this.webhookURL = 'https://n8n.incluc0de.com.br/webhook-test/horror-game';
        this.comentarioAtivo = false;
        this.filaComentarios = [];
    }

    // Método principal - NÃO TRAVA O JOGO (async/await)
    async pedirComentario(situacao, tipo = 'comentario') {
        if (!situacao) situacao = '';

        // Se já tem comentário ativo, coloca na fila
        if (this.comentarioAtivo) {
            this.filaComentarios.push({ situacao, tipo });
            return;
        }

        this.comentarioAtivo = true;

        const payload = {
            tipo,
            situacao,
            timestamp: new Date().toISOString()
        };

        let texto = null;

        try {
            const res = await fetch(this.webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Tenta JSON, cai para text se não for JSON
                try {
                    const data = await res.json();
                    // procura campos comuns
                    texto = data.texto || data.text || data.comment || data.comentario || (typeof data === 'string' ? data : null);
                } catch (err) {
                    try {
                        texto = await res.text();
                    } catch (err2) {
                        texto = null;
                    }
                }
            } else {
                // fallback se status não OK
                console.log('IA webhook returned non-ok status:', res.status);
            }
        } catch (err) {
            // fail silently (apenas log)
            console.log('Erro ao chamar webhook IA:', err);
        }

        if (!texto) {
            texto = this.getComentarioFallback(tipo);
        }

        try {
            this.mostrarComentario(texto);
        } catch (err) {
            console.log('Erro ao mostrar comentário:', err);
        }
    }

    // Fallback caso IA não responda
    getComentarioFallback(tipo) {
        const map = {
            sala_escura: [
                'Está tão escuro... algo observa.',
                'Sinta o ar: não estamos sozinhos aqui.',
                'A escuridão está densa. Respire devagar.'
            ],
            item: [
                'Isso pode ser útil... não desperdice.',
                'Pegue isso, pode salvar sua luz.',
                'Um achado inesperado. Cuidado ao usar.'
            ],
            jump_scare: [
                'Cuidado! Algo se moveu atrás de você!',
                'Não vire — apenas corra.',
                'Sinto um sopro gelado... prepare-se.'
            ],
            suspense: [
                'Silêncio agora. Ouça com atenção.',
                'Algo se aproxima, ouço passos distantes.',
                'Cada sombra tem um segredo.'
            ],
            comentario: [
                'Continue, mas mantenha-se atento.',
                'Avalie suas escolhas — elas têm consequências.',
                'O medo é apenas o começo.'
            ]
        };

        const pool = map[tipo] || map['comentario'];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // Exibe o balão na tela
    mostrarComentario(texto) {
        if (!texto) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'ia-comentario';

        // Estilo inline para garantir tema horror sem depender de CSS
        wrapper.style.position = 'fixed';
        wrapper.style.left = '50%';
        wrapper.style.transform = 'translateX(-50%)';
        wrapper.style.bottom = '8%';
        wrapper.style.padding = '14px 20px';
        wrapper.style.zIndex = '9999';
        wrapper.style.pointerEvents = 'none';
        wrapper.style.borderRadius = '6px';
        wrapper.style.boxShadow = '0 0 30px rgba(0,0,0,0.8)';
        wrapper.style.backdropFilter = 'blur(2px)';
        wrapper.style.opacity = '0';
        wrapper.style.transition = 'opacity 300ms ease, transform 300ms ease';

        // Horror theme: subtle blood/ink effect and monospace for narration
        const inner = document.createElement('div');
        inner.style.color = '#ffdddd';
        inner.style.fontFamily = 'Georgia, serif';
        inner.style.fontSize = '18px';
        inner.style.lineHeight = '1.2';
        inner.style.textAlign = 'center';
        inner.style.textShadow = '0 2px 8px rgba(0,0,0,0.9)';

        // small header for narrator
        const header = document.createElement('div');
        header.textContent = 'Companheiro';
        header.style.fontSize = '12px';
        header.style.color = '#ff7777';
        header.style.letterSpacing = '1px';
        header.style.marginBottom = '6px';

        const content = document.createElement('div');
        content.textContent = texto;

        inner.appendChild(header);
        inner.appendChild(content);
        wrapper.appendChild(inner);

        document.body.appendChild(wrapper);

        // força repaint e animar
        requestAnimationFrame(() => {
            wrapper.style.opacity = '1';
            wrapper.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Remover após 5 segundos
        setTimeout(() => {
            wrapper.style.opacity = '0';
            wrapper.style.transform = 'translateX(-50%) translateY(10px)';
            setTimeout(() => {
                if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);

                // marcar como disponível e processar próximo da fila se existir
                this.comentarioAtivo = false;
                const next = this.filaComentarios.shift();
                if (next) {
                    // processa próximo sem bloquear
                    setTimeout(() => this.pedirComentario(next.situacao, next.tipo), 0);
                }
            }, 320);
        }, 5000);
    }
}
