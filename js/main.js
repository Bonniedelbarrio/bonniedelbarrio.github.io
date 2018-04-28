var scene, camera, renderer, composer;

var fov, aspect, near, far;

var skull, skullMesh, meshLoaded, meshLoaded2;

var icoMesh;

var data, analyser;

var clock;

var controls;

var effectController = {
		particleCount: 100
	};

if (Detector.webgl) {
    init();
    animate();
} else {
    var warning = Detector.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}

function initGUI() {
	var gui = new dat.GUI();

	gui.add( effectController, "particleCount" ).min(100).max(1215792).step(1).onChange( function( value ) {

				});
}

function init() {
	//initGUI();

	// INIT SCENE
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x050505 );
	scene.fog = new THREE.Fog( 0x050505, 1, 15 );

	// INIT CAMERA
	fov = 125;
	aspect = window.innerWidth / window.innerHeight;
	near = 0.1;
	far = 1000;
	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );

	// INIT RENDERER
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;
	document.body.appendChild( renderer.domElement );

	// INIT CONTROLS
	controls = new THREE.OrbitControls( camera );

	// INIT STATS
	stats = new Stats();
	document.body.appendChild( stats.dom );

	// INIT clock
	clock = new THREE.Clock();

	loadOBJ( 'source/models/icoModel.obj' );
	loadOBJ2( 'source/models/snakeBall.obj' );
	loadAudio( 'source/audios/bb.mp3' );

	// INIT TEST MESH
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	var cube = new THREE.Mesh( geometry, material );
	//scene.add( cube );
	cube.position.x = 6.5;

	camera.position.x = 7.4;
	controls.update();	

	postPro();

	//window.addEventListener( 'resize', onWindowResize, false );
};

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render(){
	stats.update();
	//renderer.render( scene, camera );
	var delta = clock.getDelta();
	if (data != undefined) {
		data = analyser.getFrequencyData();
		if (meshLoaded) {
			icoMesh.scale.x = data[0]/255 + 4;
			icoMesh.scale.y = data[0]/255 + 4;
			icoMesh.scale.z = data[0]/255 + 4;
			icoMesh.rotation.x -= 0.003;
			icoMesh.rotation.z -= 0.005;
		}
		if (meshLoaded2) {
			skullMesh.rotation.x += 0.003;
			skullMesh.rotation.z += 0.005;
		}
	}
	renderer.clear();
	composer.render(delta);
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
}

function loadAudio(audioURL){
	// create an AudioListener and add it to the camera
	var listener = new THREE.AudioListener();
	camera.add( listener );

	// create an Audio source
	var sound = new THREE.Audio( listener );

	// load a sound and set it as the Audio object's buffer
	var audioLoader = new THREE.AudioLoader();
		audioLoader.load( audioURL, function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop(true);
		sound.setVolume(0.5);
		sound.play();
		console.log( "audio loaded");
		// create an AudioAnalyser, passing in the sound and desired fftSize
		analyser = new THREE.AudioAnalyser( sound, 32 );

		// get the average frequency of the sound
		data = analyser.getFrequencyData();
	});
}

function postPro (){
	// COMPOSER
	composer = new THREE.EffectComposer( renderer );

	//PASSES
	var renderPass = new THREE.RenderPass( scene, camera );
	composer.addPass( renderPass );
	//renderPass.renderToScreen = true;

	/*var hBlurPass = new THREE.ShaderPass( THREE.HorizontalBlurShader );
	composer.addPass( hBlurPass );
	hBlurPass.renderToScreen =  true;*/

	var bloomPass =  new THREE.BloomPass( 1, 25, 4, 2048 );
	composer.addPass( bloomPass );
	//bloomPass.renderToScreen =  true;

	var filmPass = new THREE.FilmPass( 1, 0.025, 648, false );
	composer.addPass( filmPass );

	var kaleidoPass = new THREE.ShaderPass( THREE.KaleidoShader );
	//composer.addPass( kaleidoPass );

	var rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );
	composer.addPass( rgbPass );

	rgbPass.renderToScreen = true;
	
}


function loadOBJ2(modelURL ){
	var loader = new THREE.OBJLoader();
	loader.load(
		// resource URL
		modelURL,
		// called when resource is loaded
		function ( object ) {
			skull = object.children[0].geometry;
			skullPoints = skull.attributes.position.count;

			var colors = [];
			var color = new THREE.Color();

			for (var i = 0; i < skullPoints; i++) {
				//color.setRGB( 0.0, i/skullPoints, 1.0 );
				color.setRGB( 1, 1, 1 );
				colors.push( color.r, color.g, color.b );
			}
			skull.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
			skull.computeBoundingSphere();
			//skull.setDrawRange( 0, 0 );

			var material = new THREE.PointsMaterial( { size: 0.03, vertexColors: THREE.VertexColors } );
			skullMesh = new THREE.Points( skull, material );
			skullMesh.material.transparent = true;
			skullMesh.material.opacity = 0.01;
			scene.add( skullMesh );
			console.log(skullMesh);
			meshLoaded2 = true;
			//console.log(object);
		},
		// called when loading is in progresses
		function ( xhr ) {

			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		},
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' );

		}
	);
}

function loadOBJ(modelURL ){
	var loader = new THREE.OBJLoader();
	loader.load(
		// resource URL
		modelURL,
		// called when resource is loaded
		function ( object ) {
			var geometry = object.children[0].geometry;
			var points = geometry.attributes.position.count;

			var colors = [];
			var color = new THREE.Color();

			for (var i = 0; i < points; i++) {
				//color.setRGB( 0.0, i/skullPoints, 1.0 );
				color.setRGB( 1, 1, 1 );
				colors.push( color.r, color.g, color.b );
			}
			geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
			geometry.computeBoundingSphere();
			//skull.setDrawRange( 0, 0 );

			var material = new THREE.PointsMaterial( { size: 0.15, vertexColors: THREE.VertexColors } );
			icoMesh = new THREE.Points( geometry, material );
			//mesh.material.transparent = true;
			scene.add( icoMesh );
			meshLoaded = true;
			//console.log(object);
		},
		// called when loading is in progresses
		function ( xhr ) {

			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		},
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' );

		}
	);
}