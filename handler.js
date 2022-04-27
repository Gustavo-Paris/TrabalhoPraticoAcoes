const fs = require("fs");
const { parse } = require("querystring");

const db = require("./db");

var url = require('url');
var path = require('path');
const { ObjectId } = require("bson");

var listaOperacoes = [];
var list_acoes = [];
var listaMinhasAcoes = [];
var listaDividendos = [];
var transacoes = 0;
var valorCarteira = 0;

var readFile = (file) => {
    let html = fs.readFileSync(__dirname + "/views/html/" + file, "utf8");
    return html;
};

var loadDataOperacoes = (response) => {
    list_acoes = [];
    listaOperacoes = [];
    global.connection.collection("acoes").find({}).toArray((err, docs) => {
        if (err) {
            console.log("Deu merda!");
            return;
        }

        //console.log(docs);

        docs.forEach(e => {
            list_acoes.push(e);
        });

        //console.log("list_acoes");

        global.connection.collection("operacoes").find({}).toArray((err, docs) => {
            if (err) {
                console.log("Deu merda!");
                return;
            }
            //console.log(docs);

            docs.forEach(element => {
                listaOperacoes.push(element);
            });
            let operacoes = readFile("operacoes.html");

            let listaAcoesAbertas = "";
            let strReplace = `
                    <option value="{$id}">{$idShow}</option>
                    `
            list_acoes.forEach((a) => {
                listaAcoesAbertas += strReplace
                    .replace("{$id}", a.codigo)
                    .replace("{$idShow}", a.identificacao);
            });

            let listAcoesSubstituir = "";
            let stringReplace = `
                    <tr>
                                <td>{$codigo}</td>
                                <td>{$identificacao}</td>
                                <td id="tipo">{$tipo}</td>
                                <td id="fracionaria">{$fracionaria}</td>
                                <td id="setor">{$setor}</td>
                                <td id="estilo">{$estilo}</td>
                                <td>{$valor}</td>
                                <td>{$qtde}</td>
                                <td>{$valorTotal}</td>
                            </tr>
                    `;

            listaOperacoes.forEach((a) => {
                listAcoesSubstituir += stringReplace
                    .replace("{$codigo}", a.codigo)
                    .replace("{$identificacao}", a.identificacao)
                    .replace("{$tipo}", a.tipo)
                    .replace("{$fracionaria}", a.fracionaria)
                    .replace("{$setor}", a.setor)
                    .replace("{$estilo}", a.estilo)
                    .replace("{$valor}", a.valor)
                    .replace("{$qtde}", a.quantidade)
                    .replace("{$valorTotal}", (parseFloat(a.valor) * parseFloat(a.quantidade)));
            });

            let listAcoesDisponiveis = "";
            let acoesReplace = `
                    <tr>
                                <td>{$codigo}</td>
                                <td>{$identificacao}</td>
                                <td id="tipo">{$tipo}</td>
                                <td id="fracionaria">{$fracionaria}</td>
                                <td id="setor">{$setor}</td>
                                <td>{$valor}</td>
                            </tr>
                    `;

            list_acoes.forEach((a) => {
                listAcoesDisponiveis += acoesReplace
                    .replace("{$codigo}", a.codigo)
                    .replace("{$identificacao}", a.identificacao)
                    .replace("{$tipo}", a.tipo)
                    .replace("{$fracionaria}", a.fracionaria)
                    .replace("{$setor}", a.setor)
                    .replace("{$valor}", a.valor)
            });

            operacoes = operacoes.replace("{$listaAcoesDisponiveis}", listAcoesDisponiveis);

            operacoes = operacoes.replace("{$listaAcoes}", listaAcoesAbertas);

            operacoes = operacoes.replace("{$listaTransacoes}", listAcoesSubstituir);

            response.end(operacoes);
        });

    });
};

var loadDataAcoes = (response) => {
    let listAcoes = [];
    global.connection.collection("acoes").find({}).toArray((err, docs) => {
        if (err) {
            console.log("Deu merda!");
            return;
        }

        docs.forEach(element => {
            listAcoes.push(element);
        });

        let listAcoesDisponiveis = "";
        let html_retorno = `<tr>
        <th scope="row">$acaoCodigo$</th>
        <td>$acaoIdentificacao$</td>
        <td>$acaoTipo$</td>
        <td>$acaoFracionaria$</td>
        <td>$acaoSetor$</td>
        <td>$acaoValor$</td>
        </tr>`;

        listAcoes.forEach((a) => {
            listAcoesDisponiveis += html_retorno
                .replace("$acaoCodigo$", a.codigo)
                .replace("$acaoIdentificacao$", a.identificacao)
                .replace("$acaoTipo$", a.tipo)
                .replace("$acaoFracionaria$", a.fracionaria)
                .replace("$acaoSetor$", a.setor)
                .replace("$acaoValor$", a.valor)
        });

        response.end(readFile("acoes.html").replace("{$table}", listAcoesDisponiveis));
    });
}

