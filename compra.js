
document.addEventListener("DOMContentLoaded", async () => {
    const lista = document.getElementById("listaCarrinho");
    const vazio = document.getElementById("carrinhoVazio");
    const formulario = document.getElementById("formularioCompra");
    const botao = document.getElementById("finalizarPedido");
    const endereco = document.getElementById("dadosEndereco");
    const mensagem = document.getElementById("mensagemFinalizacao");

    if (!lista) return;

    let produtos = [];
    let itensValidos = [];

    function campo(id) {
        return (document.getElementById(id)?.value || "").trim();
    }

    function atualizarEndereco() {
        const entrega = document.querySelector('input[name="recebimento"]:checked')?.value !== "retirada";

        if (endereco) {
            endereco.hidden = !entrega;

            endereco.querySelectorAll("input").forEach(input => {
                if (["cepCliente", "cidadeCliente", "ruaCliente", "numeroCliente", "bairroCliente"].includes(input.id)) {
                    input.required = entrega;
                }
            });
        }
    }

    function renderizar() {
        const carrinho = lerCarrinho();

        itensValidos = carrinho.map(item => {
            const produto = produtos.find(produto => String(produto.id) === String(item.id));

            if (!produto) return null;

            const estoque = Math.max(0, Math.floor(Number(produto.estoque) || 0));

            const quantidade = Math.min(
                Math.max(0, Math.floor(Number(item.quantidade) || 0)),
                estoque
            );

            return quantidade > 0 ? { produto, quantidade } : null;
        }).filter(Boolean);

        lista.replaceChildren();

        let total = 0;
        let unidades = 0;

        itensValidos.forEach(({ produto, quantidade }) => {
            const preco = Number(produto.preco) || 0;

            total += preco * quantidade;
            unidades += quantidade;

            const item = document.createElement("div");
            item.className = "item-carrinho";

            const imagem = document.createElement("img");
            imagem.className = "item-imagem";
            imagem.src = produto.imagem || "";
            imagem.alt = produto.nome || "Produto";

            const informacoes = document.createElement("div");
            informacoes.className = "item-informacoes";

            const nome = document.createElement("h3");
            nome.textContent = produto.nome || "Produto";

            const precoTexto = document.createElement("p");
            precoTexto.textContent = `${formatarPreco(preco)} cada`;

            informacoes.append(nome, precoTexto);

            const controles = document.createElement("div");
            controles.className = "item-controles";

            const diminuir = document.createElement("button");
            diminuir.type = "button";
            diminuir.textContent = "−";
            diminuir.setAttribute("aria-label", `Diminuir quantidade de ${produto.nome}`);

            const quantidadeTexto = document.createElement("span");
            quantidadeTexto.textContent = quantidade;

            const aumentar = document.createElement("button");
            aumentar.type = "button";
            aumentar.textContent = "+";
            aumentar.disabled = quantidade >= Number(produto.estoque);
            aumentar.setAttribute("aria-label", `Aumentar quantidade de ${produto.nome}`);

            const remover = document.createElement("button");
            remover.type = "button";
            remover.className = "remover-item";
            remover.textContent = "Remover";

            function alterar(novaQuantidade) {
                const atual = lerCarrinho().filter(item => String(item.id) !== String(produto.id));

                if (novaQuantidade > 0) {
                    atual.push({
                        id: String(produto.id),
                        quantidade: novaQuantidade
                    });
                }

                salvarCarrinho(atual);
                renderizar();
            }

            diminuir.addEventListener("click", () => alterar(quantidade - 1));
            aumentar.addEventListener("click", () => alterar(quantidade + 1));
            remover.addEventListener("click", () => alterar(0));

            controles.append(diminuir, quantidadeTexto, aumentar, remover);
            item.append(imagem, informacoes, controles);

            lista.appendChild(item);
        });

        const quantidadeElemento = document.getElementById("quantidadeItens");
        const subtotal = document.getElementById("subtotalCompra");
        const totalElemento = document.getElementById("totalCompra");
        const entrega = document.getElementById("valorEntrega");

        if (quantidadeElemento) quantidadeElemento.textContent = unidades;
        if (subtotal) subtotal.textContent = formatarPreco(total);
        if (totalElemento) totalElemento.textContent = formatarPreco(total);
        if (entrega) entrega.textContent = "A confirmar";
        if (vazio) vazio.hidden = itensValidos.length > 0;
        if (botao) botao.disabled = itensValidos.length === 0;
    }

    document.querySelectorAll('input[name="recebimento"]').forEach(input => {
        input.addEventListener("change", atualizarEndereco);
    });

    atualizarEndereco();

    try {
        produtos = await listarProdutos();
        renderizar();

    } catch (erro) {
        console.error(erro);

        lista.textContent = "Não foi possível consultar os produtos. Tente novamente mais tarde.";

        if (botao) botao.disabled = true;
    }

    formulario?.addEventListener("submit", evento => {
        evento.preventDefault();

        if (!formulario.reportValidity() || itensValidos.length === 0) return;

        const recebimento = document.querySelector('input[name="recebimento"]:checked')?.value || "entrega";
        const pagamento = document.querySelector('input[name="pagamento"]:checked')?.value || "pix";

        const linhas = [
            "Olá! Gostaria de fazer um pedido na Junt'Artes:",
            "",
            ...itensValidos.map(({ produto, quantidade }) =>
                `• ${produto.nome} (${quantidade}x) - ${formatarPreco(Number(produto.preco) * quantidade)}`
            ),
            "",
            `Subtotal: ${formatarPreco(itensValidos.reduce((soma, item) => soma + Number(item.produto.preco) * item.quantidade, 0))}`,
            "Frete: a confirmar",
            "",
            `Nome: ${campo("nomeCliente")}`,
            `Telefone: ${campo("telefoneCliente")}`,
            `E-mail: ${campo("emailCliente") || "Não informado"}`,
            `Recebimento: ${recebimento === "retirada" ? "Retirada" : "Entrega"}`
        ];

        if (recebimento === "entrega") {
            linhas.push(
                `Endereço: ${campo("ruaCliente")}, ${campo("numeroCliente")}, ${campo("bairroCliente")}, ${campo("cidadeCliente")}, CEP ${campo("cepCliente")}`
            );

            if (campo("complementoCliente")) {
                linhas.push(`Complemento: ${campo("complementoCliente")}`);
            }
        }

        linhas.push(`Pagamento pretendido: ${pagamento}`);

        if (campo("observacoesPedido")) {
            linhas.push(`Observações: ${campo("observacoesPedido")}`);
        }

        linhas.push(
            "",
            "Gostaria de confirmar disponibilidade, entrega e valor final."
        );

        const NUMERO_WHATSAPP = "558294064669";

        const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(linhas.join("\n"))}`;

        const janela = window.open(url, "_blank", "noopener,noreferrer");

        if (mensagem) {
            mensagem.hidden = false;
            mensagem.textContent = "O pedido foi preparado para o WhatsApp. Ele só será enviado quando você confirmar na conversa. O carrinho foi mantido.";
        }

        if (!janela && mensagem) {
            mensagem.textContent = "O navegador pode ter bloqueado a abertura do WhatsApp. Permita pop-ups e tente novamente.";
        }
    });
});