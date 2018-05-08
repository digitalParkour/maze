// exceptions = bitmask to exclude connections to neighbors: 0=none, 1=top, 2=right, 4=bottom, 8=left... 15=all
function Cell(xUnit, yUnit, isStart, isEnd, exceptionsMask = 0) {
    var _self = this;

    _self.xUnit = xUnit;
    _self.yUnit = yUnit;

    _self.isStart = isStart;
    _self.isEnd = isEnd;

    _self.maxNeighbors = 4;
    _self.hasExit = 0;

    _self.exceptionsMask = exceptionsMask;
    _self.connectionsMask = 0;
    _self.connections = 0;

    _self.Spawn = _spawn;

    function init() {
        _self.Spawn();

    }
    init();
    
    // Randomly chooses neighbors
    function _spawn() {
        // Reset connections
        _self.connectionsMask = 0;
        _self.connections = 0;

        var maxMask = (1 << _self.maxNeighbors) -1;
        if (_self.exceptionsMask >= maxMask) {            
            return;
        }

        // Sort options
        var prefs = shuffle(OPTIONS);
        for (var p in prefs) {
            var pick = prefs[p];
            // skip exclusions
            if (_self.exceptionsMask & pick)
                continue;
            // add pick
            _self.connectionsMask |= pick;
            if (++_self.connections >= 3)
                break;
            if (_self.connections >= 2 && isChance(95))
                break;
        }
    }
    
}