var loadDataCarteira = (response) => {
    listaMinhasAcoes = [];
    global.connection.collection("carteira").find({}).toArray((err, docs) => {
        if (err) {
            console.log("Deu merda!");
            return;
        }
        //console.log(docs);

        docs.forEach(element => {
            listaMinhasAcoes.push(element);
        });

        let carteira = readFile("carteira.html");

        valorCarteira = 0;

        let substituirMinhasAcoes = "";
        let strAcoesReplace = `
        <tr>
                    <td>{$codigo}</td>
                    <td>{$identificacao}</td>
                    <td id="tipo">{$tipo}</td>
                    <td id="fracionaria">{$fracionaria}</td>
                    <td id="setor">{$setor}</td>
                    <td>{$valor}</td>
                    <td>{$qtde}</td>
                    <td>{$valorTotal}</td>
                    <td>
                        <button type="button" onclick="location.href = '/acoes_vender?valor={$acaoTransacao}'" class="btn btn-danger"><i class="fas fa-edit"></i></button>
                        <button type="button" onclick="location.href = '/operacoes'" class="btn btn-success"><i class="far fa-trash-alt"></i></button>
                    </td>
                </tr>
        `;

        listaMinhasAcoes.forEach((a) => {
            substituirMinhasAcoes += strAcoesReplace
                .replace("{$codigo}", a.codigo)
                .replace("{$identificacao}", a.identificacao)
                .replace("{$tipo}", a.tipo)
                .replace("{$fracionaria}", a.fracionaria)
                .replace("{$setor}", a.setor)
                .replace("{$valor}", a.valor)
                .replace("{$qtde}", a.quantidade)
                .replace("{$valorTotal}", (parseFloat(a.valor) * parseFloat(a.quantidade)))
                .replace("{$acaoTransacao}", a.transacaoId);

            valorCarteira = valorCarteira + (parseFloat(a.valor) * parseFloat(a.quantidade));
        });

        carteira = carteira.replace("{$vlrTotal}", valorCarteira);

        carteira = carteira.replace("{$listaMinhasAcoes}", substituirMinhasAcoes);

        response.end(carteira);
    });


}

var loadDataDividendos = (response) => {
    list_acoes = [];
    listaDividendos = [];
    global.connection.collection("acoes").find({}).toArray((err, docs) => {
        if (err) {
            console.log("Deu merda!");
            return;
        }

        //console.log(docs);

        docs.forEach(e => {
            list_acoes.push(e);
        });

        //console.log("list_acoes");

        global.connection.collection("dividendos").find({}).toArray((err, docs) => {
            if (err) {
                console.log("Deu merda!");
                return;
            }
            //console.log(docs);

            docs.forEach(element => {
                listaDividendos.push(element);
            });
            let dividendos = readFile("dividendos.html");

            let listaAcoesAbertas = "";
            let strReplace = `
                    <option value="{$id}">{$idShow}</option>
                    `
            list_acoes.forEach((a) => {
                listaAcoesAbertas += strReplace
                    .replace("{$id}", a.codigo)
                    .replace("{$idShow}", a.identificacao);
            });

            let listDividendos = "";
            let dividendosReplace = `
                    <tr>
                                <td>{$codigo}</td>
                                <td>{$identificacao}</td>
                                <td>{$vlrCota}</td>
                                <td>{$dataCompra}</td>
                                <td>{$dataPgto}</td>
                            </tr>
                    `;

            listaDividendos.forEach((a) => {
                listDividendos += dividendosReplace
                    .replace("{$codigo}", a.codigo)
                    .replace("{$identificacao}", a.identificacao)
                    .replace("{$vlrCota}", a.vlrCota)
                    .replace("{$dataCompra}", a.dataCompra)
                    .replace("{$dataPgto}", a.dataPgto)
            });

            dividendos = dividendos.replace("{$listaAcoes}", listaAcoesAbertas);

            dividendos = dividendos.replace("{$listaDividendos}", listDividendos);

            response.end(dividendos);
        });

    });
}

