// 1. CONFIGURAÇÃO INICIAL (igual ao original)
const tela = document.getElementsByTagName("tela")[0];
const canvas = document.createElement("canvas");
tela.appendChild(canvas);
canvas.width = tela.getAttribute("largura");
canvas.height = tela.getAttribute("altura");
const ctx = canvas.getContext('2d');

// 2. VARIÁVEIS SIMPLES
let gameOver = false;
let keys = {};

// 3. EVENTOS DE TECLADO
document.addEventListener('keydown', function(e) {
    keys[e.key] = true;
});

document.addEventListener('keyup', function(e) {
    keys[e.key] = false;
});

// 4. FUNÇÃO DESENHAR (igual ao original)
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar retângulos (paredes e chegada)
    for (const rect of document.getElementsByTagName("retangulo")) {
        let x = parseFloat(rect.getAttribute("px"));
        let y = parseFloat(rect.getAttribute("py"));
        let largura = parseFloat(rect.getAttribute("largura"));
        let altura = parseFloat(rect.getAttribute("altura"));
        let cor = rect.getAttribute("cor");
        
        ctx.fillStyle = cor;
        ctx.fillRect(x, y, largura, altura);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x, y, largura, altura);
        
    }
    
    // Desenhar arcos (player e inimigos)
    for (const arc of document.getElementsByTagName("arco")) {
        let x = parseFloat(arc.getAttribute("px"));
        let y = parseFloat(arc.getAttribute("py"));
        let r = parseFloat(arc.getAttribute("raio"));
        let cor = arc.getAttribute("cor");
        
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = cor;
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }
}

// 5. FUNÇÃO ATUALIZAR (simplificada)
function atualizar() {
    if (gameOver) return;
    
    // Mover inimigos (igual ao original)
    for (const arc of document.getElementsByTagName("arco")) {
        // Pular o player
        if (arc.id === "player") continue;
        
        let animarV = arc.getAttribute("animarV");
        let animarH = arc.getAttribute("animarH");
        
        if (animarH) {
            let n = parseFloat(arc.getAttribute("px"));
            n = (animarH === "direita") ? n + 2 : n - 2;
            if (n > canvas.width) n = 0;
            if (n < 0) n = canvas.width;
            arc.setAttribute("px", n);
        }
        
        if (animarV) {
            let n = parseFloat(arc.getAttribute("py"));
            n = (animarV === "abaixo") ? n + 2 : n - 2;
            if (n > canvas.height) n = 0;
            if (n < 0) n = canvas.height;
            arc.setAttribute("py", n);
        }
    }
    
    // Mover player com teclado
    moverPlayer();
    
    // Verificar colisões simples
    verificarColisoes();
}

// 6. MOVIMENTO DO PLAYER (simples)
function moverPlayer() {
    const player = document.getElementById("player");
    if (!player) return;
    
    let x = parseFloat(player.getAttribute("px"));
    let y = parseFloat(player.getAttribute("py"));
    const speed = 4;
    
    if (keys['ArrowUp']) y -= speed;
    if (keys['ArrowDown']) y += speed;
    if (keys['ArrowLeft']) x -= speed;
    if (keys['ArrowRight']) x += speed;
    
    // Manter dentro da tela
    const raio = parseFloat(player.getAttribute("raio"));
    x = Math.max(raio, Math.min(x, canvas.width - raio));
    y = Math.max(raio, Math.min(y, canvas.height - raio));
    
    player.setAttribute("px", x);
    player.setAttribute("py", y);
}

// 7. COLISÕES SIMPLES
function verificarColisoes() {
    const player = document.getElementById("player");
    const goal = document.getElementById("goal");
    
    if (!player || !goal) return;
    
    const px = parseFloat(player.getAttribute("px"));
    const py = parseFloat(player.getAttribute("py"));
    const pr = parseFloat(player.getAttribute("raio"));
    
    const gx = parseFloat(goal.getAttribute("px"));
    const gy = parseFloat(goal.getAttribute("py"));
    const gw = parseFloat(goal.getAttribute("largura"));
    const gh = parseFloat(goal.getAttribute("altura"));
    
    // Verificar se chegou no objetivo
    if (px > gx && px < gx + gw && py > gy && py < gy + gh) {
        gameOver = true;
        alert("Ganhou!");
        return;
    }
    
    // Verificar colisão com paredes
    const paredes = document.getElementsByTagName("retangulo");
    for (const parede of paredes) {
        // Pular a chegada
        if (parede.id === "goal") continue;
        
        const wx = parseFloat(parede.getAttribute("px"));
        const wy = parseFloat(parede.getAttribute("py"));
        const ww = parseFloat(parede.getAttribute("largura"));
        const wh = parseFloat(parede.getAttribute("altura"));
        
        // Colisão simples retângulo-círculo
        const closestX = Math.max(wx, Math.min(px, wx + ww));
        const closestY = Math.max(wy, Math.min(py, wy + wh));
        const distance = Math.sqrt(
            Math.pow(px - closestX, 2) + Math.pow(py - closestY, 2)
        );
        
        if (distance < pr) {
            // Empurrar o player para fora da parede
            const overlap = pr - distance;
            const angle = Math.atan2(py - closestY, px - closestX);
            
            player.setAttribute("px", px + Math.cos(angle) * overlap);
            player.setAttribute("py", py + Math.sin(angle) * overlap);
        }
    }
    
    // Verificar colisão com inimigos
    const inimigos = document.getElementsByTagName("arco");
    for (const inimigo of inimigos) {
        if (inimigo.id === "player") continue;
        
        const ix = parseFloat(inimigo.getAttribute("px"));
        const iy = parseFloat(inimigo.getAttribute("py"));
        const ir = parseFloat(inimigo.getAttribute("raio"));
        
        const distancia = Math.sqrt(Math.pow(px - ix, 2) + Math.pow(py - iy, 2));
        
        if (distancia < pr + ir) {
            gameOver = true;
            alert("Voce foi pego! Pressione F5 para reiniciar");
            return;
        }
    }
}


// 8. LOOP DO JOGO (igual ao original)
function animar() {
    desenhar();
    atualizar();
    requestAnimationFrame(animar);
}

// 9. INICIAR
desenhar();
animar();