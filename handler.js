const fs = require("fs");
const { parse } = require("querystring");

var url = require('url');
var path = require('path');

var listaOperacoes = [];
var list_acoes = [];


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
        if (rota === 'carros') {
            list_carros.push(new_element);
        } else if (rota === 'usuarios') {
            list_usuarios.push(new_element);
        }
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
            case '/operacoes':
                response.writeHead(200, { 'Content-Type': 'text/html' });
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
                        .replace("{$valorTotal}", a.valorTotal);
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
            case "/acao_comprar":
                collectData(request, (data) => {
                    response.writeHead(200, { "Content-Type": "text/html" });
                    listOperacoes.push(data);
                    response.end(readFile("index.html"));
                });
                break;

            case '/action':
                collectData(request, (data) => {
                    response.writeHead(200, { 'Content-Type': 'text/plain' });
                    console.log(data.fname);
                    response.end("Elemento: " + data.fname + " cadastrado!");
                });
                break;

            default:
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.end('Not a post action!');
                break;
        }
    }
};