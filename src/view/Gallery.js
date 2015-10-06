import THREE  from 'three.js'; 
import URL    from 'url';
import eve    from 'dom-events';
import UtilsP from 'utils-perf';

const objLoaders = require('../utils/OBJLoader')(THREE);

class Gallery 
{
    constructor(scene, renderDom, camera) {

        this.objectMesh = null;

        this.camera = camera;
         
        this.mouseX = 0;
        this.mouseY = 0;
         
        this.wireframeAnim = null;
        
        this.scene     = scene;
        this.renderDom = renderDom;

        this.wireframeIn = false;

        this.flickring = [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 1, 1, 2, 1, 2];

        this.createScene();
    }

    createScene()
    {
        this.container = new THREE.Object3D();
        this.raycaster = new THREE.Raycaster();

        this.scene.add(this.container);

        this.loader = new THREE.OBJLoader();
        // this.loader.options.convertUpAxis = true;

        this.dae = null;
    }

    listen(on = 'on')
    {
        if(on == 'off') {
            window.APP.landing.scene.controls.enabled = false;
            eve.off(this.renderDom, 'mousemove', this.onMouseMoveRaycaster.bind(this));
        } else {
            eve.once(this.renderDom, 'mousemove', this.onMouseMove.bind(this));
        }
    }

    animateOut()
    {
        TweenMax.to(this.container, .6, {z: 200});
    }

    onMouseMove(e)
    {
        e.preventDefault();

        // console.log(e.clientX, e.clientY)
        window.APP.landing.scene.controls.enabled = true;
        window.APP.landing.scene.controls.rotateStart.set( e.clientX, e.clientY );

        eve.on(this.renderDom, 'mousemove', this.onMouseMoveRaycaster.bind(this));
    }

    onMouseMoveRaycaster()
    {
        if(!this.dae) return;

        var mouse = new THREE.Vector2();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        this.raycaster.setFromCamera( mouse, this.camera )

        var intersects = this.raycaster.intersectObjects( [this.dae, this.dae.children[0]] );

        if(intersects.length < 1)
        {
            if(this.intervalBackToMaterial == 0) this.intervalBackToMaterial = setTimeout(this.toggleWireframe.bind(this), 300, false);
            return;
        }

        clearTimeout(this.intervalBackToMaterial);
        this.intervalBackToMaterial = 0;
        this.toggleWireframe(true);
    }

    showArtist(direction)
    {
        this.material = new THREE.MeshPhongMaterial({
          shading            : THREE.FlatShading,
          color              : new THREE.Color(window.APP.landing.scene.p.modelMeshColor),
          specular           : new THREE.Color(window.APP.landing.scene.p.modelMeshSpecular),
          emissive           : new THREE.Color(window.APP.landing.scene.p.modelMeshEmissive),
          shininess          : window.APP.landing.scene.p.modelShininess,
          wireframe          : false,
          transparent        : true,
          metal : true,
          wireframeLinewidth : .1
        })

        this.targetRotationX = 0;
        this.targetRotationOnMouseDownX = 0;
         
        this.targetRotationY = 0;
        this.targetRotationOnMouseDownY = 0;
         
        this.mouseX = 0;
        this.mouseXOnMouseDown = 0;
         
        this.mouseY = 0;
        this.mouseYOnMouseDown = 0;
         
        this.finalRotationY = 0;

        this.direction = direction;
        let data = window.APP.artists[window.APP.currentArtist];
        let url = this.getURL(data.model);
        this.listen('off');
        this.loader.load(url, this.onLoaded.bind(this));
    }

    toggleWireframe(on = true)
    {
        if(!this.dae && !this.objectMesh) return;

        if(on) {
            if(!this.wireframeIn) {
                this.hoverCallback = this.animateWireframe;
                this.animateInShader();
            }

        } else {

            if(this.wireframeIn) {
                if(this.wireframeAnim) this.wireframeAnim.pause();
                this.hoverCallback = null;
                this.animateInShader();
            }
        }

        this.objectMesh.material.needsUpdate = true;
    }

    animateWireframe()
    {
        if(!this.dae && !this.objectMesh) return;

        this.makeItWireframe();

        this.wireframeAnim = new TimelineMax({onUpdate: () => {this.objectMesh.material.needsUpdate = true;}});
        this.wireframeAnim.add( TweenMax.to(this.objectMesh.material, 1.8, { opacity: .1, yoyo: true, repeat: -1, ease: Linear.easeNone}), 0 )
    }

