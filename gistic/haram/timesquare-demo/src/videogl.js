/*!
 * jQuery videoGL plugin
 * Copyright (c) 2014 Fabio Biondi <info@fabiobiondi.com>
 * Version: 1.0.0
 *
 * Plugin website: http://plugincc.fabiobiondi.com/?cerchez-project=videogl
 */
var vglapps = [];
(function ($) {

    var methods = {
        init : function(options) {

            return this.each(function (i) {

                if (window.vglapps[options.videoID] !== undefined) {
                    window.alert("You cannot create multiple instances of the same video player. So we are using only the first instance");
                    return;
                }

                if (options !== undefined) {
                    createHTMLVideoTag(this, options);
                }
                options = $.extend({}, $.fn.videoGL.options, options);

                var instance = new initWebGl(options, $( this));
                window.vglapps[options.videoID] = instance;

                if (options.videos !== undefined) {
                    $.videoGL.loadVideo(options.videoID, options.videoWidth, options.videoHeight, options.videos);
                }

                if ( ! $.videoGL.detectWebGL() ) {
                    $("#" + options.videoID).removeClass("nowebgl").addClass("nowebgl");
                }

            });


        },
        update : function( content ) {  }
    };


    /**
     * Create HTML5 video tag
     * @param element
     * @param opts
     */
    var createHTMLVideoTag = function (element, opts) {

        if (opts.videos !== undefined) {
            var html = "<video id='" + opts.videoID + "' autoplay controls style='display:none;'>";
            html += "</video>";
            $(element).append(html);
        }

    };

    /**
     * WebGL / ThreeJS instance
     */
    var $this ;
    var initWebGl = function(options, element) {

        var movieSideType = THREE.DoubleSide;

        // standard global variables
        var container, scene, camera, renderer, renderPass, controls, stats, composer, movieScreen;
        var imageReflection, imageReflectionContext, imageReflectionGradient, textureReflection, materialReflection, reflectionMesh;

        var movieGeometry, movieMaterial;
        var video, videoImage, videoImageContext, videoTexture;
        var clock ;
        var applyPostProcess = false;

        this.composer = null;

        // If IE 11+, disable composers (filters)
        var isComposerSupported = true;
        if ($.videoGL.detectIsAtLeastIE11()) {
            isComposerSupported = false;
        }

        this.enableReflection = false;

        function init() {

            $this = element;

            var SCREEN_WIDTH = element.width(), SCREEN_HEIGHT = element.height();   //$("#ThreeJS").width()
            var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1.1, FAR = 23000;


            // RENDERER
            this.webGLisSuppored = false;

            if ( $.videoGL.detectWebGL() ) {

                this.webGLisSuppored = true;

                // SCENE
                scene = new THREE.Scene({scene:options.videoID});

                camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
                scene.add(camera);


                // Check if IE11+
                if ($.videoGL.detectIsAtLeastIE11()) {
                   renderer = new THREE.CanvasRenderer();
                }
                else {
                    renderer = new THREE.WebGLRenderer({antialias: true,  alpha: true});
                }

                clock = new THREE.Clock();


                container = $this[0] ;  // just like: document.getElementById( 'WrapperID' );
                container.appendChild( renderer.domElement );

                // CONTROLS
                controls = new THREE.OrbitControls( camera, renderer.domElement );
                controls.userRotate = true;
//                controls.userPan = false;
//                controls.userZoom = true;

                // STATS
                if (options.enableStats) {
                    stats = new Stats();
                    stats.domElement.style.position = 'absolute';
                    stats.domElement.style.bottom = '10px';
                    stats.domElement.style.right = '60px';
                    stats.domElement.style.zIndex = 100;
                    container.appendChild(stats.domElement);
                }

                // LIGHT
                var light = new THREE.PointLight(0xffffff);
                light.position.set(0,450,0);
                scene.add(light);


            }
            else {
                //renderer = new THREE.CanvasRenderer();
                console.warn ("videoGL warning: Your browser does not support WebGL ");
            }



            ///////////
            // VIDEO //
            ///////////

            this.videoID = options.videoID;

            video = document.getElementById( options.videoID );

            video.onended= function(e) {

                if (element.loopVideo) {
                    video.play();
                }
            };

            videoImage = document.createElement( 'canvas' );
            videoImage.width = options.videoWidth;
            videoImage.height = options.videoHeight;


            if ( $.videoGL.detectWebGL() ) {

                videoImageContext = videoImage.getContext('2d');
                videoImageContext.fillStyle = '#000';

                videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);
                videoTexture = new THREE.Texture(videoImage);
                videoTexture.minFilter = THREE.LinearFilter;
                videoTexture.magFilter = THREE.LinearFilter;

                movieMaterial = new THREE.MeshBasicMaterial({ map: videoTexture, overdraw: true, side: movieSideType });

                // the geometry on which the movie will be displayed;
                // movie image will be scaled to fit these dimensions.
                movieGeometry = new THREE.PlaneGeometry(options.videoWidth / 2, options.videoHeight / 2, 4, 4);
                movieGeometry.matrixAutoUpdate = true;
                movieGeometry.dynamic = true;
                movieScreen = new THREE.Mesh(movieGeometry, movieMaterial);
                scene.add(movieScreen);


                // REFLECTION
                imageReflection = document.createElement('canvas');
                imageReflection.width = options.videoWidth;
                imageReflection.height = options.videoHeight;

                imageReflectionContext = imageReflection.getContext('2d');
                imageReflectionContext.fillStyle = '#000';
                imageReflectionContext.fillRect(0, 0, options.videoWidth, options.videoHeight);

                imageReflectionGradient = imageReflectionContext.createLinearGradient(0, 0, 0, options.videoHeight);
                imageReflectionGradient.addColorStop(0.2, 'rgba(000, 000,000, 1)');
                imageReflectionGradient.addColorStop(1, 'rgba(000, 000, 000, 0.8)');

                textureReflection = new THREE.Texture(imageReflection);
                textureReflection.minFilter = THREE.LinearFilter;
                textureReflection.magFilter = THREE.LinearFilter;

                materialReflection = new THREE.MeshBasicMaterial({ map: textureReflection, side: movieSideType, overdraw: true });

                reflectionMesh = new THREE.Mesh(movieGeometry, materialReflection);
                reflectionMesh.position.y = -180;
                reflectionMesh.rotation.x = -Math.PI;
                if (this.enableReflection) {
                    scene.add(reflectionMesh);
                }


                //camera.position.set(0,150,300);
                camera.position.set(options.cameraX, options.cameraY, options.cameraZ);

                // Video Rotation  X,Y,Z
                movieScreen.position.set(options.rotationX, options.rotationY, options.rotationZ);

                renderPass = new THREE.RenderPass(scene, camera);
            }
        }
        init();




        /**
         * Refresh params (deprecated)
         * @param opts
         */
        this.refresh = function (opts) {
            options = opts;

            if (opts.videoWidth !== undefined) { videoImage.width = opts.videoWidth; }
            if (opts.videoHeight !== undefined) { videoImage.height = opts.videoHeight; }
            camera.updateProjectionMatrix();
        };

        /**
         * Update Props
         * @param opts
         */
        this.updatePropsFunc = function (opts) {

            if (opts.rotationX !== undefined && opts.rotationY !== undefined && opts.rotationZ !== undefined ) {
                movieScreen.rotation.set(opts.rotationX, opts.rotationY, opts.rotationZ);
                if (reflectionMesh != null) {
                    reflectionMesh.rotation.set(opts.rotationX+Math.PI, opts.rotationY, opts.rotationZ);
                }
            }

           /* if (opts.cameraX != undefined && opts.cameraY != undefined  && opts.cameraZ != undefined )
                camera.position.set(opts.cameraX, opts.cameraY, opts.cameraZ);*/
        };

        /**
         * Rotate video (deprecated)
         * @param opts
         */
        this.rotateVideo = function (opts) {

            if (opts.cameraX !== undefined && opts.cameraY !== undefined  && opts.cameraZ !== undefined ) {
                camera.position.set(opts.cameraX, opts.cameraY, opts.cameraZ);
            }

        };

        /**
         * Rotate video
         * @param opts
         */
        this.changeReflectionColor = function (hex) {

            var rgba= /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (rgba === null) {return;}

            imageReflectionGradient = imageReflectionContext.createLinearGradient( 0, 0, 0, options.videoHeight );

            var rgbacolor1 = 'rgba(' + parseInt(rgba[1], 16) + ", " + parseInt(rgba[2], 16) + "," + parseInt(rgba[3], 16) + ", 1)";
            imageReflectionGradient.addColorStop( 0.2, rgbacolor1 );

            var rgbacolor2 = 'rgba(' + parseInt(rgba[1], 16) + ", " + parseInt(rgba[2], 16) + "," + parseInt(rgba[3], 16) + ", 0.7)";
            imageReflectionGradient.addColorStop( 1, rgbacolor2);


        };

        /**
         * Change Video Size
         */
        this.changeVideoSize = function (w,h, enableReflectionEffect) {

            if ( ! $.videoGL.detectWebGL() ) { return };


            this.enableReflection = enableReflectionEffect;

            scene.remove(movieScreen);
            scene.remove(reflectionMesh);

            movieScreen = null;
            reflectionMesh = null;

            // Avoid resize image when changing video size
            //videoImage.width = imageReflection.width = w;
            //videoImage.height = imageReflection.height = h;


            videoImageContext.fillStyle = '#000';
            //videoImageContext.fillStyle = "rgba(222, 222, 222, 0.2)";
            videoImageContext.fillRect( 0, 0, w, h);
            //videoImageContext.globalAlpha=0.2;

            movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side: movieSideType} );

            //movieGeometry = new THREE.PlaneGeometry( w/2, h/2, 4, 4 );
            movieGeometry = new THREE.PlaneGeometry( w/2, h/2, 4, 4 );
            movieGeometry.matrixAutoUpdate = true;
            movieGeometry.dynamic = true;
            movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
            scene.add(movieScreen);


            if (enableReflectionEffect) {
                imageReflectionContext.fillRect( 0, 0,  w,h );

                materialReflection = new THREE.MeshBasicMaterial( { map: textureReflection, side: THREE.BackSide, overdraw: true } );
                reflectionMesh = new THREE.Mesh(movieGeometry, materialReflection);
                reflectionMesh.position.y = -h / 2;
                reflectionMesh.rotation.x = -Math.PI;
                scene.add(reflectionMesh);
            }

        };


        /**
         * Clear the video
         */
        this.clearVideo = function () {
            if (  !$.videoGL.detectWebGL() ) { return };

            videoTexture.needsUpdate = true;
            textureReflection.needsUpdate = true;
        };

        /**
         * Set Position
         */
        this.setPositionFunc = function (opts) {

            // Set Default values
            opts.cameraX = (opts.cameraX === undefined) ? camera.position.x : opts.cameraX;
            opts.cameraY = (opts.cameraY === undefined) ? camera.position.y : opts.cameraY;
            opts.cameraZ = (opts.cameraZ === undefined) ? camera.position.z : opts.cameraZ;
            opts.rotationX = (opts.rotationX === undefined) ?  movieScreen.rotation.x : opts.rotationX;
            opts.rotationY = (opts.rotationY === undefined) ? movieScreen.rotation.y : opts.rotationY;
            opts.rotationZ = (opts.rotationZ === undefined) ? movieScreen.rotation.z : opts.rotationZ;

            camera.position = new THREE.Vector3(opts.cameraX,opts.cameraY,opts.cameraZ);
            movieScreen.rotation = new THREE.Vector3(opts.rotationX,opts.rotationY,opts.rotationZ);
        };


        /**
         * Tween
         */
        this.tweenFunc = function (opts, speed, easing, delay) {


            speed = (speed === undefined) ? 1000 : speed ;
            delay = (delay === undefined) ? 0 : delay;
            easing = (easing === undefined) ?  TWEEN.Easing.Quintic.InOut  : easing;


            setTimeout(function () {

                opts.cameraX = (opts.cameraX === undefined) ? camera.position.x : opts.cameraX;
                opts.cameraY = (opts.cameraY === undefined) ? camera.position.y : opts.cameraY;
                opts.cameraZ = (opts.cameraZ === undefined) ? camera.position.z : opts.cameraZ;
                var tweenCameraPos = new TWEEN.Tween( camera.position ).to( {
                    x: opts.cameraX,
                    y: opts.cameraY,
                    z: opts.cameraZ}, speed )
                    .easing(easing).start();


                opts.rotationX = (opts.rotationX === undefined) ?  movieScreen.rotation.x : opts.rotationX;
                opts.rotationY = (opts.rotationY === undefined) ? movieScreen.rotation.y : opts.rotationY;
                opts.rotationZ = (opts.rotationZ === undefined) ? movieScreen.rotation.z : opts.rotationZ;
                var  tweenMovieRotation = new TWEEN.Tween( movieScreen.rotation ).to( {
                        x: opts.rotationX,
                        y: opts.rotationY,
                        z: opts.rotationZ}, speed )
                        .easing(easing).start();


                opts.scaleX = (opts.scaleX === undefined) ? movieScreen.scale.x : opts.scaleX;
                opts.scaleY = (opts.scaleY === undefined) ? movieScreen.scale.y : opts.scaleY;
                opts.scaleZ = (opts.scaleZ === undefined) ? movieScreen.scale.z : opts.scaleZ;
                var  tweenMovieScale = new TWEEN.Tween( movieScreen.scale ).to( {
                    x: opts.scaleX,
                    y: opts.scaleY,
                    z: opts.scaleZ}, speed )
                    .easing(easing).start();

            }, delay);

            var tween = new TWEEN.Tween( camera.position ).to( {}, speed )
                .delay(delay)
                .easing(easing).start();
            return tween;

        };

        /**
         * Animate
         */
        this.animate = function() {
            if ( !$.videoGL.detectWebGL()) { return };

            //requestAnimationFrame( animate );
            this.render();
            update();
        };



        /**
         * Update handler
         */
        function update() {
            controls.update();
            if (stats) {stats.update();}
        }


        /**
         * Render handler
         */
        this.render = function() {

            TWEEN.update();

            if (video.readyState === video.HAVE_ENOUGH_DATA) {

                videoImageContext.drawImage(video, 0, 0);

                if (videoTexture) {
                    videoTexture.needsUpdate = true;
                }

                 if (this.enableReflection) {
                     if (textureReflection) { textureReflection.needsUpdate = true; }

                     imageReflectionContext.drawImage(videoImage, 0, 0);
                     imageReflectionContext.fillStyle = imageReflectionGradient;
                     imageReflectionContext.fillRect(0, 0, videoImage.width, videoImage.height);
                 }

            }

            var delta = clock.getDelta();
            renderer.render( scene, camera );
            if (this.composer && isComposerSupported) {
                this.composer.render(delta);
            }

        };


        // Do 3D stuff is supported
        if (  $.videoGL.detectWebGL() ) {

            this.animate();
            window.addEventListener('resize', onWindowResize, false);
            this.resize();
        }




        /**
         * Resize event handler
         */
        this.resize = function() {

            if (camera === undefined) {return;}

            var SCREEN_WIDTH = element.width(), SCREEN_HEIGHT = element.height();

            camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

            var tmp_fov = 0.0;

            for (var i=0; i<8; i++) {
                proj2d = toCameraCoords(movieScreen.geometry.vertices[i]);

                angle = 114.59 * Math.max( // 2 * (Pi / 180)
                    Math.abs(Math.atan(proj2d.x/proj2d.z) / camera.aspect),
                    Math.abs(Math.atan(proj2d.y/proj2d.z))
                );
                tmp_fov = Math.max(tmp_fov, angle);
            }

            // TODO: this creates projection issues
            //  camera.fov = tmp_fov + 5; // An extra 5 degrees keeps all lines visible

            camera.updateProjectionMatrix();
            renderer.setSize( SCREEN_WIDTH,  SCREEN_HEIGHT );


        };






        /**********************************
         * GETTERs
         */
        this.getVideoInstance = function () {
            return video;
        };

        this.getCamera = function () {
            return camera;
        };

        this.getScene = function () {
            return scene;
        };
        this.getRenderer = function () {
            return renderer;
        };
        this.getRenderPass = function () {
            return renderPass;
        };
        this.getControls = function () {
            return controls;
        };


        this.getOptions = function () {

            var obj = {};
            obj.cameraX = camera.position.x;
            obj.cameraY = camera.position.y;
            obj.cameraZ = camera.position.z;
            obj.rotationX = movieScreen.position.x;
            obj.rotationY = movieScreen.position.y;
            obj.rotationZ = movieScreen.position.z;

            return obj;
        };



        /**********************************
         * SETTERs
         */
        this.setComposer = function (value) {
            this.composer = value;
        };

        this.setEnableVideoLoop = function (value) {
            this.loopVideo = value;
            element.loopVideo = value;
        };

        this.updateWrapperSize = function(w,h) {
            renderer.setSize(w, h);
            camera.aspect = w/h;
            camera.updateProjectionMatrix();
            this.resize();
        };

        this.enableReflectionFunc = function (value) {
            this.changeVideoSize(videoImage.width, videoImage.height, value);
        };



        /**********************************
         * UTILS
         */
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }
        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }

        /**
         * ToCameraCoords
         * @param position
         * @returns {*}
         */
        function toCameraCoords(position) {
            var rotation_matrixc = new THREE.Matrix4();
            rotation_matrixc.extractRotation(movieScreen.matrix);

            // Deprecated way (older ThreeJs versions)
            //return camera.matrixWorldInverse.multiplyVector3(position.clone());

            // new way
            var mInverse = new THREE.Matrix4().getInverse(camera.matrixWorld);
            return position.clone().applyMatrix4(mInverse);
        }
    };


    /**
     * OnResize event
     */
    var onWindowResize = function() {
        for (var prop in vglapps) {
            vglapps[prop].resize();
        }
    };

    /**
     * Add Event Listener replacement
     * Avoid multiple listeners
     */
    var addEventListener = (function() {
        if(document.addEventListener) {
            return function(element, event, handler) {
                element.addEventListener(event, handler, false);
            };
        }
        else {
            return function(element, event, handler) {
                element.attachEvent('on' + event, handler);
            };
        }
    }());


    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //// PUBLIC METHODS
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////

    /**
     * Contructor
     * @param methodOrOptions
     * @returns {*}
     */
    $.fn.videoGL = function(methodOrOptions) {
        if ( methods[methodOrOptions] ) {
            return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            // Default to "init"
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.videoGL' );
        }
    };


    // Static method.
    $.videoGL = function (options) {
        // Override default options with passed-in options.
        options = $.extend({}, $.fn.videoGL.options, options);
        // Return something videoGL.
        return this;
    };

    // Static method default options.
    $.fn.videoGL.options = {
        punctuation: '.',
        videoWidth: 400,
        videoHeight: 200,
        "cameraX": 0,
        "cameraY": 0,
        "cameraZ": 200*0.66,
        "rotationX": 0,
        "rotationY": 0,
        "rotationZ": 0
    };

    // Custom selector.
