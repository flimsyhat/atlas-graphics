var scene, camera, renderer;
var plane, displacement, uniforms, geometry, circle, circle2;
var fov = 30,
    isUserInteracting = false,
    cameraDistance = 80,
    onMouseDownMouseX = 0, onMouseDownMouseY = 0,
    lon = 0, onMouseDownLon = 0,
    lat = 0, onMouseDownLat = 0,
    phi = 0, theta = 0;
var A, B;

$(function() {
    init();
});

function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xf5f5f5 );

  camera = new THREE.PerspectiveCamera( fov, 1, 1, 1000 );
  camera.position.set( 0, 0, 100 );
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize( 800, 800 );
  $('#container').append( renderer.domElement );

  uniforms = {
    amplitude: { value: 1.0 },
		color:     { value: new THREE.Color( 0x00ACFC ) }
  }

  var planeShader = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent
  });

  planeShader.transparent = true;

  geometry = new THREE.PlaneBufferGeometry( 52, 52, 80, 80);

  displacement = new Float32Array( geometry.attributes.position.count );

  geometry.addAttribute( 'displacement', new THREE.BufferAttribute( displacement, 1 ) );

  plane = new THREE.Mesh(
      geometry,
      planeShader
  );
  scene.add( plane );

  var circle_geometry = new THREE.CircleBufferGeometry( 2, 32 );
  var circle_material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
  var circle_material_2 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );

  circle = new THREE.Mesh( circle_geometry, circle_material );
  circle2 = new THREE.Mesh( circle_geometry, circle_material_2 );

  scene.add( circle );
  scene.add( circle2 );

  circle.position.set(0,0,1)
  circle2.position.set(0,0,1)

  circle.material.transparent = true;
  circle2.material.transparent = true;

  var dragControls = new THREE.DragControls([circle, circle2], camera, renderer.domElement);

  $(window).on( 'resize', onWindowResize );
  animate();
}

frame = 0;

function animate() {
    animateWave();
    render();
    requestAnimationFrame( animate );
}

var time = 0;

function animateWave() {

  var $radio = $('input[name=wave]:checked');
  var updateDay = $radio.val();
  var id = $radio.attr('id');

  A = parseInt(id[0]);
  B = parseInt(id[1]);

  var freq1 = $("#freq1").val();
  var posx1 = circle.position.x;
  var posy1 = circle.position.y;
  var freq2 = $("#freq2").val();
  var posx2 = circle2.position.x;
  var posy2 = circle2.position.y;

  time += .05;

  plane.geometry.attributes.displacement.needsUpdate = true;

  for ( var i = 0; i < displacement.length; i ++ ) {
        let vx = plane.geometry.attributes.position.getX(i);
        let vy = plane.geometry.attributes.position.getY(i);
				displacement[ i ] = A * circularWave(posx1, posy1, vx, vy, time, freq1) +
                            B * circularWave(posx2, posy2, vx, vy, time, freq2)
			}

  circle.material.opacity = 0.5 + Math.sin(freq1/400 - freq1 * time)/2;
  circle2.material.opacity = 0.5 + Math.sin(freq2/400 - freq2 * time)/2;
}

function circularWave(x, y, vx, vy, t, f) {
  return Math.sin( f/400 * (Math.pow((vx - x), 2) + Math.pow((vy - y), 2)) - f * t);
}

function render() {
  renderer.render( scene, camera );
}

function onWindowResize() {
}
