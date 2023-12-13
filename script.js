window.addEventListener("load", () => {
    if(localStorage.alertas) {
        JSON.parse(localStorage.alertas)
            .forEach(alarme => {
                Object.keys(alarme).forEach(chv => {
                    if(chv == "inicio" || chv == "data") {
                        alarme[chv] = new Date(alarme[chv]);
                    } else if(chv != "tipo" && chv != "codigo") {
                        alarme[chv] = Number(alarme[chv]);
                    }
                    
                });
                alertas.push(alarme);
            });
    }

    const frm = document.getElementById("frmEdicao");
    modalForm = document.getElementById("modalForm");
    modalForm.addEventListener("hidden.bs.modal", () => {
        document.getElementById("tituloModalForm").innerHTML = "Novo";
        document.getElementById("txtCodigo").removeAttribute("old");
        frm.reset();
    });
    modalForm.addEventListener("shown.bs.modal", () => {
        document.getElementById("txtCodigo").focus();
    });

    document.getElementById("txtCodigo").addEventListener("keyup", function() {
        this.value = this.value.toUpperCase();
    });

    document.getElementById("txtCotacaoInicial").addEventListener("keyup", function() {
        this.value = formataNumero(this.value);
    });
    
    document.getElementById("txtQuantidade").addEventListener("keyup", function() {
        this.value = formataNumero(this.value, 5);
    });
    
    document.getElementById("txtAlarme").addEventListener("keyup", function() {
        this.value = formataNumero(this.value);
    });

    setInterval(preencheAlertas, 2000);
    setInterval(coletaCotacao, 5000);
});

let alertas = [];

const preencheAlertas = () => {
    const table = document.querySelector("table tbody");
    for(let r = table.childNodes.length - 1; r >= 0; r--) {
        table.removeChild(table.childNodes[r]);
    }

    const tooltip = document.querySelectorAll("div.tooltip");
    for(let r = tooltip.length - 1; r >= 0; r--) {
        document.body.removeChild(tooltip[r]);
    }

    alertas.forEach(al => insereLinha(table, al));
};

const insereLinha = (table, alerta) => {
    let aux;
    const linha = document.createElement("tr");
    linha.appendChild(criaColuna(alerta.inicio.toLocaleDateString("pt-BR") + " " + alerta.inicio.toLocaleTimeString("pt-BR")));
    linha.appendChild(criaColuna(alerta.tipo, "c"));
    linha.appendChild(criaColuna(alerta.codigo, "c"));
    linha.appendChild(criaColuna(alerta.data.toLocaleDateString("pt-BR") + " " + alerta.data.toLocaleTimeString("pt-BR"), "c"));
    ["cotacaoInicial", "cotacao", "alarme", "quantidade", "valor", "diferenca" ]
        .forEach(chave => {
            aux = formataNumero(alerta[chave].toFixed(2));
            if(aux == "0,00" && alerta[chave] != 0) {
                aux = alerta[chave].toExponential();
            }
            linha.appendChild(criaColuna(aux, "e"));
        });
    linha.appendChild(criaColunaBotoes(alerta.codigo));

    if(alerta.avio) {
        linha.classList.add("table-warning");
    } else if(alerta.alarmado) {
        linha.classList.add("table-danger");
    }
    
    table.appendChild(linha);
};

const criaColuna = (texto, pos, classeAdicional) => {
    const retorno = document.createElement("td");
    retorno.innerHTML = texto;

    if(pos) {
        switch(pos) {
            case "i":
                retorno.classList.add("text-start");
                break;
            case "c":
                retorno.classList.add("text-center");
                break;
            case "e":
                retorno.classList.add("text-end");
                break;
        }
    }

    if(classeAdicional) {
        retorno.classList.add(classeAdicional);
    }
    return(retorno);
};

const criaColunaBotoes = (papel) => {
    const retorno = document.createElement("td");
    let btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm editar";
    btn.value = papel;
    btn.setAttribute("aria-label", `Edita o papel ${papel}`);
    btn.setAttribute("data-bs-placement", "left");
    btn.setAttribute("data-bs-toggle", "modal");
    btn.setAttribute("data-bs-target", "#modalForm");
    btn.setAttribute("data-bs-title", `Edita o papel ${papel}`);
    btn.innerHTML = "<i class='bi bi-pencil-square'></i>";
    retorno.appendChild(btn);
    ativaBotoes(btn);

    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm excluir";
    btn.value = papel;
    btn.setAttribute("aria-label", `Exclui o papel  ${papel}`);
    btn.setAttribute("data-bs-placement", "bottom");
    btn.setAttribute("data-bs-title", `Exclui o papel  ${papel}`);
    btn.innerHTML = "<i class='bi bi-trash3'></i>";
    retorno.appendChild(btn);
    ativaBotoes(btn);

    retorno.classList.add("text-center");

    return(retorno);
};

