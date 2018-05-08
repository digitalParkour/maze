// size = units tall
// scale = pixel width of line
function Maze(canvas, size) {
    var _self = this;
    _self.canvas = canvas;
    _self.ui = document.getElementById("user");

    _self.totalUnitsY = 0;
    _self.totalUnitsX = 0;

    _self.lineWidth = 0;
    _self.boxSize = 0;
    _self.midOffset = 0;

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
        // Calculate size
        var w = window.innerWidth-20;
        var h = window.innerHeight-20;

        _self.boxSize = Math.floor(h/size);

        _self.totalUnitsY = size;
        _self.totalUnitsX = Math.floor(w/_self.boxSize);

        _self.lineWidth = Math.floor(_self.boxSize / 2);
        _self.midOffset = Math.round(_self.boxSize / 2);
                
        initCells();
        _self.Draw();

        if (_self.auto) {
            _self.buildTimer = setInterval(grow, _self.timer);
        } else
        {
            _self.ui.addEventListener("mousedown", grow, false);
        }

        initUI();
    }
    function initUI() {

        _self.ui.width = _self.canvas.width;
        _self.ui.height = _self.canvas.height;
        _self.userPath = [new Point(0,0)]; // list of points to draw
        _self.userX = 0;
        _self.userY = 0;
        
        drawUserPath();

        document.onkeydown = function (e) {
            e = e || window.event;
            if (_self.isSolved)
                return;
            var cell = _self.Cells[_self.userX][_self.userY];
            switch (e.which || e.keyCode) {
                case 37: // left
                    moveUI(cell, LEFT);
                    break;

                case 38: // up
                    moveUI(cell, TOP);
                    break;

                case 39: // right
                    moveUI(cell, RIGHT);
                    break;

                case 40: // down
                    moveUI(cell, BOTTOM);
                    break;

                default: return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        };
    }
    init(size);

    function moveUI(cell, dir) {
        if (!(cell.connectionsMask & dir))
            return;

        var guy = getNeighbor(cell, dir);
        if (!(guy.connectionsMask & OPPOSITE(dir)))
            return;

        var nextX = cell.xUnit;
        var nextY = cell.yUnit;

        switch (dir) {
            case TOP: nextY--; break;
            case BOTTOM: nextY++; break;
            case LEFT: nextX--; break;
            case RIGHT: nextX++; break;
        }

        // Check for undo
        if (_self.userPath.length > 1)
        {
            var lastPoint = _self.userPath[_self.userPath.length - 2];
            if (lastPoint.x == nextX && lastPoint.y == nextY)
            {
                _self.userPath.pop();
                _self.userX = nextX;
                _self.userY = nextY;
                drawUserPath();
                return;
            }
        }

        // check if path exists already
        for (var point in _self.userPath)
        {
            var p = _self.userPath[point];
            if (p.x == nextX && p.y == nextY)
                return;
        }

        var nextPoint = new Point(nextX, nextY);

        if (nextX != _self.totalUnitsX-1 || nextY != _self.totalUnitsY-1) {
            var ctx = _self.ui.getContext("2d");
            ctx.lineWidth = _self.lineWidth;
            ctx.lineCap = "round";
            animate(ctx, new Point(_self.userX * _self.boxSize + _self.midOffset, _self.userY * _self.boxSize + _self.midOffset), new Point(nextX * _self.boxSize + _self.midOffset, nextY * _self.boxSize + _self.midOffset));

            _self.userX = nextX;
            _self.userY = nextY;
            _self.userPath.push(nextPoint);
        } else {

            _self.userX = nextX;
            _self.userY = nextY;
            _self.userPath.push(nextPoint);
            drawUserPath();
        }
    }

    function drawUserPath() {

        var ctx = _self.ui.getContext("2d");
        ctx.clearRect(0, 0, _self.ui.width, _self.ui.height);
        ctx.beginPath();
        // draw start
        ctx.lineWidth = _self.lineWidth;
        ctx.lineCap = "round";
        ctx.moveTo(0, 0);

        var p;
        // draw user path
        for (var point in _self.userPath) {
            p = _self.userPath[point];
            ctx.lineTo(p.x * _self.boxSize + _self.midOffset, p.y * _self.boxSize + _self.midOffset);
        }
        
        if (_self.Cells[p.x][p.y].isEnd) {
            ctx.lineTo((p.x + 1) * _self.boxSize, (p.y + 1) * _self.boxSize);
            _self.isSolved = true;
        }

        ctx.strokeStyle = 'orange';
        ctx.stroke();
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

        var mazeHeight = _self.totalUnitsY * _self.boxSize;
        var mazeWidth = _self.totalUnitsX * _self.boxSize;

        // Set Canvas width and height;
        c.height = mazeHeight;
        c.width = mazeWidth;

        // draw maze
        var ctx = c.getContext("2d");
        ctx.lineWidth = _self.lineWidth;

        for (var x = 0; x < _self.totalUnitsX; x++) {
            for (var y = 0; y < _self.totalUnitsY; y++) {
                _self.RenderBox(
                    ctx,
                    x * _self.boxSize + _self.midOffset,
                    y * _self.boxSize + _self.midOffset,
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
        
        var anchorX = xUnit * _self.boxSize;
        var anchorY = yUnit * _self.boxSize;

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

                var anchorX = x * _self.boxSize;
                var anchorY = y * _self.boxSize;
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