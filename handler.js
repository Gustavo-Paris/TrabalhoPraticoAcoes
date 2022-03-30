const fs = require("fs");
const {parse} = require("querystring");

var url = require('url');
var path = require('path');

var listaOperacoes = [];
var list_acoes = [];
var listaMinhasAcoes = [];

var readFile = (file) => {
    let html = fs.readFileSync(__dirname + "/views/html/" + file, "utf8");
    return html;
};

var collectData = (rq, rota, cal) => {
    var data = '';
    rq.on('data', (chunk) => {
        data += chunk;
    });
    rq.on('end', () => {
        let new_element = parse(data);
        if (rota === 'acoes') {
            list_acoes.push(new_element);
        } else if (rota === 'transacoes') {
            listaOperacoes.push(new_element);
            listaMinhasAcoes.push(new_element);
        }
        cal(new_element);
    });
}

module.exports = (request, response) => {
    if (request.method === 'GET') {
        let url_parsed = url.parse(request.url, true);
        switch (url_parsed.pathname) {
            case '/':
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(readFile("index.html"));
                break;
            case '/acoes':
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(readFile("acoes.html").replace("{$table}", ''));
                break;
            case '/operacoes':
                response.writeHead(200, {'Content-Type': 'text/html'});
                let operacoes = readFile("operacoes.html");

                let listaAcoesAbertas = "";
                let strReplace = `
                <option value="{$id}">{$idShow}</option>
                `

                list_acoes.forEach((a) => {
                    listaAcoesAbertas += strReplace
                        .replace("{$id}", a.id)
                        .replace("{$idShow}", a.id);
                });

                let listAcoesSubstituir = "";
                let stringReplace = `
                <tr>
                            <td>{$tipo}</td>
                            <td>{$id}</td>
                            <td>{$fracionario}</td>
                            <td>{$setorAtuacao}</td>
                            <td>{$valor}</td>
                            <td>{$qtde}</td>
                            <td>{$valorTotal}</td>
                        </tr>
                `;

                listaOperacoes.forEach((a) => {
                    listAcoesSubstituir += stringReplace
                        .replace("{$tipo}", a.tipo)
                        .replace("{$id}", a.tipo)
                        .replace("{$fracionario}", a.fracionario)
                        .replace("{$setorAtuacao}", a.setorAtuacao)
                        .replace("{$valor}", a.valor)
                        .replace("{$qtde}", a.qtde)
                        .replace("{$valorTotal}", (a.valor * a.qtde));
                });

                operacoes = operacoes.replace("{$listaAcoes}", listaAcoesAbertas);

                operacoes = operacoes.replace("{$listaTransacoes}", listAcoesSubstituir);

                response.end(operacoes);
                break;
            default:
                break;
        }
    } else if (request.method === 'POST') {
        switch (request.url.trim()) {
            case '/submitAcoes':
                collectData(request, 'acoes', () => {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    let html_retorno = '';
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

                        html_retorno += `<tr>
                            <th scope="row">` + dados.codigo + `</th>
                            <td>` + dados.identificacao + `</td>
                            <td>` + tipo + `</td>
                            <td>` + fracionaria + `</td>
                            <td>` + setor + `</td>
                            <td>` + dados.valor + `</td>
                            </tr>`;
                    }
                    response.end(readFile("acoes.html").replace("{$table}", html_retorno));
                });
                break;
            case "/acao_comprar":
                collectData(request, 'operacoes', (data) => {
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.end(readFile("index.html"));
                });
                break;
            default:
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end('Not a post action!');
                break;
        }
    }
};