const formataNumero = (numero, dec) => {
    let sinal = numero.startsWith("-");
    if(numero.indexOf("e-") > -1) {
        numero = Number(numero).toFixed(numero.substring(numero.length - 1));
    } else {
        let obj1 = /(\d{1,2})$/;
        let obj2 = /(\d)(?=(\d{3})+(?!\d))/g;
        if(dec) {
            switch(dec) {
                case 1:
                    obj1 = /(\d{1,1})$/;
                    obj2 = /(\d)(?=(\d{1})+(?!\d))/g;
                    break
                case 2:
                    obj1 = /(\d{1,2})$/;
                    obj2 = /(\d)(?=(\d{2})+(?!\d))/g;
                    break
                case 3:
                    obj1 = /(\d{1,3})$/;
                    obj2 = /(\d)(?=(\d{3})+(?!\d))/g;
                    break
                case 4:
                    obj1 = /(\d{1,4})$/;
                    obj2 = /(\d)(?=(\d{4})+(?!\d))/g;
                    break
                case 5:
                    obj1 = /(\d{1,5})$/;
                    obj2 = /(\d)(?=(\d{5})+(?!\d))/g;
                    break
                case 6:
                    obj1 = /(\d{1,6})$/;
                    obj2 = /(\d)(?=(\d{6})+(?!\d))/g;
                    break
                case 7:
                    obj1 = /(\d{1,7})$/;
                    obj2 = /(\d)(?=(\d{7})+(?!\d))/g;
                    break
            }
        }
        numero = numero
            .replace(/\D/g, '')
            .replace(obj1, ',$1')
            .replace(obj2, '$1.');
        numero = (sinal ? "-" : "") + numero;
        return(numero);
    }
}

const coletaCotacao = async () => {
    alertas.forEach(alerta => {
        if(alerta.tipo == "Moeda") {
            binance(alerta.codigo)
                .then((tick) => {
                    alerta.cotacao = Number(tick.price);
                    alerta.data = new Date();
                    alerta.valor = alerta.quantidade * alerta.cotacao;
                    alerta.diferenca = alerta.valor - alerta.quantidade * alerta.cotacaoInicial;
                    alerta.aviso = (alerta.cotacao > (alerta.alarme * 0.99) && alerta.cotacao < (alerta.alarme * 1.01));
                    alerta.alarmado = (alerta.cotacao > (alerta.alarme * 0.999) && alerta.cotacao < (alerta.alarme * 1.001));
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            let hora = (new Date()).getHours("pt-BR");
            if(hora > 10 && hora < 19) {
                yahooFinance(alerta.codigo, alerta.tipo)
                    .then((tick) => {
                        alerta.cotacao = Number(tick.last);
                        alerta.data = new Date();
                        alerta.valor = alerta.quantidade * alerta.cotacao;
                        alerta.diferenca = alerta.valor - alerta.quantidade * alerta.cotacaoInicial;
                        alerta.aviso = (alerta.cotacao > (alerta.alarme * 0.99) && alerta.cotacao < (alerta.alarme * 1.01));
                        alerta.alarmado = (alerta.cotacao > (alerta.alarme * 0.999) && alerta.cotacao < (alerta.alarme * 1.001));
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }
    });
};

const binance = (papel) => {
    return(
        new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if(this.status == 200) {
                        let resp = xhttp.responseText;
                        if(resp) {
                            resolve(JSON.parse(resp));
                        } else {
                            reject("Erro ao listar os estados");
                        }
                    } else {
                        reject("Erro ao listar os estados");
                    }
                }
            };

            xhttp.open("GET", `https://api.binance.com/api/v3/ticker/price?symbol=${papel}BRL`, true);
            xhttp.send();
        })
    );
};

const yahooFinance = (papel, tipo) => {
    return(
        new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if(this.status == 200) {
                        let resp = xhttp.responseText;
                        
                        if(resp) {
                            let registro = resp.split("\n");
                            if(registro.length) {
                                let tick = registro[1].split(",");
                                resolve({
                                    data: new Date(tick[0]),
                                    last: Number(tick[4]),
                                    abertura: Number(tick[1]),
                                    alta: Number(tick[2]),
                                    baixa: Number(tick[3]),
                                    fechamento: Number(tick[5])
                                });
                            }
                        } else {
                            reject("Erro ao listar os estados");
                        }
                        resolve();
                    } else {
                        reject("Erro ao listar os estados");
                    }
                }
            };

            xhttp.open("GET", `https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v7/finance/download/${papel}${(tipo == "Stock" || tipo == "REIT" ? "" : ".sa")}`, false);
            xhttp.send();
        })
    );
};

