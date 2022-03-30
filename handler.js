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
                    list_acoes.forEach((a) => {
                        if(a.codigo == data.acao)
                        {
                            a.quantidade = data.quantidade;
                            listaOperacoes.push(a);
                            listaMinhasAcoes.push(a);
                        }
                    })
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