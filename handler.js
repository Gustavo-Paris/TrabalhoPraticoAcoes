const fs = require("fs");
const {parse} = require("querystring");

var url = require('url');
var path = require('path');

var list_carros = [];
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
        if(rota === 'carros'){
            list_carros.push(new_element);
        }else if(rota === 'usuarios'){
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
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(readFile("index.html"));
                break;
            case '/carros':
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(readFile("acoes.html").replace("{$table}", ''));
                break;
            case '/usuarios':
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(readFile("usuarios.html").replace("{$table}", ''));
                break;
            default:
                break;
        }
      } else if (request.method === 'POST') {
        switch (request.url.trim()) {
            case '/submitCarros':
                collectData(request,'carros',() => {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    let html_retorno = '';
                    let count = 0;
                    for (let dados of list_carros){
                        count++;
                        let radio = 'Não';
                        if(dados.inlineRadioOptions === 'S'){
                            radio = 'Sim';
                        }
                        html_retorno += `<tr>
                            <th scope="row">`+count+`</th>
                            <td>`+dados.codigo+`</td>
                            <td>`+dados.nome+`</td>
                            <td>`+dados.marca+`</td>
                            <td>`+dados.modelo+`</td>
                            <td>`+dados.preco+`</td>
                            <td>`+dados.valorLoc+`</td>
                            <td>`+radio+`</td>
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
            case '/action':
                collectData(request, (data) => {
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    console.log(data.fname);
                    response.end("Elemento: " +data.fname + " cadastrado!");
                });    
                break;
        
            default:
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.end('Not a post action!');
                break;
        }
      }
};