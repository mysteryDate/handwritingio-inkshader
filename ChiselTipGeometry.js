// Copyright 2016 Gracious Eloise, Inc. All rights reserved.

ChiselTipGeometry = function(strokeData, degrees, lineWidth) {
    var radians = degrees * 3.14 / 180;
    var chiselTip = new THREE.Vector3(Math.sin(radians), Math.cos(radians), 0);
    chiselTip.multiplyScalar(lineWidth/2);

    var positions = [];
    var times = [];
    var lastDeltaZ;

    var v = new THREE.Vector3();
    var up = new THREE.Vector3();
    var down = new THREE.Vector3();

    for (var i = 0; i < strokeData.length-3; i += 4) {
        var x = strokeData[i];
        var y = strokeData[i+1];
        var t = strokeData[i+2];
        var deltaZ = strokeData[i+3];

        // We are "in the gap" between strokes if the pen lifted before this and
        // dropped after this, so we add degenerate triangles here:
        var inTheGap = lastDeltaZ !== undefined && lastDeltaZ > 0 && deltaZ < 0;

        if (inTheGap) {
            positions.push(positions[positions.length-3], positions[positions.length-2], positions[positions.length-1]);
            times.push(times[times.length-1]);
        }

        v.set(x, y, 0);

        up.subVectors(v, chiselTip);
        positions.push(up.x, up.y, up.z);
        times.push(t);

        if (inTheGap) {
            positions.push(positions[positions.length-3], positions[positions.length-2], positions[positions.length-1]);
            times.push(times[times.length-1]);
        }

        down.addVectors(v, chiselTip);
        positions.push(down.x, down.y, down.z);
        times.push(t);

        lastDeltaZ = deltaZ;
    }

    // Normalize time
    var maxTime = times.reduce(function(t, max) {
        if (t > max) { return t; }
        return max;
    })
    times = times.map(function(t) { return t / maxTime });
    this.maxTime = 1.0;

    THREE.BufferGeometry.call(this);
    this.type = 'ChiselTipGeometry';
    this.addAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    this.addAttribute("time", new THREE.BufferAttribute(new Float32Array(times), 1));

    this.computeBoundingBox();
    var minX = this.boundingBox.min.x,
            minY = this.boundingBox.min.y;
    this.translate(-minX, -minY, 0);

}

ChiselTipGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
ChiselTipGeometry.prototype.constructor = ChiselTipGeometry;