const adicionaAlarme = () => {
    let alerta;
    let txt = document.getElementById("txtCodigo");
    if(txt.getAttribute("old")) {
        alerta = alertas.find(it => it.codigo == txt.getAttribute("old"));
        alerta.tipo= document.getElementById("dropTipo").value;
        alerta.codigo= document.getElementById("txtCodigo").value;
        alerta.cotacaoInicial= Number(document.getElementById("txtCotacaoInicial").value.replace(".", "").replace(",", "."));
        alerta.alarme = Number(document.getElementById("txtAlarme").value.replace(".", "").replace(",", "."));
        alerta.quantidade = Number(document.getElementById("txtQuantidade").value.replace(".", "").replace(",", "."));
    } else {
        alertas.push(alerta = {
            inicio: new Date(),
            tipo: document.getElementById("dropTipo").value,
            codigo: document.getElementById("txtCodigo").value,
            cotacaoInicial: Number(document.getElementById("txtCotacaoInicial").value.replace(".", "").replace(",", ".")),
            data: new Date(),
            cotacao: Number(document.getElementById("txtCotacaoInicial").value.replace(".", "").replace(",", ".")),
            alarme: Number(document.getElementById("txtAlarme").value.replace(".", "").replace(",", ".")),
            quantidade: Number(document.getElementById("txtQuantidade").value.replace(".", "").replace(",", ".")),
            valor: 0,
            diferenca: 0
        });
    }

    alerta.valor = alerta.quantidade * alerta.cotacao;
    alerta.diferenca =  alerta.valor - alerta.quantidade * alerta.cotacaoInicial;

    salvaAlertas();
    document.getElementById("btnFechar").click();
};

const ativaBotoes = (btn) =>{
    if(btn.classList.contains("editar")) {
        btn.addEventListener("click", (ev) => {
            let obj = ev.target;
            if(obj.tagName == "I") {
                obj = obj.parentNode;
            }

            let papel = obj.value;
            preencheFormulario(papel);
        });
    } else {
        btn.addEventListener("click", (ev) => {
            let obj = ev.target;
            if(obj.tagName == "I") {
                obj = obj.parentNode;
            }

            let papel = obj.value;
            exclui(papel);
        });
    }
    bootstrap.Tooltip.getOrCreateInstance(btn);
};

const preencheFormulario = (papel) => {
    alerta = alertas.find(it => it.codigo == papel);
    document.getElementById("dropTipo").value = alerta.tipo;
    document.getElementById("txtCodigo").value = alerta.codigo;
    document.getElementById("txtCodigo").setAttribute("old", alerta.codigo);
    [["txtCotacaoInicial", "cotacaoInicial"], ["txtAlarme", "alarme"], ["txtQuantidade", "quantidade"] ]
        .forEach(chave => {
            aux = formataNumero(alerta[chave[1]].toFixed(2));
            if(aux == "0,00" && alerta[chave[1]] != 0) {
                aux = alerta[chave[1]].toString();
                document.getElementById(chave[0]).value = alerta[chave[1]].toFixed(aux.length - 1 - aux.indexOf(".")).replace(".", ",");
            } else {
                document.getElementById(chave[0]).value = alerta[chave[1]].toFixed(2).replace(".", ",");
            }
        });
    
//    document.getElementById("txtAlarme").value = alerta.alarme.toFixed(2).replace(".", ",");
//    document.getElementById("txtQuantidade").value = alerta.quantidade.toFixed(5).replace(".", ",");
    document.getElementById("tituloModalForm").innerHTML = `Editar ${alerta.codigo}`;
};

const exclui = (papel) => {
    if(window.confirm(`Deseja apagar o papel ${papel}?`)) {
        let pos = alertas.findIndex(it => it.codigo == papel);
        alertas.splice(pos, 1);
        salvaAlertas();
    }
};

const salvaAlertas = () => {
    alertas.sort((a,b) => a.tipo.substring(0,1) + a.codigo.substring(0,1) > b.tipo.substring(0, 1) + b.codigo.substring(0,1) ? 1 : -1);
    localStorage.setItem("alertas", JSON.stringify(alertas));
};