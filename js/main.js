// PORTFOLIO BONNIE B.

// MAIN THREE.JS VARIABLES
var scene, camera, renderer, composer;

// CAMERA SETTINGS VARIABLES
var fov, aspect, near, far;

// SYSTEM VARIABLES
var clock, controls, meshLoaded, meshLoaded2, fgMove, posX, posY, posZ;;

// LIGHT VARIABLES
var ambLight;

// AUDIO VARIABLES
var sound, data, analyser;

// OBJECTS VARIABLES
var bgSphere, fgSphere, fgSphereInit;

// SCREEN RECORDER
var capturer;

// DETECTOR WEBGL
if ( Detector.webgl ) {
    init();
    animate();
} else {
    var warning = Detector.getWebGLErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
}

function basicSetup(){
	// INIT SCENE
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x07101c );
	scene.fog = new THREE.Fog( 0x050505, 1, 15 );

	// INIT CAMERA
	fov = 125;
	aspect = window.innerWidth / window.innerHeight;
	near = 0.1;
	far = 1000;
	camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.x = 7.4;

	// INIT RENDERER
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;
	document.body.appendChild( renderer.domElement );

	// INIT ANIMATIONS VARIABLES
	fgMove = false;

	// INIT CONTROLS
	controls = new THREE.OrbitControls( camera );
	controls.update();

	// INIT CLOCK
	clock = new THREE.Clock();
}

function init() {
	// SCENE, CAMERA, RENDERER, CONTROLS, STATS, CLOCK
	basicSetup();

	// LIGHTS
	ambLight = new THREE.AmbientLight( 0x303030 ); 
	scene.add( ambLight );

	// MODELS
	fgSphereInit = [];
	loadOBJ( 'source/models/snakeBall.obj', 0 );
	loadOBJ( 'source/models/icoModel.obj', 1 );

	// AUDIO
	loadAudio( 'source/audios/audiobonnie.mp3' );

	// COMPOSER, PASSES
	postPro();

	// EVENTS LISTENERS
	window.addEventListener( 'resize', onWindowResize, false );

	document.addEventListener("keyup", function(event){
        if ( event.keyCode == 71 ) {
            capturer.stop();
            capturer.save();
        }
    });
};

function animate() {
	requestAnimationFrame( animate );

	var delta = clock.getDelta();


	if (data != undefined) {
		data = analyser.getFrequencyData();

		if ( meshLoaded ) {
			fgSphere.scale.x = ( data[ 2 ]/255 ) * 2 + 4;
			fgSphere.scale.y = ( data[ 2 ]/255 ) * 2 + 4;
			fgSphere.scale.z = ( data[ 2 ]/255 ) * 2 + 4;
			fgSphere.rotation.x -= 0.003;
			fgSphere.rotation.z -= 0.005;
			if (fgMove) {
				noiseMove( fgSphere, 255 );
			}
		}
		if ( meshLoaded2 ) {
			bgSphere.rotation.x += 0.003;
			bgSphere.rotation.z += 0.005;
			//noiseMove( bgSphere );
		}
	}

	renderer.clear();
	//renderer.render( scene, camera );
	composer.render( delta );
}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
}

// LOADERS FUNCTIONS

function loadAudio( audioURL ){
	// AUDIO LISTENER
	var listener = new THREE.AudioListener();
	camera.add( listener );

	// AUDIO SOURCE
	sound = new THREE.Audio( listener );

	// LOAD SOUND AND SET IT AS AUDIO OBJECT'S BUFFER
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( 
		audioURL, 
		function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.5 );
			sound.play();
			
			// AUDIO ANALYSER
			analyser = new THREE.AudioAnalyser( sound, 32 );
			analyser.smoothingTimeConstant = 0.1;
			// SOUND FREQUENCY DATA
			data = analyser.getFrequencyData();
		},
		// onProgress callback
		function ( xhr ) {
			console.log( 'audio ' + Math.round( ( xhr.loaded / xhr.total ) * 100 ) + '% loaded' );
		},
		// onError callback
		function ( err ) {
			console.log( 'Un problema ha ocurrido' );
		}
	);
}

