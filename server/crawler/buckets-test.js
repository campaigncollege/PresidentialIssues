
var buckets = require('./buckets').buckets;

var setA = new buckets.Set();

setA.add(1);

console.log(setA.toArray());