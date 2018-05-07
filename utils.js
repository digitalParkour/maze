
function intBetween1and(max) {
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