function loadOBJ( modelURL, x ){
	var loader = new THREE.OBJLoader();
	var objectName;
	loader.load(
		// resource URL
		modelURL,
		// called when resource is loaded
		function ( object ) {
			var geometry = object.children[0].geometry;
			var points = geometry.attributes.position.count;
			var mergePos = [];
			var isDouble = false;
			for ( var i = 0; i < points; i++ ) {
				if ( mergePos.length == 0 ) {
					mergePos.push( geometry.attributes.position.array[ i * 3 ], geometry.attributes.position.array[ i * 3 + 1], geometry.attributes.position.array[ i * 3 + 2] );
				}else{
					isDouble = false;
					for ( var j = 0; j < mergePos.length / 3; j++ ) {
						if ( geometry.attributes.position.array[ i * 3 ] == mergePos[ j * 3 ] &&  geometry.attributes.position.array[ i * 3 + 1 ] == mergePos[ j * 3 + 1 ] && geometry.attributes.position.array[ i * 3 + 2] == mergePos[ j * 3 + 2]  ) {
							isDouble = true;
						}
					}
					if ( isDouble == false ) {
						mergePos.push( geometry.attributes.position.array[ i * 3 ], geometry.attributes.position.array[ i * 3 + 1], geometry.attributes.position.array[ i * 3 + 2] );
					}	
				}	
			}
			var colors = [];
			var color = new THREE.Color();

			for (var i = 0; i < points; i++) {
				color.setRGB( 1, 1, 1 );
				if (x == 0) {
					color.setRGB( 0.2, 0.4, 0.5 );
				}
				colors.push( color.r, color.g, color.b );
			}
			geometry.removeAttribute( 'position' );
			geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
			geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( mergePos, 3 ) );
			geometry.computeBoundingSphere();

			var material = new THREE.PointsMaterial( { size: 0.03, vertexColors: THREE.VertexColors } );
 			var mesh = new THREE.Points( geometry, material );

			if ( x == 0 ) {
				mesh.material.transparent = true;
				mesh.material.opacity = 0.14;
				bgSphere = mesh;
				bgSphere.name = "bgSphere";
				scene.add( bgSphere );
				meshLoaded2 = true;
				document.getElementById('preloader').classList.toggle('fade');
			}		
			if ( x == 1 ) {
				mesh.material.size = 0.15;
				fgSphere = mesh;
				fgSphere.scale.x = 4;
				fgSphere.scale.y = 4;
				fgSphere.scale.z = 4;
				for (var i = 0; i < points; i++) {
					fgSphereInit[ i * 3 ] = fgSphere.geometry.attributes.position.array[ i * 3 ];
					fgSphereInit[ i * 3 + 1] = fgSphere.geometry.attributes.position.array[ i * 3 + 1];
					fgSphereInit[ i * 3  + 2] = fgSphere.geometry.attributes.position.array[ i * 3 + 2];
				}
				fgSphere.name = "fgSphere";
				scene.add( fgSphere );
				meshLoaded = true;
			}	
		},
		// called when loading is in progresses
		function ( xhr ) {
			console.log( 'objeto-' + x + ' ' + Math.round( ( xhr.loaded / xhr.total ) * 100 ) + '% loaded' );
		},
		// called when loading has errors
		function ( error ) {
			console.log( 'Un problema ha ocurrido' );
		}
	);
}

// ANIMATIONS FUNCTIONS

function changeMat( object ){
	object.material = new THREE.MeshLambertMaterial();
	object.material.needsUpdate = true;
}

function activeNoise( x ) {
	if ( x == 1 ) {
		fgMove = true;
	}
	if ( x == 2 ) {
		fgMove = false;
	}
}

function menuLine ( id, x ){
	if ( x == 1 ) {
		TweenMax.to("#"+id, 0.5, {width:"100%", ease: Circ.easeIn});
	}else{
		TweenMax.to("#"+id, 0.5, {width:"0%", ease: Circ.easeOut});
	}
}

function infoView ( id, x ){
	if ( x == 1 ) {
		TweenMax.to("#works", 0.5, {opacity:1, zIndex: 101, ease: Circ.easeIn, delay: 0.5});
	}
	TweenMax.to("#tittle", 0.5, {opacity:0, ease: Circ.easeIn});
	TweenMax.to("#works", 0.5, {opacity:0, zIndex: -100, ease: Circ.easeIn});
	TweenMax.to("#in", 0.5, {opacity:0, zIndex: -100, ease: Circ.easeIn});
	TweenMax.to("#bb", 0.5, {opacity:0, zIndex: -100, ease: Circ.easeIn});
	TweenMax.to("#ci", 0.5, {opacity:0, zIndex: -100, ease: Circ.easeIn});
	TweenMax.to("#lc", 0.5, {opacity:0, zIndex: -100, ease: Circ.easeIn});
	TweenMax.to("#ei", 0.5, {opacity:0, zIndex: -100, ease: Circ.easeIn});
	TweenMax.to("#ol", 0.5, {opacity:0, zIndex: -100, ease: Circ.easeIn});
	TweenMax.to("#pjt", 0.5, {opacity:0, zIndex: -100, ease: Circ.easeIn});


	TweenMax.to("#"+id, 0.5, {opacity:1, zIndex: 101, ease: Circ.easeIn, delay: 0.5});
}

// POSTPROCESSING FUNCTIONS

function postPro (){
	// COMPOSER
	composer = new THREE.EffectComposer( renderer );

	//PASSES
	var renderPass = new THREE.RenderPass( scene, camera );
	var bloomPass =  new THREE.BloomPass( 1, 25, 4, 2048 );
	var filmPass = new THREE.FilmPass( 0.2, 1.0, 6, false );	
	var filmPass2 = new THREE.FilmPass( 0.2, 1.5, 648, false );
	kaleidoPass = new THREE.ShaderPass( THREE.KaleidoShader );
	var rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );
	var vignettePass = new THREE.ShaderPass( THREE.VignetteShader );

	// ADD PASSES TO COMPOSER
	composer.addPass( renderPass );
	composer.addPass( bloomPass );
	composer.addPass( filmPass );
	composer.addPass( filmPass2 );
	//composer.addPass( kaleidoPass );
	composer.addPass( rgbPass );
	composer.addPass( vignettePass );

	vignettePass.renderToScreen = true;
}
