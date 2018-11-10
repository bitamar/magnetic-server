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
       create(word)
    });
}
reset();

wss.on('connection', function connection(ws) {
    ws.send(JSON.stringify(magnets));
    ws.on('message', function incoming(message) {
        // Validate the incoming json.
        let data = {};
        try {
            data = JSON.parse(message);
        }
        catch (e) {
            console.log('invalid json: ' + message);
            return;
        }

        let broadcast = handleMove(data) || handleCreate(data);
        if (!broadcast) {
            console.log('invalid message: ' + message);
            return;
        }

        // Broadcast result.
        const includeCurrentClient = broadcast.includeCurrentClient;
        delete broadcast.includeCurrentClient;

        const json = JSON.stringify(broadcast);
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                if (includeCurrentClient || client !== ws) {
                    client.send(json);
                }
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


function handleMove(move) {
    if (isNaN(move.i) || isNaN(move.x) || isNaN(move.y) || isNaN(move.r)) {
        return false;
    }
    if (Object.keys(move).length !== 4) {
        return false;
    }
    if (!magnets[move.i]) {
        return false;
    }

    // Update the move on the magnet.
    const i = move.i;
    magnets[i].r = move.r;
    magnets[i].x = move.x;
    magnets[i].y = move.y;
    magnets[i].l = true;
    magnets[i].u = Date.now();
    locked.add(i);
    move.includeCurrentClient = false;
    return move;
}

function handleCreate(data) {
    if (typeof data.add !== 'string') {
        return false;
    }
    if (Object.keys(data).length !== 1) {
        return false;
    }

    let magnet = create(data.add);
    magnet.includeCurrentClient = true;
    return magnet;
}

function create(word) {
    maxId++;
    magnets[maxId] = {
        i: maxId.toString(),
        w: word,
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 1000),
        r: (Math.random() * 4) - 2,
        l: false,
        u: Date.now()
    };

    return magnets[maxId];
}