/*    $.expr[':'].videoGL = function (elem) {
        // Is this element videoGL?
        return $(elem).text().indexOf('videoGL') !== -1;
    };*/


    // Tween
    $.videoGL.tween = function (video_id, opts, speed, easing, delay) {

        if ( !$.videoGL.detectWebGL()){ return this; }

        if ($.videoGL.isInitialized(video_id, "tween")) {
            return window.vglapps[video_id].tweenFunc(opts, speed, easing, delay);
        }
    };
    // Tween complete chaining fallback for < IE9
    $.videoGL.onComplete= function (fn) { };


    $.videoGL.updateProps = function (video_id, opts) {
        if ($.videoGL.isInitialized(video_id, "updateProps")) {
            window.vglapps[video_id].updatePropsFunc(opts);
        }
    };

    // Rotate video (deprecated)
    $.videoGL.rotateVideo = function (video_id, opts) {
        if ($.videoGL.isInitialized(video_id, "rotateVideo")) {
            window.vglapps[video_id].rotateVideo(opts);
        }
    };

    /*$.videoGL.enableControls = function (video_id, value)
    {
        if ($.videoGL.isInitialized(video_id, "enableControls")){
            window.vglapps[video_id].getControls().enable  = false;
        }

    };*/

    // Enable ROTATE
    $.videoGL.enableMouseRotate = function (video_id, value) {
        if ($.videoGL.isInitialized(video_id, "enableMouseRotate")){
            window.vglapps[video_id].getControls().userRotate = value;
        }
    };

    // Enable ZOOM (rotate + pan too)
    $.videoGL.enableMouseZoom = function (video_id, value) {
        if ($.videoGL.isInitialized(video_id, "enableMouseZoom")){
            window.vglapps[video_id].getControls().userZoom = value;
        }
    };

    // Enable REFLECTION
    $.videoGL.enableReflection = function (video_id, value) {
        if ($.videoGL.isInitialized(video_id, "enableReflection")){
            window.vglapps[video_id].enableReflectionFunc(value);
        }
    };


    // Enable Video Loop at complete
    $.videoGL.enableVideoLoop = function (video_id, value) {
        if ($.videoGL.isInitialized(video_id, "enableVideoLoop")) {
            window.vglapps[video_id].setEnableVideoLoop(value);
        }
    };

    // Update the wrapper size
    $.videoGL.updateWrapperSize = function (video_id, w, h) {
        if ($.videoGL.isInitialized(video_id, "updateWrapperSize")) {
            window.vglapps[video_id].updateWrapperSize(w, h);
        }
    };


    // Enable Video Loop at complete
    $.videoGL.getOptions = function (video_id) {
        if ($.videoGL.isInitialized(video_id, "getOptions")) {
            return  window.vglapps[video_id].getOptions();
        }
    };


    // Change Video size
    $.videoGL.changeVideoSize = function (video_id, w, h, enableReflectionEffect) {
        if ($.videoGL.isInitialized(video_id, "changeVideoSize")) {
            window.vglapps[video_id].changeVideoSize(w,h, enableReflectionEffect);
        }
    };


    // Set position (no tweens)
    $.videoGL.setPosition = function (video_id, opts) {
        if ($.videoGL.isInitialized(video_id, "setPosition")) {
            return  window.vglapps[video_id].setPositionFunc(opts);
        }
    };


    // Load new video
    $.videoGL.loadVideo = function (video_id, w, h, videos, enableReflection, clearPrevious) {

        if (window.vglapps[video_id] === undefined) {
            console.warn("You are trying to load videos before initializing videoGL");
            return ;
        }

        // Force disable reflection
        if (enableReflection === undefined) {enableReflection = false;}

        // Load new video
        var video = document.getElementById( video_id);

        // Force video clear
        if (clearPrevious) {
            window.vglapps[video_id].clearVideo();
            video.setAttribute("src", "");
        }


        if(Modernizr.video && Modernizr.video.h264) {
            video.setAttribute("src", videos.mp4);
        } else if(Modernizr.video && Modernizr.video.ogg) {
            video.setAttribute("src", videos.ogg);
        } else if(Modernizr.video && Modernizr.video.webm) {
            video.setAttribute("src", videos.webm);
        }

        // Fit video size
        window.vglapps[video_id].changeVideoSize(w,h, enableReflection);

    };


    // check if the webgl instance is initialized
    $.videoGL.isInitialized = function (video_id, method) {

        if ( !$.videoGL.detectWebGL()) return false;

        if (method === undefined) {method = "ANY";}

        if (window.vglapps[video_id] === undefined) {
            console.warn("You are using a videoGL feature before using the " + method + " method");
            return false;
        }
        else {
            return true;
        }

    };


    /**
     * Return the instance of the video
     */
    $.videoGL.getVideo = function (video_id) {

        if (window.vglapps[video_id] === undefined) {
            console.warn("You are using a videoGL feature before using the " + method + " method");
            return;
        }
        else {
            return window.vglapps[video_id].getVideoInstance();
        }

    };


    /**
     * Change background color
     * @param video_id
     * @param color
     */
    $.videoGL.changeBackgroundColor = function (video_id, color) {
        if ($.videoGL.isInitialized(video_id, "changeBackgroundColor")) {
            window.vglapps[video_id].getRenderer().setClearColor(color );
        }
    };

    /**
     * Remove  background color (transparent background)
     * @param video_id
     * @param color
     */
    $.videoGL.removeBackground = function (video_id) {
        if ($.videoGL.isInitialized(video_id, "removeBackgroundColor")) {

            //var currentColor = window.vglapps[video_id].getRenderer().getClearColor()
            window.vglapps[video_id].getRenderer().setClearColor(0x000000, 0);
            //window.vglapps[video_id].getRenderer().setClearColor(color, 0);
        }
    };

    /**
     * Change reflection  color
     * @param video_id
     * @param color
     */
    $.videoGL.changeReflectionColor = function (video_id, colorRGBA) {
        if ($.videoGL.isInitialized(video_id, "changeReflectionColor")) {
            window.vglapps[video_id].changeReflectionColor(colorRGBA);
        }
    };

    /**
     * Detect IE11+ : return true if using IE11 or above
     * @param video_id
     * @param color
     */
    $.videoGL.detectIsAtLeastIE11 = function () {
        return !!(navigator.userAgent.match(/Trident/) && !navigator.userAgent.match(/MSIE/));
    };

    /**
     * Detect WebGl: return true if using IE11 or above
     * @param video_id
     * @param color
     */
    $.videoGL.detectWebGL = function () {
        return Detector.webgl;
    };

    /**
     * Refresh video properties (deprecated)
     */
    $.videoGL.refresh = function (video_id, options) {
        window.vglapps[video_id].refresh(options);
    };

    //var isAtLeastIE11 = !!(navigator.userAgent.match(/Trident/) && !navigator.userAgent.match(/MSIE/));


    /**
     * UTILS: check if there are multiple WEBGL instances
     * @returns {boolean}
     */
    function areThereMultipleWebGLinstances () {

        var total = 0;
        for (var key in window.vglapps) {
            if (vglapps.hasOwnProperty(key)) { total++; }

            if (total > 1) {
                alert("You cannot apply filters if there are multiple WEBGL instances in the same page");
                return true;
            }
        }
        return false;
    }













    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //// VIDEO FILTERS
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////

    $.videoGL.filters = {};

    // Remove all filters
    $.videoGL.filters.removeAll = function (video_id) {
        var app = window.vglapps[video_id];
        app.setComposer(null);
    };


    $.videoGL.filters.sepia = function (video_id, params) {

        // if (areThereMultipleWebGLinstances()) return;

        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());

        var shaderSepia = THREE.SepiaShader;
        effectSepia = new THREE.ShaderPass( shaderSepia );
        effectSepia.renderToScreen = true;

        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass( renderPass);
        comp.addPass( effectSepia );

        if (params.amount != null) {effectSepia.uniforms.amount.value = params.amount;}

        app.setComposer(comp);
    };

    $.videoGL.filters.film = function (video_id, params) {

        //if (areThereMultipleWebGLinstances()) return;
        var app = window.vglapps[video_id];
        //var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());


        effectFilm = new THREE.FilmPass(0.8, 0.325, 256, false);
        effectFilm.renderToScreen = true;

        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass(window.vglapps[video_id].getRenderPass());
        comp.addPass(effectFilm);

        if (params.scount === undefined)     { params.scount = 256;}
        if (params.grayscale === undefined)  { params.grayscale = false;}
        if (params.sintensity === undefined) { params.sintensity = 0.3;}
        if (params.nintensity === undefined) { params.nintensity = 0.8;}

        var string = "";
        effectFilm.uniforms.grayscale.value =  params.grayscale;
        string += " greyscale=\"" + params.grayscale + "\"";

        effectFilm.uniforms.nIntensity.value = params.nintensity;
        string += " nintensity=\"" + params.nintensity + "\"";

        effectFilm.uniforms.sIntensity.value = params.sintensity;
        string += " sintensity=\"" + params.sintensity + "\"";

        effectFilm.uniforms.sCount.value = params.scount;
        string += " scount=\"" + params.scount + "\"";

        app.setComposer(comp);
    };


    $.videoGL.filters.bw = function (video_id) {

        if (!$.videoGL.isInitialized(video_id, "filters.bw")) return;


        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());

        var effectFilm = new THREE.FilmPass(0.8, 0.325, 256, false);
        effectFilm.renderToScreen = true;

        //var defaults = {};
        var params = {};
        params.scount = 0;
        params.grayscale = true;
        params.sintensity = 0;
        params.nintensity = 0;

        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass(renderPass);
        comp.addPass(effectFilm);

        var string = "";
        effectFilm.uniforms.grayscale.value =  params.grayscale;
        effectFilm.uniforms.nIntensity.value = params.nintensity;
        effectFilm.uniforms.sIntensity.value = params.sintensity;
        effectFilm.uniforms.sCount.value = params.scount;
        app.setComposer(comp);

    };

    $.videoGL.filters.sepia = function (video_id, params) {

        // if (areThereMultipleWebGLinstances()) return;

        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());

        var shaderSepia = THREE.SepiaShader;
        effectSepia = new THREE.ShaderPass( shaderSepia );
        effectSepia.renderToScreen = true;

        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass( renderPass);
        comp.addPass( effectSepia );

        if (params.amount != null) {effectSepia.uniforms.amount.value = params.amount;}

        app.setComposer(comp);
    };


    $.videoGL.filters.drawing = function (video_id, params) {

        params = params || {};


        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());

        var dotScreenEffect = new THREE.ShaderPass( THREE.DotScreenShader );
        if (params.dotScale === undefined) {params.dotScale = 0.7;}
        dotScreenEffect.uniforms.scale.value = params.dotScale;

        var RGBShifShaderEffect = new THREE.ShaderPass( THREE.RGBShiftShader );
        if (params.rgbAmount === undefined) {params.rgbAmount = 0.0015;}
        RGBShifShaderEffect.uniforms.amount.value = params.rgbAmount;
        RGBShifShaderEffect.renderToScreen = true;

        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass( renderPass);
        comp.addPass( dotScreenEffect );
        comp.addPass( RGBShifShaderEffect );
        app.setComposer(comp);
    };


    $.videoGL.filters.dotscreen = function (video_id, params) {

        params = params || {};

        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());

        var dotScreenEffect = new THREE.ShaderPass( THREE.DotScreenShader );
        if (params.dotScale === undefined) {params.dotScale = 0.7;}
        dotScreenEffect.uniforms.scale.value =  params.dotScale;


        var RGBShifShaderEffect = new THREE.ShaderPass( THREE.RGBShiftShader );
        RGBShifShaderEffect.renderToScreen = true;
        if (params.rgbAmount === undefined) { params.rgbAmount = 0.0015;}
        RGBShifShaderEffect.uniforms.amount.value =  params.rgbAmount;


        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass( renderPass);
        comp.addPass( dotScreenEffect );
        comp.addPass( RGBShifShaderEffect );
        app.setComposer(comp);



    };


    $.videoGL.filters.edgeshader = function (video_id, params) {

        params = params || {};

        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());

        var edgeEffect = new THREE.ShaderPass( THREE.EdgeShader );
        if (params.edgeEffectX === undefined) {params.edgeEffectX = 400;}
        edgeEffect.uniforms[ 'aspect' ].value.x = params.edgeEffectX;
        edgeEffect.uniforms[ 'aspect' ].value.y = params.edgeEffectY;

        var edgeEffect2 = new THREE.ShaderPass( THREE.EdgeShader2 );
        if (params.edgeEffectY === undefined) {params.edgeEffectY = 400;}
        edgeEffect2.uniforms[ 'aspect' ].value.x = params.edgeEffectX;
        edgeEffect2.uniforms[ 'aspect' ].value.y = params.edgeEffectY;

        var copyShader = new THREE.ShaderPass( THREE.CopyShader);
        copyShader.renderToScreen = true;

        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass( renderPass);
        comp.addPass( edgeEffect );
        //comp.addPass( edgeEffect2 );
        comp.addPass( copyShader );
        app.setComposer(comp);



    };

    $.videoGL.filters.templateFilter = function (video_id, params) {

        params = params || {};

        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());

        // Shaders
        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass( renderPass);
        comp.addPass( /*SHARED */);

        app.setComposer(comp);
    };

    $.videoGL.filters.rgb = function (video_id, params) {

        params = params || {};

        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());

        // Shaders
        RGBShifShaderEffect = new THREE.ShaderPass( THREE.RGBShiftShader );
        //RGBShifShaderEffect.uniforms[ 'amount' ].value = 0.0015;
        RGBShifShaderEffect.renderToScreen = true;
        if (params.rgbAmount === undefined) {params.rgbAmount = 0.01;}
        RGBShifShaderEffect.uniforms.amount.value =  params.rgbAmount;
        RGBShifShaderEffect.uniforms.angle.value =  params.angle;


        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass( renderPass);
        comp.addPass( RGBShifShaderEffect);
        app.setComposer(comp);

    };

    $.videoGL.filters.bloom = function (video_id, params) {

        params = params || {};

        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());
        var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        effectCopy.renderToScreen = true;


        // Shaders
        if (params.strength === undefined)     {params.strength = 3;}
        if (params.kernelSize === undefined)   {params.kernelSize = 25;}
        if (params.sigma === undefined)        {params.sigma = 5;}
        if (params.resolution === undefined)   {params.resolution = 256;}

        var bloomPass = new THREE.BloomPass(params.strength, params.kernelSize, params.sigma, params.resolution);

        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass( renderPass);
        comp.addPass( bloomPass);
        comp.addPass(effectCopy);
        app.setComposer(comp);


    };

    $.videoGL.filters.vignette = function (video_id, params) {
        params = params || {};
        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());
        var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        effectCopy.renderToScreen = true;


        var vignettePass =  new THREE.ShaderPass(THREE.VignetteShader);
        if (params.darkness === undefined)     {params.darkness = 3;}
        if (params.offset === undefined)       {params.offset = 3;}

        vignettePass.uniforms.darkness.value = params.darkness;
        vignettePass.uniforms.offset.value = params.offset;

        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass( renderPass);
        comp.addPass( vignettePass);
        comp.addPass(effectCopy);
        app.setComposer(comp);

    };

    $.videoGL.filters.mirror = function (video_id, params) {

        params = params || {};

        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());
        var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        effectCopy.renderToScreen = true;

        var mirrorPass =  new THREE.ShaderPass(THREE.MirrorShader);
        if (params.side === undefined)    { params.side = 3;}
        mirrorPass.uniforms.side.value = params.side;

        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass( renderPass);
        comp.addPass( mirrorPass);
        comp.addPass(effectCopy);
        app.setComposer(comp);

    };


    $.videoGL.filters.brightnessContrast = function (video_id, params) {

        params = params || {};
        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());
        var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        effectCopy.renderToScreen = true;

        var pass =  new THREE.ShaderPass(THREE.BrightnessContrastShader);
        if (params.contrast === undefined)     {params.contrast = 0.2;}
        if (params.brightness === undefined)    { params.brightness = 0.5;}
        pass.uniforms.contrast.value = params.contrast;
        pass.uniforms.brightness.value = params.brightness;

        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass( renderPass);
        comp.addPass( pass);
        comp.addPass(effectCopy);
        app.setComposer(comp);

    };

    $.videoGL.filters.kaleido = function (video_id, params) {

        params = params || {};
        var app = window.vglapps[video_id];
        var renderPass = new THREE.RenderPass(app.getScene(), app.getCamera());
        var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
        effectCopy.renderToScreen = true;

        console.log ("params", params);
        var pass =  new THREE.ShaderPass(THREE.KaleidoShader);
        if (params.sides === undefined)     {params.sides = 16;}
        if (params.angle === undefined)     {params.angle = 90;}
        pass.uniforms.sides.value =  params.sides;
        pass.uniforms.angle.value = params.angle;

        var comp = new THREE.EffectComposer(app.getRenderer());
        comp.addPass( renderPass);
        comp.addPass( pass);
        comp.addPass(effectCopy);
        app.setComposer(comp);

    };


}(jQuery));

var vglapps = [];
var doAnimate = function(animateFn) {
    for (var prop in vglapps) {
        vglapps[prop].animate();
    }
    requestAnimationFrame( doAnimate );
};
doAnimate();


