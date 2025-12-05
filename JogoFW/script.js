//CONFIGURAÇÃO INICIAL
const tela = document.getElementsByTagName("tela")[0];
const canvas = document.createElement("canvas");
tela.appendChild(canvas);
canvas.width = tela.getAttribute("largura");
canvas.height = tela.getAttribute("altura");
const ctx = canvas.getContext('2d');

//VARIÁVEIS
let gameOver = false;
let keys = {};

//EVENTOS DE TECLADO
document.addEventListener('keydown', function (e) {
    keys[e.key] = true;
});

document.addEventListener('keyup', function (e) {
    keys[e.key] = false;
});

//FUNÇÃO DESENHAR
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Desenhar retângulos (paredes e chegada)
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

    //Desenhar arcos (player e inimigos)
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

//FUNÇÃO ATUALIZAR
function atualizar() {
    if (gameOver) return;

    //Mover inimigos
    for (const arc of document.getElementsByTagName("arco")) {
        //Pular o player
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

    //Mover player com teclado
    moverPlayer();

    //Verificar colisões
    verificarColisoes();
}

//MOVIMENTO DO PLAYER
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

    //Manter dentro da tela
    const raio = parseFloat(player.getAttribute("raio"));
    x = Math.max(raio, Math.min(x, canvas.width - raio));
    y = Math.max(raio, Math.min(y, canvas.height - raio));

    player.setAttribute("px", x);
    player.setAttribute("py", y);
}

//COLISÕES
function verificarColisoes() {
    const player = document.getElementById("player");
    if (!player) return;

    //Dados do player (círculo)
    const circleX = parseFloat(player.getAttribute("px"));
    const circleY = parseFloat(player.getAttribute("py"));
    const circleRadius = parseFloat(player.getAttribute("raio"));

    //Verificar colisão com todos os retângulos
    for (const rect of document.getElementsByTagName("retangulo")) {
        //Dados do retângulo
        const rectX = parseFloat(rect.getAttribute("px"));
        const rectY = parseFloat(rect.getAttribute("py"));
        const rectWidth = parseFloat(rect.getAttribute("largura"));
        const rectHeight = parseFloat(rect.getAttribute("altura"));
        const rectId = rect.getAttribute("id");

        //Verificar se há colisão
        const distX = Math.abs(circleX - (rectX + rectWidth / 2));
        const distY = Math.abs(circleY - (rectY + rectHeight / 2));

        if (distX <= rectWidth / 2 + circleRadius && distY <= rectHeight / 2 + circleRadius) {
            //Colisão detectada!

            //Se for a chegada (goal), finalizar jogo com vitória
            if (rectId === "goal") {
                gameOver = true;
                alert("Chegou ao objetivo!\nclique F5 para comecar de novo");
                return;
            }

            //Se for uma parede, ajustar posição
            //Ajustar posição do player baseado no lado da colisão
            if (circleY < rectY) {
                //Colisão por cima
                player.setAttribute("py", rectY - circleRadius);
            } else if (circleY > rectY + rectHeight) {
                //Colisão por baixo
                player.setAttribute("py", rectY + rectHeight + circleRadius);
            } else if (circleX < rectX) {
                //Colisão pela esquerda
                player.setAttribute("px", rectX - circleRadius);
            } else if (circleX > rectX + rectWidth) {
                //Colisão pela direita
                player.setAttribute("px", rectX + rectWidth + circleRadius);
            }

            //Ajustes finais para garantir que o player não fique preso
            if (circleX < rectX) {
                player.setAttribute("px", rectX - circleRadius);
            }
            if (circleX > rectX + rectWidth) {
                player.setAttribute("px", rectX + rectWidth + circleRadius);
            }
            if (circleY < rectY) {
                player.setAttribute("py", rectY - circleRadius);
            }
            if (circleY > rectY + rectHeight) {
                player.setAttribute("py", rectY + rectHeight + circleRadius);
            }
        }
    }

    //Verificar colisão com inimigos
    for (const arc of document.getElementsByTagName("arco")) {
        //Pular o próprio player
        if (arc.id === "player") continue;

        //Dados do inimigo
        const enemyX = parseFloat(arc.getAttribute("px"));
        const enemyY = parseFloat(arc.getAttribute("py"));
        const enemyRadius = parseFloat(arc.getAttribute("raio"));

        //Calcular distância entre centros
        const dx = circleX - enemyX;
        const dy = circleY - enemyY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        //Verificar se há colisão
        if (distance < circleRadius + enemyRadius) {
            //Colisão com inimigo - FIM DE JOGO
            gameOver = true;
            alert("Perdeu!\nClique F5 para comecar de novo");
            return;
        }
    }
}

//LOOP DO JOGO
function animar() {
    desenhar();
    atualizar();
    requestAnimationFrame(animar);
}

//INICIAR
desenhar();
animar();