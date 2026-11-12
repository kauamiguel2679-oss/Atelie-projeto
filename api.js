
const URL_API = "https://api.mockfly.dev/mocks/a79de624-9bd7-4550-9858-cf20b0b9c75e";
const CHAVE_CARRINHO = "juntartes_carrinho";

async function listarProdutos() {
    const resposta = await fetch(`${URL_API}/produtos`, {
        cache: "no-store"
    });

    if (!resposta.ok) {
        throw new Error("Não foi possível carregar os produtos.");
    }

    const dados = await resposta.json();
    const produtos = Array.isArray(dados) ? dados : dados.produtos;

    if (!Array.isArray(produtos)) {
        throw new Error("O JSON deve conter uma lista de produtos.");
    }

    return produtos;
}

async function buscarProduto(id) {
    const produtos = await listarProdutos();

    return produtos.find(produto => String(produto.id) === String(id));
}

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function lerCarrinho() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    atualizarContadorCarrinho();
}

function adicionarAoCarrinho(produto, quantidade) {
    const estoque = Math.max(0, Math.floor(Number(produto.estoque) || 0));
    const quantidadeNova = Math.floor(Number(quantidade));

    if (!Number.isFinite(quantidadeNova) || quantidadeNova < 1 || estoque < 1) {
        return false;
    }

    const carrinho = lerCarrinho();
    const item = carrinho.find(item => String(item.id) === String(produto.id));
    const quantidadeAtual = item ? Number(item.quantidade) || 0 : 0;

    if (quantidadeAtual + quantidadeNova > estoque) {
        return false;
    }

    if (item) {
        item.quantidade = quantidadeAtual + quantidadeNova;
    } else {
        carrinho.push({
            id: String(produto.id),
            quantidade: quantidadeNova
        });
    }

    salvarCarrinho(carrinho);
    return true;
}

function atualizarContadorCarrinho() {
    const contador = document.getElementById("contadorCarrinho");

    if (!contador) return;

    const quantidade = lerCarrinho().reduce((total, item) => {
        return total + (Number(item.quantidade) || 0);
    }, 0);

    contador.textContent = quantidade;
    contador.hidden = quantidade === 0;
}

function criarCardProduto(produto) {
    const card = document.createElement("a");

    card.href = `detalhes.html?id=${encodeURIComponent(produto.id)}`;
    card.className = "card-produto";

    const imagem = document.createElement("img");
    imagem.src = produto.imagem || "";
    imagem.alt = produto.nome || "Produto artesanal";
    imagem.loading = "lazy";

    const nome = document.createElement("h3");
    nome.textContent = produto.nome || "Produto sem nome";

    const descricao = document.createElement("p");
    descricao.textContent = produto.descricao || "";

    const preco = document.createElement("strong");
    preco.textContent = formatarPreco(produto.preco);

    card.append(imagem, nome, descricao, preco);

    return card;
}

document.addEventListener("DOMContentLoaded", atualizarContadorCarrinho);