    animateInShader()
    {
        clearTimeout(this.intervFlick);
        this.intervFlick = 0;

        this.animFlick = [];

        for (var i = 0; i < this.flickring.length; i++) {
            if(this.flickring[i] % 2 == 0)
            {
                this.animFlick.push("makeItWireframe"); 
            } else {
                this.animFlick.push("updateColours"); 
            }
        };

        this.animFlick.push("updateColours");
        this.processQueue();
    }

    processQueue()
    {
        if(this.animFlick.length < 1) {
            // console.log(this.hoverCallback)
            if(this.hoverCallback) this.hoverCallback();
            this.hoverCallback = null
            // console.log('flickring finished');
            return;
        };

        let action = this[this.animFlick[0]].bind(this);

        this.intervFlick = setTimeout( action , 32, this.processQueue.bind(this) );
        this.animFlick.shift();
        
    }

    makeItWireframe(callback)
    {
        window.APP.soundManager.flickPlay();
        this.objectMesh.material.wireframe = true;
        this.objectMesh.material.emissive = new THREE.Color(0xFFFFFF);
        // this.objectMesh.material.specular = new THREE.Color(0xFFFFFF);
        this.objectMesh.material.needsUpdate = true;
        this.wireframeIn = true;
        if(callback) callback();
    }

    onLoaded(obj)
    {
        // if(this.dae) this.container.remove(this.dae);

        let offset  = this.direction == 1 ? 1 : -1;
        let radius  = 0
        let tempDae = obj;
        let scale   = 1;
        this.wireframeAnim = null;
        // let mesh = null

        tempDae.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                this.objectMesh = child;

                this.objectMesh.geometry.computeFaceNormals();
                this.objectMesh.geometry.computeBoundingSphere();

                // mesh = THREE.SceneUtils.createMultiMaterialObject(this.objectMesh.geometry, );
                
                this.objectMesh.material = this.material
                // this.objectMesh.castShadow = true;
                // this.objectMesh.receiveShadow = true;

                radius = this.objectMesh.geometry.boundingSphere.radius
                scale  = (window.innerHeight * .25) / (radius * 2);
                // console.log(radius, scale)

                this.objectMesh.material.needsUpdate = true;
            }

        }.bind(this) );

        tempDae.scale.x = tempDae.scale.y = tempDae.scale.z = scale;
        tempDae.position.x = (window.innerWidth / 2) * offset;
        // tempDae.position.y = (radius * scale);
        tempDae.position.z = -250;

        tempDae.updateMatrix();
        this.container.add(tempDae);

        var timeline = new TimelineMax({paused: true, onComplete: ()=>{

            window.APP.ui.changeCopyArtist();

            if(this.dae) this.container.remove(this.dae);
            this.dae = tempDae;
            this.listen('on');
            window.APP.ui.showLoading(false, true);
        }})

        if(this.dae)
        {
            timeline.add( TweenMax.to(this.dae.position, 1.8, {ease: Quart.easeInOut, x: -(window.innerWidth / 2) * offset}) , 0);
        }

        timeline.add( TweenMax.to(tempDae.position, 1.8, {ease: Quart.easeInOut, x: 0}), 0);

        timeline.play()

        // this.container.add(this.dae);
    }

    updateColours(callback)
    {
        if(!this.dae && !this.objectMesh) return;

        this.objectMesh.material.color = new THREE.Color(window.APP.landing.scene.p.modelMeshColor);
        this.objectMesh.material.specular = new THREE.Color(window.APP.landing.scene.p.modelMeshSpecular);
        this.objectMesh.material.emissive = new THREE.Color(window.APP.landing.scene.p.modelMeshEmissive);
        this.objectMesh.material.shininess = window.APP.landing.scene.p.modelShininess;
        this.objectMesh.material.opacity = 1;
        this.objectMesh.material.wireframe = false;

        this.wireframeIn = false;

        this.objectMesh.material.needsUpdate = true;

        if(callback && typeof(callback) == 'function') callback();
    }

    getURL(url)
    {
        let parsed = URL.parse(url, true);
        if(parsed.host === null) return url;
        return "https://googledrive.com/host/" + parsed.query.id + "?r=" + UtilsP.rrandom(9999);
    }

    update()
    {
    }

    onResize()
    {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}

export default Gallery;