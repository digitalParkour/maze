var TOP = 1;
var RIGHT = 2;
var BOTTOM = 4;
var LEFT = 8;
var OPTIONS = [TOP, RIGHT, BOTTOM, LEFT];

var CONTROLS = new Array(4);
CONTROLS[0] = { left: 37, right: 39, up: 38, down: 40, go: 190, back: 188 };
CONTROLS[1] = { left: 65, right: 68, up: 87, down: 83, go: 69, back: 81 };
CONTROLS[2] = { left: 74, right: 76, up: 73, down: 75, go: 79, back: 85 };
CONTROLS[3] = { left: 100, right: 102, up: 104, down: 101, go: 105, back: 103 };

var USERS = new Array(4);
USERS[0] = { goDir: RIGHT, nextDir: RIGHT, isMoving: false, isRewinding: false, x:0, y:0 };
USERS[1] = { goDir: RIGHT, nextDir: RIGHT, isMoving: false, isRewinding: false, x: 0, y: 0 };
USERS[2] = { goDir: RIGHT, nextDir: RIGHT, isMoving: false, isRewinding: false, x: 0, y: 0 };
USERS[3] = { goDir: RIGHT, nextDir: RIGHT, isMoving: false, isRewinding: false, x: 0, y: 0 };

var COLORS = new Array(4);
COLORS[0] = 'rgba(255,128,0,1)'; // orange
COLORS[1] = 'rgba(128,255,0,1)'; // lime
COLORS[2] = 'rgba(127,0,255,1)'; // purple
COLORS[3] = 'rgba(255,0,0,1)'; // red

function OPPOSITE(dir) {
    switch (dir) {
        case TOP: return BOTTOM;
        case BOTTOM: return TOP;
        case RIGHT: return LEFT;
        case LEFT: return RIGHT;
    }
}

function intBetween1and(max) {
    if (max <= 0)
        return 0;
    return Math.floor(Math.random() * Math.floor(max)) + 1;
}

// prob is number 0 to 100 (as the percent of being true)
function isChance(prob) {
    return Math.random() * 100 < prob;
}


function countOnesFromInteger(intMask) {
    if (intMask <= 0)
        return 0;
    var count = 0;
    for (count = 0; intMask != 0; count++ , intMask &= intMask - 1) { }
    return count;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function calcWaypoints(vertices) {
    var waypoints = [];
    for (var i = 1; i < vertices.length; i++) {
        var pt0 = vertices[i - 1];
        var pt1 = vertices[i];
        var dx = pt1.x - pt0.x;
        var dy = pt1.y - pt0.y;
        for (var j = 0; j < 10; j++) {
            var x = pt0.x + dx * j / 10;
            var y = pt0.y + dy * j / 10;
            waypoints.push({ x: x, y: y });
        }
    }
    return (waypoints);
}


// p = point (x,y)
// a = angle in radians
// o = offset
function transformPoint(p, a, o = 0) {
    return new Point(
        (p.x * Math.cos(a)) - (p.y * Math.sin(a)) + o,
        (p.x * Math.sin(a)) + (p.y * Math.cos(a)) + o
    );
}