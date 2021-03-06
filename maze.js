// size = units tall
// scale = pixel width of line
function Maze(canvas, size, players) {
    var _self = this;
    _self.canvas = canvas;

    _self.userCanvas = [];
    _self.userPath = [];
    _self.userPos = [];
    _self.userOffset = [];
    _self.userSpeed = 5;

    _self.numPlayers = players;

    _self.totalUnitsY = 0;
    _self.totalUnitsX = 0;
    _self.circleR = 0;

    _self.lineWidth = 0;
    _self.boxSize = 0;
    _self.midOffset = 0;
    _self.userLineWidth = 0;

    _self.Draw = _draw;
    _self.RenderBox = _renderBox;
    
    _self.hasAnswer = false;
    _self.isSolved = false;

    _self.auto = true;
    _self.timer = 100;
    _self.isDebug = false;
    _self.ColorIndex = 0;
    _self.ColorArray = ['red', 'yellow', 'blue'];

    _self.Cells = [];

    // init
    function init(size) {
        _self.hasAnswer = false;
        _self.isSolved = false;
        var c = _self.canvas;

        // Calculate size
        var w = window.innerWidth - 20;
        var h = window.innerHeight - 20;
        
        // Set Canvas width and height;
        c.height = h;
        c.width = w;

        var r = Math.floor(h / size / 2);
        h -= 2*r;
        w -= 2*r;        
        _self.circleR = r;
        _self.boxSize = Math.floor(h/size);

        _self.totalUnitsY = size;
        _self.totalUnitsX = Math.floor(w/_self.boxSize);

        _self.lineWidth = Math.floor(_self.boxSize / 2);
        _self.midOffset = Math.round(_self.boxSize / 2);

        _self.userLineWidth = Math.floor(_self.lineWidth / _self.numPlayers);
        for (var u = 0; u < _self.numPlayers; u++) {
            var uOff = _self.midOffset - Math.floor(_self.lineWidth / 2) + (u * _self.userLineWidth);
            uOff += Math.floor(_self.userLineWidth / 2);
            _self.userOffset.push(uOff);
        }
        
        initCells();
        _self.Draw();

        initStart();
        initUI();

        if (_self.auto) {
            _self.buildTimer = setInterval(grow, _self.timer);
        } else
        {
            document.getElementById("start").addEventListener("mousedown", grow, false);
        }

    }
    function initStart() {

        var c = document.getElementById("start");
        c.width = _self.canvas.width;
        c.height = _self.canvas.height;
        var r = _self.circleR;

        var ctx = c.getContext("2d");
        if (_self.numPlayers == 1) {
            ctx.beginPath();
            ctx.arc(r, r, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = COLORS[0];
            ctx.fill();
            return;
        }

        // draw start circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(r, r, r, 0, 2 * Math.PI, false);
        ctx.clip();

        var d = Math.ceil(2 * r / _self.numPlayers);
        var rotate = -Math.PI * 3 / 4;
        for (var u = 0; u < _self.numPlayers; u++) {
            
            var a1 = transformPoint(new Point(-r + u * d, -r), rotate, r);
            var a2 = transformPoint(new Point(-r + u * d, r), rotate, r);
            var a3 = transformPoint(new Point(-r + (u+1) * d, r), rotate, r);
            var a4 = transformPoint(new Point(-r + (u+1) * d, -r), rotate, r);
            
            ctx.beginPath();
            ctx.moveTo(a1.x, a1.y);
            ctx.lineTo(a2.x, a2.y);
            ctx.lineTo(a3.x, a3.y);
            ctx.lineTo(a4.x, a4.y);
            ctx.closePath();
            ctx.fillStyle = COLORS[u];
            ctx.fill();
        }
        
        /*
         * restore() restores the canvas ctx to its original state
         * before we defined the clipping region
         */
        ctx.restore();
    }
    function initUI() {
        _self.userCanvas = new Array(4);
        _self.userPath = new Array(4); // list of points to draw
        _self.userPos = new Array(4);

        for (var u = 0; u < 4; u++) {
            var canvasUI = document.getElementById("user" + u);
            canvasUI.width = _self.canvas.width;
            canvasUI.height = _self.canvas.height;
            _self.userCanvas[u] = canvasUI;
            _self.userPos[u] = new Point(0, 0);
            _self.userPath[u] = [new Point(0, 0)];

            if (u < _self.numPlayers)
                drawUserPath(u);
        }
                
        document.onkeydown = function (e) {
            e = e || window.event;
            if (_self.isSolved)
                return;
            var key = e.which || e.keyCode;
            var isAction = false;
            loopUsers:
            for (var u = 0; u < _self.numPlayers; u++)
            {
                switch (key) {
                    case CONTROLS[u].left: // left
                        USERS[u].nextDir = LEFT;                        
                        if (!USERS[u].isMoving) {
                            if (USERS[u].goDir == RIGHT)
                                rewindUser(u);
                            else
                                moveUser(u);
                        }
                        isAction = true;
                        break loopUsers;

                    case CONTROLS[u].up: // up
                        USERS[u].nextDir = TOP;
                        if (!USERS[u].isMoving) {
                            if (USERS[u].goDir == BOTTOM)
                                rewindUser(u);
                            else
                                moveUser(u);
                        }isAction = true;
                        break loopUsers;

                    case CONTROLS[u].right: // right
                        USERS[u].nextDir = RIGHT;
                        if (!USERS[u].isMoving) {
                            if (USERS[u].goDir == LEFT)
                                rewindUser(u);
                            else
                                moveUser(u);
                        }
                        isAction = true;
                        break loopUsers;

                    case CONTROLS[u].down: // down
                        USERS[u].nextDir = BOTTOM;
                        if (!USERS[u].isMoving) {
                            if (USERS[u].goDir == TOP)
                                rewindUser(u);
                            else
                                moveUser(u);
                        }
                        isAction = true;
                        break loopUsers;

                    case CONTROLS[u].go: // go
                        USERS[u].isRewinding = 0;
                        USERS[u].isMoving = 1;
                        isAction = true;
                        break loopUsers;

                    case CONTROLS[u].back: // back
                        rewindUser(u);
                        isAction = true;
                        break loopUsers;
                }
            }

            if (isAction)
                e.preventDefault(); // prevent the default action (scroll / move caret)
        };

        document.onkeyup = function (e) {
            e = e || window.event;
            if (_self.isSolved)
                return;
            var key = e.which || e.keyCode;

            for (var u = 0; u < _self.numPlayers; u++) {
                if (key == CONTROLS[u].go) {
                    USERS[u].isMoving = 0;
                    e.preventDefault();
                    return;
                }
            }
        };

        tweenUI();
    }
    init(size);


    function tweenUI() {
        requestAnimationFrame(tweenUI);

        for (var u = 0; u < _self.numPlayers; u++) {
            if (USERS[u].isMoving)
                moveUser(u);
        }
    }
    
    function moveUser(uIndex) {
        var uPos = _self.userPos[uIndex];
        var uPath = _self.userPath[uIndex];
        var cell = _self.Cells[uPos.x][uPos.y];
        var r = _self.circleR;
        var playerOffset = _self.userOffset[uIndex];
        var shift = r + playerOffset;
        var c = new Point(cell.xUnit * _self.boxSize + shift, cell.yUnit * _self.boxSize + shift);
        //if (c.x == u.x && c.y == u.y)
        //    return;

        var uiCanvas = _self.userCanvas[uIndex];
        var color = COLORS[uIndex];
        var ctx = uiCanvas.getContext("2d");
        ctx.lineWidth = _self.userLineWidth;
        ctx.lineCap = "round";
        ctx.beginPath();

        var u = USERS[uIndex];
        if (u.x <= 0) {
            u.x = shift;
            u.y = shift;
        }

        ctx.moveTo(u.x, u.y);
        var s = _self.userSpeed;
        var m = _self.midOffset;
        var t = new Point(u.x, u.y); // projected target (unless we need to turn)

        // handle turn
        var isTurn = false;
        var canTurn = u.goDir != u.nextDir && OPPOSITE(u.goDir) != u.nextDir && (cell.connectionsMask & u.nextDir);

        switch (u.goDir) {
            case TOP:
                t.y -= s;
                if (canTurn && u.y >= c.y && t.y < c.y) {
                    isTurn = true;
                    s = c.y - t.y;
                } else if (t.y <= c.y - m) {
                    if (alreadyBeenHere(uIndex, uPos.x, uPos.y - 1)) {
                        t.y = c.y;
                    } else {
                        uPos.y--;
                        uPath.push(new Point(uPos.x, uPos.y));
                    }
                }                
                break;
            case BOTTOM:
                t.y += s;
                if (canTurn && u.y <= c.y && t.y > c.y) {
                    isTurn = true;
                    s = t.y - c.y;
                } else if (t.y >= c.y + m) {
                    if (alreadyBeenHere(uIndex, uPos.x, uPos.y + 1)) {
                        t.y = c.y;
                    } else {
                        uPos.y++;
                        uPath.push(new Point(uPos.x, uPos.y));
                    }
                }              
                break;
            case LEFT:
                t.x -= s;
                if (canTurn && u.x >= c.x && t.x < c.x) {
                    isTurn = true;
                    s = c.x - t.x;
                } else if (t.x <= c.x - m) {
                    if (alreadyBeenHere(uIndex, uPos.x - 1, uPos.y)) {
                        t.x = c.x;
                    } else {
                        uPos.x--;
                        uPath.push(new Point(uPos.x, uPos.y));
                    }
                }              
                break;
            case RIGHT:
                t.x += s;
                if (canTurn && u.x <= c.x && t.x > c.x) {
                    isTurn = true;
                    s = t.x - c.x;
                } else if (t.x >= c.x + m) {
                    if (alreadyBeenHere(uIndex, uPos.x + 1, uPos.y)) {
                        t.x = c.x;
                    } else {
                        uPos.x++;
                        uPath.push(new Point(uPos.x, uPos.y));
                    }
                }              
                break;
        }
        if (isTurn) {
            ctx.lineTo(c.x, c.y);
            u.goDir = u.nextDir;
            switch (u.goDir) {
                case TOP:
                    t.x = c.x;
                    t.y -= s;
                    break;
                case BOTTOM:
                    t.x = c.x;
                    t.y += s;
                    break;
                case LEFT:
                    t.x -= s;
                    t.y = c.y;
                    break;
                case RIGHT:
                    t.x += s;
                    t.y = c.y;
                    break;
            }
        } else if (!(cell.connectionsMask & u.goDir)) {
            t.x = c.x;
            t.y = c.y;
        }

        ctx.lineTo(t.x, t.y);

        if (_self.Cells[uPos.x][uPos.y].isEnd) {
            drawUserPath(uIndex);
            return;
        }

        ctx.strokeStyle = color;
        ctx.stroke();
        u.x = t.x;
        u.y = t.y;
        
    }
    function alreadyBeenHere(uIndex, xUnit, yUnit) {
        // check if path exists already
        var uPath = _self.userPath[uIndex];
        for (var point in uPath) {
            var p = uPath[point];
            if (p.x == xUnit && p.y == yUnit)
                return true;
        }
        return false;
    }

    function rewindUser(uIndex) {
        var uPos = _self.userPos[uIndex];
        var cell = _self.Cells[uPos.x][uPos.y];
        
        var uPath = _self.userPath[uIndex];
        var uPos = _self.userPos[uIndex];
        if (uPath.length <= 1)
            return;    
        
        uPath.pop();
        var unit = uPath[uPath.length - 1];
        uPos.x = unit.x;
        uPos.y = unit.y;
        var u = USERS[uIndex];
        var playerOffset = _self.userOffset[uIndex];
        var shift = _self.circleR + playerOffset;
        u.x = unit.x * _self.boxSize + shift;
        u.y = unit.y * _self.boxSize + shift;
        drawUserPath(uIndex);        
                
    }

    function drawUserPath(uIndex) {
        var uiCanvas = _self.userCanvas[uIndex];
        var color = COLORS[uIndex];
        var r = _self.circleR;
        var playerOffset = _self.userOffset[uIndex];

        var ctx = uiCanvas.getContext("2d");
        ctx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
                        
        // draw start
        ctx.beginPath();
        ctx.lineWidth = _self.userLineWidth;
        ctx.lineCap = "round";
        ctx.moveTo(r, r);

        var p;
        // draw user path
        var uPath = _self.userPath[uIndex];
        var shift = r + playerOffset;
        for (var point in uPath) {
            p = uPath[point];
            //if (_self.numPlayers != 1 && point == 0 && uIndex == 0)
            //    ctx.lineTo(p.x * _self.boxSize + shift - _self.userLineWidth, p.y * _self.boxSize + shift);
            //else
                ctx.lineTo(p.x * _self.boxSize + shift, p.y * _self.boxSize + shift);
        }
        
        if (_self.Cells[p.x][p.y].isEnd) {
            ctx.lineTo((p.x + 1) * _self.boxSize + r, (p.y + 1) * _self.boxSize + r);
            _self.isSolved = true;
        }

        ctx.strokeStyle = color;
        ctx.stroke();
        
        if (_self.isSolved) {
            // draw end circle
            ctx.beginPath();
            ctx.arc(_self.totalUnitsX * _self.boxSize + r, _self.totalUnitsY * _self.boxSize + r, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
        
// METHODS

    function initCells() {
        _self.Cells = new Array(_self.totalUnitsX);
        for (var x = 0; x < _self.totalUnitsX; x++) {
            _self.Cells[x] = new Array(_self.totalUnitsY);
            for (var y = 0; y < _self.totalUnitsY; y++) {
                var isStart = false;
                var isEnd = false;
                var exceptionsMask = 0;

                var isVerticalEdge = x == 0 || x == (_self.totalUnitsX - 1);
                var isHorizontalEdge = y == 0 || y == (_self.totalUnitsY - 1);
                // Corners
                if (isVerticalEdge && isHorizontalEdge) {
                    // Start and end condition
                    if (x == 0 && y == 0) {
                        isStart = true;
                        exceptionsMask = TOP + LEFT;
                    }
                    else if(!(x == 0 || y == 0)) {
                        isEnd = true;
                        exceptionsMask = RIGHT + BOTTOM;
                    }
                    // Other corners
                    else {
                        if (y == 0)
                            exceptionsMask = TOP + RIGHT;
                        else
                            exceptionsMask = LEFT + BOTTOM;
                    }
                }
                // vertical edges
                else if (isVerticalEdge) {

                    if (x == 0)
                        exceptionsMask = LEFT;
                    else
                        exceptionsMask = RIGHT;
                }
                // horizontal edges
                else if (isHorizontalEdge) {
                    if (y == 0)
                        exceptionsMask = TOP;
                    else
                        exceptionsMask = BOTTOM;
                }

                _self.Cells[x][y] = new Cell(x, y, isStart, isEnd, exceptionsMask);
            }
        }
    }

    function _draw() {
        var c = _self.canvas;
        var r = _self.circleR;

        // draw maze
        var ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);

        // draw start circle
        ctx.beginPath();
        ctx.arc(r, r, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'white';
        ctx.fill();

        // draw end circle
        ctx.beginPath();
        ctx.arc(_self.totalUnitsX * _self.boxSize + r, _self.totalUnitsY * _self.boxSize + r, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'white';
        ctx.fill();

        // draw maze
        ctx.lineWidth = _self.lineWidth;
        for (var x = 0; x < _self.totalUnitsX; x++) {
            for (var y = 0; y < _self.totalUnitsY; y++) {
                _self.RenderBox(
                    ctx,
                    x * _self.boxSize + _self.midOffset + r,
                    y * _self.boxSize + _self.midOffset + r,
                    _self.Cells[x][y]
                );
            }
        }
    }

// anchor coordinates are center and middle of box
    function _renderBox(ctx, anchorX, anchorY, cell)
    {
        var fudge = Math.floor(_self.lineWidth / 2);

        ctx.beginPath();
        if (cell.connectionsMask & TOP) {
            ctx.moveTo(anchorX, anchorY + fudge);
            ctx.lineTo(anchorX, anchorY - _self.midOffset);
        }
        if (cell.connectionsMask & RIGHT) {
            ctx.moveTo(anchorX - fudge, anchorY);
            ctx.lineTo(anchorX + _self.midOffset, anchorY);
        }
        if (cell.connectionsMask & BOTTOM) {
            ctx.moveTo(anchorX, anchorY - fudge);
            ctx.lineTo(anchorX, anchorY + _self.midOffset);
        }
        if (cell.connectionsMask & LEFT) {
            ctx.moveTo(anchorX + fudge, anchorY);
            ctx.lineTo(anchorX - _self.midOffset, anchorY);
        }
        if (cell.isStart) {
            ctx.moveTo(anchorX, anchorY);
            ctx.lineTo(anchorX - _self.midOffset, anchorY - _self.midOffset);
        }
        if (cell.isEnd) {
            ctx.moveTo(anchorX, anchorY);
            ctx.lineTo(anchorX + _self.midOffset, anchorY + _self.midOffset);
        }
        
        ctx.strokeStyle = _self.isDebug? getNextColor() : 'white';
        ctx.stroke();    
    };
    
    function getNextColor() {
        if (_self.ColorIndex >= _self.ColorArray.length)
            _self.ColorIndex = 0;
        return _self.ColorArray[_self.ColorIndex++];
    }

    function grow() {

        if (_self.hasAnswer) {
            finalizeMaze();
            return;
        }

        // Clear exit trails
        for (var x = 0; x < _self.totalUnitsX; x++) {
            for (var y = 0; y < _self.totalUnitsY; y++) {
                _self.Cells[x][y].hasExit = 0;
            }
        }

        var startCell = _self.Cells[0][0];
        var exitCell = _self.Cells[_self.totalUnitsX - 1][_self.totalUnitsY - 1];

        // connect exit trails
        connect(startCell, 1);
        connect(exitCell, 2);

        if (_self.hasAnswer) {
            finalizeMaze();
            return;
        }

        respawn();
    }

    function connect(cell, num) {

        if (cell.hasExit) {
            if (cell.hasExit != num)
                _self.hasAnswer = true; // TADA, SOLVED!
            return;
        }

        // connect
        cell.hasExit = num;

        if (cell.connectionsMask & TOP) {
            var guy = getNeighbor(cell, TOP);
            if (guy.connectionsMask & BOTTOM) {
                connect(guy, num);
            }
        }
        if (cell.connectionsMask & RIGHT) {
            var guy = getNeighbor(cell, RIGHT);
            if (guy.connectionsMask & LEFT) {
                connect(guy, num);
            }
        }
        if (cell.connectionsMask & BOTTOM) {
            var guy = getNeighbor(cell, BOTTOM);
            if (guy.connectionsMask & TOP) {
                connect(guy, num);
            }
        }
        if (cell.connectionsMask & LEFT) {
            var guy = getNeighbor(cell, LEFT);
            if (guy.connectionsMask & RIGHT) {
                connect(guy, num);
            }
        }
    }

    function getNeighbor(cell, dir) {
        switch (dir) {
            case TOP:    return _self.Cells[cell.xUnit][cell.yUnit-1];
            case RIGHT:  return _self.Cells[cell.xUnit+1][cell.yUnit];
            case BOTTOM: return _self.Cells[cell.xUnit][cell.yUnit+1];
            case LEFT:   return _self.Cells[cell.xUnit-1][cell.yUnit];
        }
    }

    function redraw(event) {
        var x = new Number();
        var y = new Number();

        var canvas = _self.canvas;
        
        if (event.x != undefined && event.y != undefined) {
            x = event.x;
            y = event.y;
        }
        else // Firefox method to get the position
        {
            x = event.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            y = event.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        var xUnit = Math.floor(x / _self.boxSize);
        var yUnit = Math.floor(y / _self.boxSize);
        
        var anchorX = xUnit * _self.boxSize + _self.circleR;
        var anchorY = yUnit * _self.boxSize + _self.circleR;

        var ctx = canvas.getContext("2d");
        // erase
        ctx.clearRect(anchorX, anchorY, _self.boxSize, _self.boxSize);

        ctx.lineWidth = _self.lineWidth;
        var cell = _self.Cells[xUnit][yUnit];
        cell.Spawn();
        _self.RenderBox(
            ctx,
            anchorX + _self.midOffset,
            anchorY + _self.midOffset,
            cell
        );
    }


    function respawn() {
        var c = _self.canvas;
        
        // draw maze
        var ctx = c.getContext("2d");
        ctx.lineWidth = _self.lineWidth;

        for (var x = 0; x < _self.totalUnitsX; x++) {
            for (var y = 0; y < _self.totalUnitsY; y++) {
                var cell = _self.Cells[x][y];
                if (cell.hasExit) {
                    if (cell.exceptionsMask != 0 || cell.connections > 2 )
                        continue;
                    if (isChance(90))
                        continue;
                    // Add extra leg to avoid deadlock
                    var prefs = shuffle(OPTIONS);
                    for (var p in prefs) {
                        var pick = prefs[p];
                        // skip already used
                        if (cell.connectionsMask & pick)
                            continue;
                        // skip if connection touches exit of same num
                        var guy = getNeighbor(cell, pick);
                        if (guy.hasExit == cell.hasExit) 
                            continue;                                                
                        // else, add pick to avoid deadlock
                        cell.connectionsMask |= pick;
                        cell.connections++;
                        break;
                    }
                } else if (!hasNeighborWithExit(cell)) {
                    continue; // don't respawn unnecessarily
                } else {
                    cell.Spawn();
                }

                var anchorX = x * _self.boxSize + _self.circleR;
                var anchorY = y * _self.boxSize + _self.circleR;
                ctx.clearRect(anchorX, anchorY, _self.boxSize, _self.boxSize);

                _self.RenderBox(
                    ctx,
                    anchorX + _self.midOffset,
                    anchorY + _self.midOffset,
                    _self.Cells[x][y]
                );
            }
        }
    }

    function finalizeMaze() {
        if (_self.auto)
            clearInterval(_self.buildTimer);

        // Clear open connections
        for (var x = 0; x < _self.totalUnitsX; x++) {
            for (var y = 0; y < _self.totalUnitsY; y++) {
                var cell = _self.Cells[x][y];

                if (cell.connectionsMask & TOP) {
                    var guy = getNeighbor(cell, TOP);
                    if (!(guy.connectionsMask & BOTTOM)) {
                        cell.connections--;
                        cell.connectionsMask -= TOP;
                    }
                }
                if (cell.connectionsMask & RIGHT) {
                    var guy = getNeighbor(cell, RIGHT);
                    if (!(guy.connectionsMask & LEFT)) {
                        cell.connections--;
                        cell.connectionsMask -= RIGHT;
                    }
                }
                if (cell.connectionsMask & BOTTOM) {
                    var guy = getNeighbor(cell, BOTTOM);
                    if (!(guy.connectionsMask & TOP)) {
                        cell.connections--;
                        cell.connectionsMask -= BOTTOM;
                    }
                }
                if (cell.connectionsMask & LEFT) {
                    var guy = getNeighbor(cell, LEFT);
                    if (!(guy.connectionsMask & RIGHT)) {
                        cell.connections--;
                        cell.connectionsMask -= LEFT;
                    }
                }
            }
        }

        // Connect islands (randomly)
        var totalCells = _self.totalUnitsX * _self.totalUnitsY;
        var safety = 20;
        while ( (connectIslands() < totalCells) || (safety-- <0)) { }

        _self.Draw();
    }

    function connectIslands() {
        var countConnected = 0;

        var xs = [];
        var ys = [];
        for (var x = 0; x < _self.totalUnitsX; x++)
            xs.push(x);
        for (var y = 0; y < _self.totalUnitsY; y++)
            ys.push(y);

        shuffle(xs);
        shuffle(ys);

        for (var xi in xs) {
            for (var yi in ys) {
                var x = xs[xi];
                var y = ys[yi];
                var cell = _self.Cells[x][y];
                if (cell.hasExit) {
                    countConnected++;
                    continue;
                }
                // this cell lives in an island
                var fullMask = (1 << cell.maxNeighbors) - 1; // one for each neighbor
                var open = fullMask ^ (cell.exceptionsMask | cell.connectionsMask); // extract zeros
                if (open == 0) {
                    countConnected++;
                    continue;
                }
                // find a neighbor that is an exit
                var dirs = shuffle(OPTIONS);
                for (var d in dirs) {
                    var dir = dirs[d];
                    if (open & dir) {
                        var guy = getNeighbor(cell, dir);
                        if (guy.hasExit) {
                            // extend to any in this island
                            connect(cell, guy.hasExit);
                            // force connection
                            guy.connections++;
                            guy.connectionsMask |= OPPOSITE(dir);
                            cell.connections++;
                            cell.connectionsMask |= dir;
                            countConnected++
                            break;
                        }
                    }
                }
            }
        }
        return countConnected;
    }
    function hasNeighborWithExit(cell) {
        for (var d in OPTIONS) {
            var dir = OPTIONS[d];
            if (cell.exceptionsMask & dir)
                continue;
            var guy = getNeighbor(cell, dir);
            if (guy.hasExit) {
                return true;
            }            
        }
        return false;
    }
}