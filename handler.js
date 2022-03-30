const fs = require("fs");
const {parse} = require("querystring");

var url = require('url');
var path = require('path');

var list_acoes = [];
var list_usuarios = [];

var readFile = (file) => {
    let html = fs.readFileSync(__dirname + "/views/html/"+ file, "utf8");
    return html;
};

var collectData = (rq, rota, cal) => {
    var data = '';
    rq.on('data', (chunk) => {
        data += chunk;
    });
    rq.on ('end', () => {
        let new_element = parse(data);
        if(rota === 'acoes'){
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
            default:
                break;
        }
      } else if (request.method === 'POST') {
        switch (request.url.trim()) {
            case '/submitAcoes':
                collectData(request,'acoes',() => {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    let html_retorno = '';
                    for (let dados of list_acoes){
                        let fracionaria = 'Não';
                        if(dados.fracionaria === 'S'){
                            fracionaria = 'Sim';
                        }
                        let tipo = 'Preferencial';
                        if(dados.tipo === 2){
                            tipo = 'Ordinária';
                        }

                        let setor = 'Saúde';
                        if(setor.fracionaria === 1){
                            setor = 'Comunicações';
                        }else if(setor.fracionaria === 2){
                            setor = 'Bens Industriais';
                        }else if(setor.fracionaria === 3){
                            setor = 'Consumo cíclico'
                        }else if(setor.fracionaria === 4){
                            setor = 'Financeiro'
                        }

                        html_retorno += `<tr>
                            <th scope="row">`+dados.codigo+`</th>
                            <td>`+dados.identificacao+`</td>
                            <td>`+tipo+`</td>
                            <td>`+fracionaria+`</td>
                            <td>`+setor+`</td>
                            <td>`+dados.valor+`</td>
                            </tr>`;
                    }
                    response.end(readFile("acoes.html").replace("{$table}", html_retorno));
                });
                break;
            case '/submitUsuarios':
                collectData(request,'usuarios',() => {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    let html_retorno = '';
                    let count = 0;
                    for (let dados of list_usuarios){
                        count++;
                        let radio = 'Não';
                        if(dados.inlineRadioOptions === 'S'){
                            radio = 'Sim';
                        }
                        html_retorno += `<tr>
                            <th scope="row">`+count+`</th>
                            <td>`+dados.codigo+`</td>
                            <td>`+dados.nome+`</td>
                            <td>`+dados.cnh+`</td>
                            <td>`+dados.dataNascimento+`</td>
                            <td>`+dados.telefone+`</td>
                            <td>`+dados.email+`</td>
                            <td>`+dados.endereco+`</td>
                            </tr>`;
                    }
                    response.end(readFile("usuarios.html").replace("{$table}", html_retorno));
                });
                break;
            default:
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end('Not a post action!');
                break;
        }
      }
};