// Copyright 2016 Gracious Eloise, Inc. All rights reserved.

ChiselTipMesh = function(options) {
  var strokeData = options.strokeData;
  var degrees = options.degrees;
  var lineWidth = options.lineWidth;
  var color = options.color;

  var duration = 0.5; // seconds for the entire animation

  var geometry = new ChiselTipGeometry(strokeData, degrees, lineWidth);

  var material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: color },
      speed: { value: 2.0 }, // animation speed factor (1.0 will show at the same speed as capture)
      clock: { value: 0.0 },
    },
    vertexShader: `
      attribute float time;
      uniform float speed;
      uniform float clock;
      varying float age;
      void main() {
        age = clock * speed - time;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 color;
      varying float age;
      void main() {
        gl_FragColor = vec4(color, 0.0);
        if (age > 0.0) {
          gl_FragColor.a = 1.0;
        }
      }`,
    side: THREE.DoubleSide,
    transparent: true,
  });

  THREE.Mesh.call(this, geometry, material);
  this.drawMode = THREE.TriangleStripDrawMode;

  material.uniforms.speed.value = geometry.maxTime / duration;

  var startTimeSeconds;
  var update = function(payload) {
    var timeSeconds = Date.now()/1000;
    material.uniforms.clock.value = timeSeconds - startTimeSeconds;
    if (material.uniforms.clock.value < duration) {
      requestAnimationFrame(update);
    }
  }
  this.start = function() {
    startTimeSeconds = Date.now()/1000;
    requestAnimationFrame(update);
  }
  // Report how long this animation should run. This might need to be richer
  // data, such as some indication that an animation does something
  // significant for 1 second, then loops forever.
  this.getLifetime = function() {
    return duration;
  }
}

ChiselTipMesh.prototype = Object.create(THREE.Mesh.prototype);
