import THREE  from 'three'; 
import URL    from 'url';
import eve    from 'dom-events';
import UtilsP from 'utils-perf';

const collada = require('three-loaders-collada')(THREE);

class SceneGallery 
{
    constructor(renderer, clock) {

        this.camera   = null;
        this.scene    = null;
        this.renderer = renderer;
        this.clock    = clock;

        this.mouseDown = false;
        this.mouse = new THREE.Vector2(0, 0);
        this.delta = new THREE.Vector2(0, 0);

        this.texParticle = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDMzU4N0I4NzUzREExMUU1OUQyNjk5NEY1MTVBMDVENSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDMzU4N0I4ODUzREExMUU1OUQyNjk5NEY1MTVBMDVENSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkMzNTg3Qjg1NTNEQTExRTU5RDI2OTk0RjUxNUEwNUQ1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkMzNTg3Qjg2NTNEQTExRTU5RDI2OTk0RjUxNUEwNUQ1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+hy5lzAAAALtJREFUeNqkk18LwiAUxcWGQWvsoV6i7//t6kHaosRmRzjCZaCN7uAH6t0995/alJLRYI3y6xrnDuQACwggbhU4ggEcwA58wBM8wPRLIDufyMgscnTPtVmLdKv1QOcrOIM9eIMb/wktAce0RzpfQA9mEdm3SrCs2TFyTyHDvaO9KrCwYYFpl8gz94H2qkBgt72oWfbA014ViByV7Lacwp325hgnkY3/5x4UkZfmJpZy4pa3oH5MaoGvAAMADb5mkuzBUoQAAAAASUVORK5CYII=";

        this.createScene();
    }

    createScene()
    {
        // const OrbitControls = OC(THREE);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
        this.camera.position.set(0, 10, 240);
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.maxDistance = 500;

        this.scene = new THREE.Scene();

        this.loader = new THREE.ColladaLoader();
        this.loader.options.convertUpAxis = true;

        this.dae = null;

        var light = new THREE.HemisphereLight( 0xffeeee, 0x111122 );
        this.scene.add( light );

        this.createParticleBackground();
    }

    listen(on = 'on')
    {
        eve[on](this.renderer.domElement, 'mousedown', this.onMouseDown.bind(this));
        eve[on](this.renderer.domElement, 'mouseup', this.onMouseUp.bind(this));
        eve[on](this.renderer.domElement, 'mousemove', this.onMouseMove.bind(this));
    }

    rotateObject()
    {
        let amount = 180;
        this.dae.rotation.x += (this.delta.y / amount) * .05;
        this.dae.rotation.y += (this.delta.x / amount) * .05;
    }

    onMouseUp(e)
    {
        e.preventDefault();
        this.mouseDown = false;
    }

    onMouseMove(e)
    {
        e.preventDefault();
        if(!this.mouseDown) return;

        this.delta.x = e.clientX - this.mouse.x;
        this.delta.y = e.clientY - this.mouse.y;

        this.rotateObject();
    }

    onMouseDown(e)
    {
        e.preventDefault();
        this.mouseDown = true;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    showArtist(direction)
    {
        window.APP.ui.showLoading(true, true);

        this.direction = direction;
        let data = window.APP.artists[window.APP.currentArtist];
        let url = this.getURL(data.model);
        this.listen('off');
        this.loader.load(url, this.onLoaded.bind(this));
    }

    onLoaded(collada)
    {
        // if(this.dae) this.scene.remove(this.dae);

        let offset = this.direction == 1 ? 300 : -300;

        let tempDae = collada.scene;
        tempDae = tempDae;
        tempDae.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                child.geometry.computeFaceNormals();
                child.material.shading = THREE.FlatShading;

            }

        } );

        tempDae.scale.x = tempDae.scale.y = tempDae.scale.z = 100.0;
        tempDae.position.x = offset;

        tempDae.updateMatrix();
        this.scene.add(tempDae);

        var timeline = new TimelineMax({paused: true, onComplete: ()=>{
            if(this.dae)
            {
                this.scene.remove(this.dae);
            }

            this.dae = tempDae;
            this.listen('on');
            window.APP.ui.showLoading(false, true);
        }})

        if(this.dae)
        {
            timeline.add( TweenMax.to(this.dae.position, 2, {ease: Power2.easeInOut, x: -offset}) , 0);
        }

        timeline.add( TweenMax.to(tempDae.position, 2, {ease: Power2.easeInOut, x: 0}), 0);

        timeline.play()

        // this.scene.add(this.dae);
    }

    getURL(url)
    {
        let parsed = URL.parse(url, true);
        return "https://googledrive.com/host/" + parsed.query.id + "?r=" + UtilsP.rrandom(9999);
    }

    createParticleBackground()
    {
        var pointMaterial = new THREE.PointCloudMaterial({
            size: 10, sizeAttenuation: true, color: 0xFFFFFF, transparent: true,
            map: THREE.ImageUtils.loadTexture(this.texParticle),
            blending: THREE.AdditiveBlending
        })

        var radius = 600;
        var particles = 700;
        var particlesGeom = new THREE.BufferGeometry();
        var positions = new Float32Array( particles * 3 );

        for( var v = 0; v < particles; v++ ) {
            positions[ v * 3 + 0 ] = ( Math.random() * 2 - 1 ) * radius;
            positions[ v * 3 + 1 ] = ( Math.random() * 2 - 1 ) * radius;
            positions[ v * 3 + 2 ] = ( Math.random() * 2 - 1 ) * radius;
        }

        particlesGeom.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
        this.particleSystem = new THREE.PointCloud( particlesGeom, pointMaterial );
        this.scene.add( this.particleSystem );
    }

    render()
    {
        this.particleSystem.rotation.y -= .0005;
        this.renderer.render(this.scene, this.camera);
    }

    onResize()
    {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}

export default SceneGallery;