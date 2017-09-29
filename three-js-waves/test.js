var scene, camera, renderer;
var plane, displacement, uniforms, geometry;
var fov = 30,
    isUserInteracting = false,
    cameraDistance = 120,
    onMouseDownMouseX = 0, onMouseDownMouseY = 0,
    lon = 0, onMouseDownLon = 0,
    lat = 0, onMouseDownLat = 0,
    phi = 0, theta = 0;

$(function() {
    init();
});

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xf5f5f5 );
  // camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 1000 );
  camera = new THREE.PerspectiveCamera( fov, 1, 1, 1000 );
  camera.position.set( 0, 0, 100 );
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize( 800, 800 );
  $('#container').append( renderer.domElement );
  addLights();

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

  geometry = new THREE.PlaneBufferGeometry( 40, 40, 200, 200);

  displacement = new Float32Array( geometry.attributes.position.count );

  geometry.addAttribute( 'displacement', new THREE.BufferAttribute( displacement, 1 ) );

  plane = new THREE.Mesh(
      geometry,
      planeShader
      // new THREE.MeshLambertMaterial({color:0x666666, wireframe:false})
  );

  // size_plane_length = plane.geometry.vertices.length;

  plane.rotation.x = -Math.PI / 2;
  plane.rotation.y = Math.PI / 6;
  plane.rotation.z = Math.PI / 4;
  scene.add( plane );

  $(document).on( 'mousedown', onMouseDown );
  $(document).on( 'mousewheel', onMouseWheel );
  $(window).on( 'resize', onWindowResize );
  animate();
}

function addLights() {
    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(100, 100, 50);
    var ambientLight = new THREE.AmbientLight( 0xffffff );
    scene.add(ambientLight, dirLight);
}

frame = 0;

function animate() {
    animateWave();
    render();
    requestAnimationFrame( animate );
}

var time = 0;

function animateWave() {

  time += .05;

  plane.geometry.attributes.displacement.needsUpdate = true;

  for ( var i = 0; i < displacement.length; i ++ ) {
        let vx = plane.geometry.attributes.position.getX(i);
        let vy = plane.geometry.attributes.position.getY(i);
				displacement[ i ] = circularWave(20, 5, vx, vy, time, .04) +
                            circularWave(20, -5, vx, vy, time, .02)
			}
}

function circularWave(x, y, vx, vy, t, f) {
  return Math.sin( f * (Math.pow((vx - x), 2) + Math.pow((vy - y), 2)) - t);
}

function render() {

  lat = Math.max( - 15, Math.min( 65, lat ) );
  phi = THREE.Math.degToRad( 90 - lat );
  // theta = THREE.Math.degToRad( lon );

  camera.position.x = cameraDistance * Math.sin( phi ) * Math.cos( theta );
  camera.position.y = cameraDistance * Math.cos( phi );
  camera.position.z = cameraDistance * Math.sin( phi ) * Math.sin( theta );

  camera.lookAt( scene.position );

  renderer.render( scene, camera );
}

function onMouseWheel(event) {

  cameraDistance += event.originalEvent.deltaY * 0.1;
  cameraDistance = Math.min( cameraDistance, camera.far );
  cameraDistance = Math.max( cameraDistance, camera.near );
}

function onMouseDown(event) {

  event.preventDefault();
  onPointerDownPointerX = event.clientX;
  onPointerDownPointerY = event.clientY;
  onPointerDownLon = lon;
  onPointerDownLat = lat;
  planeZrotation = plane.rotation.z

  $(document).on( 'mousemove', onMouseMove );
  $(document).on( 'mouseup', onMouseUp );
}

function onMouseMove(event) {
  plane.rotation.z = ( event.clientX - onPointerDownPointerX) * 0.001 + planeZrotation
  // lon = ( event.clientX - onPointerDownPointerX ) * 0.1 + onPointerDownLon;
  lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
}

function onMouseUp(event) {
  $(document).off( 'mousemove' );
  $(document).off( 'mouseup' );
}

function onWindowResize() {
  // renderer.setSize( window.innerWidth, window.innerHeight );
  // camera.projectionMatrix.makePerspective( fov, window.innerWidth / window.innerHeight, 1, 1000 );
}
