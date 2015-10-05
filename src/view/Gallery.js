import THREE  from 'three.js'; 
import URL    from 'url';
import eve    from 'dom-events';
import UtilsP from 'utils-perf';

const objLoaders = require('../utils/OBJLoader')(THREE);

class Gallery 
{
    constructor(scene, renderDom) {

        this.targetRotationX = 0;
        this.targetRotationOnMouseDownX = 0;
         
        this.targetRotationY = 0;
        this.targetRotationOnMouseDownY = 0;
         
        this.mouseX = 0;
        this.mouseXOnMouseDown = 0;
         
        this.mouseY = 0;
        this.mouseYOnMouseDown = 0;
         
        this.finalRotationY = 0;

        this.wireframeAnim = null;
        
        this.scene     = scene;
        this.renderDom = renderDom;

        this.createScene();
    }

    createScene()
    {
        this.container = new THREE.Object3D();
        // this.container.castShadow = true;
        // this.container.receiveShadow = true;

        this.scene.add(this.container);

        this.loader = new THREE.OBJLoader();
        // this.loader.options.convertUpAxis = true;

        this.dae = null;
    }

    listen(on = 'on')
    {
        if(on == 'off') {
            window.APP.landing.scene.controls.enabled = false;
        } else {
            eve.once(this.renderDom, 'mousemove', this.onMouseMove.bind(this));
        }
        // window.APP.landing.scene.controls.enabled = on == 'on';
        // return;
        // eve[on](this.renderDom, 'mousedown', this.onMouseDown.bind(this));
        // eve[on](this.renderDom, 'mouseup', this.onMouseUp.bind(this));
    }

    animateOut()
    {
        TweenMax.to(this.container, .6, {z: 200});
    }

    rotateObject()
    {
        let amount = 180;
        this.dae.rotation.x += (this.delta.y / amount) * .05;
        this.dae.rotation.y += (this.delta.x / amount) * .05;
    }

    // onMouseUp(e)
    // {
    //     e.preventDefault();
    //     this.mouseDown = false;
    // }

    onMouseMove(e)
    {
        e.preventDefault();

        // console.log(e.clientX, e.clientY)
        window.APP.landing.scene.controls.enabled = true;
        window.APP.landing.scene.controls.rotateStart.set( e.clientX, e.clientY );
        // eve.off(this.renderDom, 'mousemove', this.onMouseMove.bind(this));

        // 
        // if(!this.mouseDown) return;
        // this.mouseX = event.clientX - (window.innerWidth / 2);
        // this.mouseY = event.clientY - (window.innerHeight / 2);
 
        // this.targetRotationY = this.targetRotationOnMouseDownY + (this.mouseY - this.mouseYOnMouseDown) * 0.02;
        // this.targetRotationX = this.targetRotationOnMouseDownX + (this.mouseX - this.mouseXOnMouseDown) * 0.02;
    }

    // onMouseDown(e)
    // {
    //     this.mouseDown = true;
    //     e.preventDefault();

    //     this.mouseXOnMouseDown = event.clientX - (window.innerWidth / 2);
    //     this.targetRotationOnMouseDownX = this.targetRotationX;
 
    //     this.mouseYOnMouseDown = event.clientY - (window.innerHeight / 2);
    //     this.targetRotationOnMouseDownY = this.targetRotationY;

    // }

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
          wireframeLinewidth : 1
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
        if(!this.dae) return;

        this.dae.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                child.material.wireframe = on

                if(on) {
                    // this.material.shading = THREE.SmoothShading;
                    this.animateWireframe();
                } else {
                    // this.material.shading = THREE.FlatShading;
                    this.updateColours();
                    this.wireframeAnim.pause();
                }

                child.material.needsUpdate = true;
            }

        }.bind(this) );
    }

    animateWireframe()
    {
        if(!this.dae) return;

        this.dae.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {

                child.material.emissive = new THREE.Color(0xBCBFB4);
                child.material.specular = new THREE.Color(0xFFFFFF);

                this.wireframeAnim = TweenMax.to(child.material, 1, {
                    opacity  : .4,
                    wireframeLinewidth : 5
                    // specular : {}, 
                    // emissive : {r: 1, g: 1, b: 1},

                    // r: b.r, g: b.g, b: b.b

                    ,ease: Linear.easeNone

                    ,onUpdate : () => {
                        child.material.needsUpdate = true;
                    }, 
                    yoyo: true, repeat: -1, delay: .2
                });
            }
        }.bind(this) );
    }

    onLoaded(obj)
    {
        // if(this.dae) this.container.remove(this.dae);

        let offset  = this.direction == 1 ? 1 : -1;
        let radius  = 0
        let tempDae = obj;
        let scale   = 1;
        // let mesh = null

        tempDae.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                child.geometry.computeFaceNormals();
                child.geometry.computeBoundingSphere();

                // mesh = THREE.SceneUtils.createMultiMaterialObject(child.geometry, );
                
                child.material = this.material
                // child.castShadow = true;
                // child.receiveShadow = true;

                radius = child.geometry.boundingSphere.radius
                scale  = (window.innerHeight * .25) / (radius * 2);
                // console.log(radius, scale)

                child.material.needsUpdate = true;
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

    updateColours()
    {
        if(!this.dae) return;

        this.dae.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                child.material.color = new THREE.Color(window.APP.landing.scene.p.modelMeshColor);
                child.material.specular = new THREE.Color(window.APP.landing.scene.p.modelMeshSpecular);
                child.material.emissive = new THREE.Color(window.APP.landing.scene.p.modelMeshEmissive);
                child.material.shininess = window.APP.landing.scene.p.modelShininess;
                child.material.opacity = 1;

                child.material.needsUpdate = true;
            }

        }.bind(this) );
        
    }

    getURL(url)
    {
        let parsed = URL.parse(url, true);
        if(parsed.host === null) return url;
        return "https://googledrive.com/host/" + parsed.query.id + "?r=" + UtilsP.rrandom(9999);
    }

    update()
    {
        if(!this.dae) return;

        this.dae.rotation.y += ( this.targetRotationX - this.dae.rotation.y ) * 0.05;
        this.finalRotationY = (this.targetRotationY - this.dae.rotation.x); 
        this.dae.rotation.x += this.finalRotationY * 0.05;

        this.dae.rotation.x %= 360;
        this.dae.rotation.y %= 360;

        // if (this.dae.rotation.x  <= 1 && this.dae.rotation.x >= -1 ) {
            
        //     }

         // if (this.dae.rotation.x  > 1 ) {
         //    this.dae.rotation.x = 1
         //    }
     
         // if (this.dae.rotation.x  < -1 ) {
         //    this.dae.rotation.x = -1
         //    }
    }

    onResize()
    {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}

export default Gallery;