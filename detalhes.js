
document.addEventListener("DOMContentLoaded", async () => {
    const detalhes = document.getElementById("detalhesProduto");
    const erroPagina = document.getElementById("produtoNaoEncontrado");
    const id = new URLSearchParams(window.location.search).get("id");
    const mensagem = document.getElementById("mensagemProduto");
    const botao = document.getElementById("adicionarCarrinho");
    const quantidade = document.getElementById("quantidadeProduto");

    function preencher(idElemento, texto) {
        const elemento = document.getElementById(idElemento);

        if (elemento) {
            elemento.textContent = texto;
        }
    }

    try {
        if (!id) throw new Error("Produto não informado.");

        const produto = await buscarProduto(id);

        if (!produto) throw new Error("Produto não encontrado.");

        const imagem = document.getElementById("imagemProduto");

        if (imagem) {
            imagem.src = produto.imagem || "";
            imagem.alt = produto.nome || "Produto artesanal";
        }

        preencher("categoriaProduto", produto.categoria || "Artesanato");
        preencher("nomeProduto", produto.nome || "Produto");
        preencher("descricaoProduto", produto.descricao || "");
        preencher("precoProduto", formatarPreco(produto.preco));
        preencher("descricaoCompleta", produto.descricaoCompleta || produto.descricao || "");
        preencher("nomeCaminho", produto.nome || "Produto");

        const estoque = Math.max(0, Math.floor(Number(produto.estoque) || 0));

        preencher(
            "disponibilidadeProduto",
            estoque > 0 ? `${estoque} unidade(s) disponível(is)` : "Produto esgotado"
        );

        if (quantidade) {
            quantidade.min = 1;
            quantidade.max = estoque;
            quantidade.value = 1;
            quantidade.disabled = estoque === 0;
        }

        if (botao) botao.disabled = estoque === 0;
        if (detalhes) detalhes.hidden = false;

        const informacoes = document.getElementById("informacoesProduto");

        if (informacoes) informacoes.hidden = false;
        if (erroPagina) erroPagina.hidden = true;

        botao?.addEventListener("click", () => {
            const sucesso = adicionarAoCarrinho(produto, quantidade?.value || 1);

            if (mensagem) {
                mensagem.textContent = sucesso
                    ? "Produto adicionado ao carrinho!"
                    : "Quantidade inválida ou maior que o estoque disponível.";
            }
        });

    } catch (erro) {
        console.error(erro);

        if (detalhes) detalhes.hidden = true;

        if (erroPagina) {
            erroPagina.hidden = false;

            const paragrafo = erroPagina.querySelector("p");

            if (paragrafo) {
                paragrafo.textContent = erro.message;
            }
        }
    }
});
