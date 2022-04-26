const mongoClient = require("mongodb").MongoClient;

const uri = "mongodb+srv://maiki:vQ-ZzSRCsuP2Jj4@cluster0.3vo4x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const client = mongoClient.connect(uri, {useUnifiedTopology: true }, (error, connection) => {
    if (error) {
        console.log("falha na conexão");
        return;
    }
    global.connection = connection.db("aula");
    console.log("conectou!");
});

module.exports = {}; 