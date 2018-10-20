const WebSocket = require('ws');

const port = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: port });


let maxId = 0;
let magnets = {};
let locked = new Set();

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
            i: maxId.toString(),
            w: word,
            x: Math.floor(Math.random() * 1000),
            y: Math.floor(Math.random() * 1000),
            r: (Math.random() * 4) - 2,
            l: false,
            u: 0
        };
    });
}
reset();

wss.on('connection', function connection(ws) {
    ws.send(JSON.stringify(magnets));
    ws.on('message', function incoming(data) {
        // Validate the incoming json.
        let move = {};
        try {
            move = JSON.parse(data);
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
        const i = move.i;
        magnets[i].r = move.r;
        magnets[i].x = move.x;
        magnets[i].y = move.y;
        magnets[i].l = true;
        magnets[i].u = Date.now();
        locked.add(i);

        // Broadcast to everyone else.
        const json = JSON.stringify(move);
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(json);
            }
        });
    });
});

// Unlock magnets.
const lockTime = 1000;
setInterval(function() {
    const now = Date.now();
    locked.forEach(function (i) {
        if (now - magnets[i].u < lockTime) {
            return;
        }
        // The lock is older than lockTime.
        magnets[i].l = false;
        locked.delete(i);
        // Send unlock message to all.
        const json = JSON.stringify({unlock: i});
        wss.clients.forEach(function each(client) {
            client.send(json);
        });
    });
}, lockTime);
