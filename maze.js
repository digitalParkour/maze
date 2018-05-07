// size = units tall
// scale = pixel width of line
function Maze(canvas, size, scale) {
    var _self = this;
    _self.isDebug = true;
    _self.canvas = canvas;

    _self.totalUnitsY = size;
    _self.totalUnitsX = size * 2;

    _self.lineWidth = scale;
    _self.boxSize = scale * 3; // center the line
    _self.lineOffset = Math.round(_self.boxSize / 2);

    _self.Draw = _draw;
    _self.RenderBox = _renderBox;

    // init
    _self.canvas.addEventListener("mousedown", redraw, false);

// METHODS

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
                _self.RenderBox(ctx, x * _self.boxSize, y * _self.boxSize);
            }
        }
    }

// anchor coordinates are top left of box
    function _renderBox(ctx, anchorX, anchorY) {
                
        var isVertical = isChance(50);
        var isSplit = isChance(20);
        var isBent = isChance(20);
        var isAlternate = isChance(50); // is negative direction

        var isVerticalEdge = anchorX == 0 || anchorX == (_self.totalUnitsX-1) * _self.boxSize;
        var isHorizontalEdge = anchorY == 0 || anchorY == (_self.totalUnitsY-1) * _self.boxSize;
        // Corners
        if (isVerticalEdge && isHorizontalEdge) {
            isSplit = false;
            // Start and end condition
            if ((anchorX == 0 && anchorY == 0) || !(anchorX == 0 || anchorY == 0)) {
                isBent = false;
            }
            // Other corners
            else {
                isBent = true;
                isVertical = anchorY != 0;
                isAlternate = false;
            }
        }
        else if (isVerticalEdge) {
            isVertical = true;
            isAlternate = anchorX != 0;
        }
        // horizontal edges
        else if (isHorizontalEdge) {
            isVertical = false;
            isAlternate = anchorY != 0;
        }

        var fullLength = _self.boxSize;
        var halfLength = _self.lineOffset;

        ctx.beginPath();
        if (isVertical) {
            var x = anchorX + _self.lineOffset;
            var y = anchorY;
            ctx.moveTo(x, y);
            if (isSplit) {
                ctx.lineTo(x, y + fullLength);
                var center = y + _self.lineOffset;
                ctx.moveTo(x, center); // center
                ctx.lineTo((isAlternate? anchorX : anchorX + _self.boxSize), center);
            } else {
                if (isBent) {
                    ctx.lineTo(x, y + halfLength);
                    ctx.lineTo((isAlternate ? anchorX : anchorX + _self.boxSize), y + halfLength);
                } else {
                    ctx.lineTo(x, y + fullLength);
                }                
            }
            
        } else {
            var x = anchorX;
            var y = anchorY + _self.lineOffset;
            ctx.moveTo(x, y);
            if (isSplit) {
                ctx.lineTo(x + fullLength, y);
                var center = x + _self.lineOffset;
                ctx.moveTo(center, y); // center
                ctx.lineTo(center, (isAlternate ? anchorY : anchorY + _self.boxSize));
            } else {
                if (isBent) {
                    ctx.lineTo(x + halfLength, y);
                    ctx.lineTo(x + halfLength, (isAlternate ? anchorY : anchorY + _self.boxSize));
                } else {
                    ctx.lineTo(x + fullLength, y);
                }
            }
        }    

        if(_self.isDebug)
            ctx.strokeStyle = getNextColor();
        ctx.stroke();    
    };
    
    _self.ColorIndex = 0;
    _self.ColorArray = ['red', 'yellow', 'blue'];
    function getNextColor() {
        if (_self.ColorIndex >= _self.ColorArray.length)
            _self.ColorIndex = 0;
        return _self.ColorArray[_self.ColorIndex++];
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
        ctx.clearRect(anchorX, anchorY, _self.boxSize, _self.boxSize)

        ctx.lineWidth = _self.lineWidth;        
        _self.RenderBox(ctx, anchorX, anchorY );
    }
}