var collectData = (rq, cal) => {
    var data = '';
    rq.on('data', (chunk) => {
        data += chunk;
    });
    rq.on('end', () => {
        let new_element = parse(data);
        cal(new_element);
    });
}

module.exports = (request, response) => {
    if (request.method === 'GET') {
        let url_parsed = url.parse(request.url, true);
        switch (url_parsed.pathname) {
            case '/':
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(readFile("index.html"));
                break;
            case '/acoes':
                response.writeHead(200, { 'Content-Type': 'text/html' });
                loadDataAcoes(response);
                //response.end(readFile("acoes.html").replace("{$table}", ''));
                break;
            case '/operacoes':
                response.writeHead(200, { 'Content-Type': 'text/html' });
                loadDataOperacoes(response);
                break;
            case '/carteira':
                response.writeHead(200, { 'Content-Type': 'text/html' });
                loadDataCarteira(response);
                break;
            case '/dividendos':
                response.writeHead(200, { 'Content-Type': 'text/html' });
                loadDataDividendos(response);
                break;
            case '/acoes_vender':
                response.writeHead(200, { "Content-Type": "text/html" });
                var str = request.url.split("valor=");
                let aux;
                for (let i = 0; i < listaMinhasAcoes.length; i++) {
                    if (listaMinhasAcoes[i].transacaoId === parseInt(decodeURI(str[1]))) {
                        aux = JSON.parse(JSON.stringify(listaMinhasAcoes[i]));
                        let query = { transacaoId: + aux.transacaoId };
                        global.connection.collection("carteira").deleteOne(query);
                    }
                }
                aux.transacaoId = transacoes;
                transacoes++;
                aux.estilo = 'V';
                aux.data = new Date();
                aux = JSON.parse(JSON.stringify(aux));
                aux._id = "";
                aux._id = new ObjectId;
                global.connection.collection("operacoes").insertOne(aux);
                response.end(readFile('index.html'));
                break;
            default:
                break;
        }
    } else if (request.method === 'POST') {
        switch (request.url.trim()) {
            case '/submitAcoes':
                collectData(request, (data) => {
                    response.writeHead(200, { 'Content-Type': 'text/html' });

                    for (let dados of list_acoes) {
                        let fracionaria = 'Não';
                        if (dados.fracionaria === 'S') {
                            fracionaria = 'Sim';
                        }
                        let tipo = 'Preferencial';
                        if (dados.tipo === 2) {
                            tipo = 'Ordinária';
                        }

                        let setor = 'Saúde';
                        if (setor.fracionaria === 1) {
                            setor = 'Comunicações';
                        } else if (setor.fracionaria === 2) {
                            setor = 'Bens Industriais';
                        } else if (setor.fracionaria === 3) {
                            setor = 'Consumo cíclico'
                        } else if (setor.fracionaria === 4) {
                            setor = 'Financeiro'
                        }
                    }
                    global.connection.collection("acoes").insertOne(data);
                    response.end(readFile("index.html"));
                });
                break;
            case "/acao_comprar":
                collectData(request, (data) => {
                    response.writeHead(200, { "Content-Type": "text/html" });
                    let aux;
                    list_acoes.forEach((a) => {
                        if (a.codigo == data.acao) {
                            aux = JSON.parse(JSON.stringify(a));
                            aux._id = new ObjectId();
                            aux.transacaoId = transacoes;
                            transacoes++;
                            aux.quantidade = data.quantidade;
                            aux.estilo = 'C'
                            aux.data = new Date();
                            global.connection.collection("carteira").insertOne(aux);
                            aux = JSON.parse(JSON.stringify(aux));
                            aux._id = "";
                            aux._id = new ObjectId();
                            global.connection.collection("operacoes").insertOne(aux);
                        }
                    })
                    response.end(readFile("index.html"));
                });
                break;
            case '/dividendos_inserir':
                collectData(request, (data) => {
                    response.writeHead(200, { "Content-Type": "text/html" });
                    let aux;
                    list_acoes.forEach((a) => {
                        if (a.codigo == data.acao) {
                            aux = JSON.parse(JSON.stringify(a));
                            aux._id = new ObjectId();
                            aux.vlrCota = data.vlrCota;
                            aux.dataCompra = data.dataCompra;
                            aux.dataPgto = data.dataPgto;
                            global.connection.collection("dividendos").insertOne(aux);
                        }
                    });
                });
                response.end(readFile("index.html"));
                break;
            default:
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.end('Not a post action!');
                break;
        }
    }
};