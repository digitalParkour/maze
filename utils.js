var TOP = 1;
var RIGHT = 2;
var BOTTOM = 4;
var LEFT = 8;
var OPTIONS = [TOP, RIGHT, BOTTOM, LEFT];

var CONTROLS = new Array(4);
CONTROLS[0] = { left: 37, right: 39, up: 38, down: 40 };
CONTROLS[1] = { left: 65, right: 68, up: 87, down: 83 };
CONTROLS[2] = { left: 74, right: 76, up: 73, down: 75 };
CONTROLS[3] = { left: 100, right: 102, up: 104, down: 101 };

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

function animate(ctx, fromPoint, toPoint) {
    TWEEN.stop = true;
    var wasTweening = false;
    var curPoint;
    var lastPoint;
    if (TWEEN.i && TWEEN.points) {
        var c = TWEEN.i;
        if (c < TWEEN.points.length) {
            var curPoint = TWEEN.points[TWEEN.i];
            var lastPoint = TWEEN.points[TWEEN.points.length - 1];
            wasTweening = true;
        }        
    }
    TWEEN.i = 1;
    TWEEN.points = calcWaypoints([fromPoint, toPoint]);
    if (wasTweening) {
        TWEEN.points.unshift(lastPoint);
        TWEEN.points.unshift(curPoint);
    }
    TWEEN.ctx = ctx;

    TWEEN.stop = false;
    tween();
}

function tween() {
    if (TWEEN.stop)
        return;
    var t = TWEEN.i;
    if (t < TWEEN.points.length - 1) { requestAnimationFrame(tween); }

    if (TWEEN.stop)
        return;

    // draw a line segment from the last waypoint
    // to the current waypoint
    var ctx = TWEEN.ctx;
    var points = TWEEN.points;
    ctx.beginPath();
    ctx.moveTo(points[t - 1].x, points[t - 1].y);
    ctx.lineTo(points[t].x, points[t].y);
    ctx.stroke();
    // increment "t" to get the next waypoint
    TWEEN.i++;
}

var TWEEN = {};