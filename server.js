const WebSocket = require('ws');

const port = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: port });


let maxId = 0;
let magnets = {};

function reset() {
    maxId = 0;
    magnets = {};
    let initialWords = [
        "nothing", "just", "fine", "fish", "mine", "sloth",
        "cat", "and", "again", "or", "and", "not", "are",
        "the", "the", "surely", "kitchen", "fabric", "no",
        "not"
    ];

    initialWords.forEach(function(word) {
        maxId++;
        magnets[maxId] = {
            id: maxId.toString(),
            word: word,
            position: {
                x: Math.floor(Math.random() * 1000),
                y: Math.floor(Math.random() * 1000)
            },
            rotation: (Math.random() * 4) - 2
        };
    });
}
reset();

wss.on('connection', function connection(ws) {
    ws.send(JSON.stringify(magnets));
    ws.on('message', function incoming(data) {
        // Validate the incoming json.
        try {
            var move = JSON.parse(data);
        }
        catch (e) {
            console.log('invalid json: ' + data);
            return;
        }
        if (isNaN(move.i) || isNaN(move.x) || isNaN(move.y) || isNaN(move.r)) {
            console.log('invalid data: ' + data);
            return;
        }
        if (Object.keys(move).length !== 4) {
            console.log('too many properties: ' + data);
            return;
        }
        if (!magnets[move.i]) {
            console.log('no such id: ' + data);
            return;
        }

        // Update the move on the magnet.
        magnets[move.i].rotation = move.r;
        magnets[move.i].position.x = move.x;
        magnets[move.i].position.y = move.y;

        // Broadcast to everyone else.
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(move));
            }
        });
    });
});
