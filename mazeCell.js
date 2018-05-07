// exceptions = bitmask to exclude connections to neighbors: 0=none, 1=top, 2=right, 4=bottom, 8=left... 15=all
function Cell(isStart = false, isEnd = false, exceptionsMask = 0) {
    var _self = this;
    _self.isStart = isStart;
    _self.isEnd = isEnd;
    _self.maxNeighbors = 4;
    _self.exceptionsMask = exceptionsMask;

    _self.connectionsMask = 0;

    _self.Spawn = _spawn;

    // Randomly chooses neighbors
    function _spawn() {
        // Reset connections
        _self.connectionsMask = 0;

        var numExclusions = countOnesFromInteger(_self.exceptionsMask);
        if (numExclusions >= _self.maxNeighbors) {            
            return;
        }

        var options = _self.maxNeighbors - numExclusions;
        for (var i = 0; i < options; i++) {
            if(isChance(30))
                _self.connectionsMask &= (1 << i);
        }

        _self.connectionsMask ^= _self.exceptionsMask;
        if (_self.connectionsMask != 0)
            return;

        // Otherwise, Pick one random option
        var maxMask = 1 << _self.maxNeighbors;
        var optionMask = 1 << (intBetween1and(options) - 1);
        while ((optionMask & _self.exceptionsMask) != 0) {
            optionMask << 1;
            // Loop
            if (optionMask >= maxMask)
                optionMask = 1;
        }
        _self.connectionsMask = optionMask;
    }
}
