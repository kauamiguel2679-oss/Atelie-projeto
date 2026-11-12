
document.addEventListener("DOMContentLoaded", async () => {
    const lista = document.getElementById("produtosDestaque");
    const aviso = document.getElementById("destaquesVazios");

    if (!lista) return;

    try {
        const produtos = await listarProdutos();

        const destaques = produtos.filter(produto => {
            return produto.destaque === true && Number(produto.estoque) > 0;
        });

        lista.replaceChildren();

        destaques.forEach(produto => {
            lista.appendChild(criarCardProduto(produto));
        });

        if (aviso) {
            aviso.hidden = destaques.length > 0;
        }

    } catch (erro) {
        console.error(erro);

        lista.textContent = "Não foi possível carregar os destaques agora.";

        if (aviso) aviso.hidden = true;
    }
});
