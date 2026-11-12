
document.addEventListener("DOMContentLoaded", async () => {
    const lista = document.getElementById("listaProdutos");
    const pesquisa = document.getElementById("pesquisarProduto");
    const vazio = document.getElementById("nenhumProduto");
    const quantidade = document.getElementById("quantidadeResultados");
    const filtros = document.querySelectorAll("[data-filtro]");

    if (!lista) return;

    let produtos = [];

    const categoriaURL = new URLSearchParams(window.location.search).get("categoria");

    let categoriaAtual = ["decoracao", "tecido", "artesanato"].includes(categoriaURL)
        ? categoriaURL
        : "todos";

    function mostrarProdutos() {
        const texto = (pesquisa?.value || "").trim().toLowerCase();

        const encontrados = produtos.filter(produto => {
            const categoriaCorreta = categoriaAtual === "todos" ||
                produto.categoria === categoriaAtual;

            const nome = String(produto.nome || "").toLowerCase();
            const descricao = String(produto.descricao || "").toLowerCase();

            return categoriaCorreta &&
                (nome.includes(texto) || descricao.includes(texto));
        });

        lista.replaceChildren();

        encontrados.forEach(produto => {
            lista.appendChild(criarCardProduto(produto));
        });

        if (vazio) {
            vazio.hidden = encontrados.length > 0;
        }

        if (quantidade) {
            quantidade.textContent = `${encontrados.length} produto(s) encontrado(s)`;
        }

        filtros.forEach(filtro => {
            const ativo = filtro.dataset.filtro === categoriaAtual;

            filtro.classList.toggle("ativo", ativo);
            filtro.setAttribute("aria-current", ativo ? "true" : "false");
        });
    }

    pesquisa?.addEventListener("input", mostrarProdutos);

    filtros.forEach(filtro => {
        filtro.addEventListener("click", evento => {
            evento.preventDefault();

            categoriaAtual = filtro.dataset.filtro;
            mostrarProdutos();
        });
    });

    try {
        produtos = await listarProdutos();
        mostrarProdutos();

    } catch (erro) {
        console.error(erro);

        lista.textContent = "Não foi possível carregar os produtos. Confira a API do Mockfly.";

        if (vazio) vazio.hidden = true;
        if (quantidade) quantidade.textContent = "";
    }
});
