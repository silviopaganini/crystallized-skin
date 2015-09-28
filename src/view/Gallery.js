import THREE  from 'three'; 
import URL    from 'url';
import eve    from 'dom-events';
import UtilsP from 'utils-perf';

const objLoaders = require('../utils/OBJLoader')(THREE);

class Gallery 
{
    constructor(scene, renderDom) {

        this.mouseDown = false;
        this.mouse     = new THREE.Vector2(0, 0);
        this.delta     = new THREE.Vector2(0, 0);
        
        this.scene     = scene;
        this.renderDom = renderDom;

        this.createScene();
    }

    createScene()
    {
        this.container = new THREE.Object3D();
        this.container.castShadow = true;
        this.container.receiveShadow = true;

        this.scene.add(this.container);

        this.loader = new THREE.OBJLoader();
        // this.loader.options.convertUpAxis = true;

        this.dae = null;
    }

    listen(on = 'on')
    {
        // eve[on](this.renderDom, 'mousedown', this.onMouseDown.bind(this));
        // eve[on](this.renderDom, 'mouseup', this.onMouseUp.bind(this));
        // eve[on](this.renderDom, 'mousemove', this.onMouseMove.bind(this));
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
        this.materials = new THREE.MeshPhongMaterial({
          // color     : new THREE.Color(window.APP.landing.scene.p.modelWireColour),
          shading   : THREE.FlatShading,
          color     : 0x4e514e,
          specular  : 0xfffefe,
          emissive  : 0x101110,
          shininess : 30,
        })

        this.direction = direction;
        let data = window.APP.artists[window.APP.currentArtist];
        let url = this.getURL(data.model);
        this.listen('off');
        this.loader.load(url, this.onLoaded.bind(this));
    }

    onLoaded(obj)
    {
        // if(this.dae) this.container.remove(this.dae);

        let offset = this.direction == 1 ? 300 : -300;

        let tempDae = obj;
        let scale = 1;
        // let mesh = null

        tempDae.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {

                child.geometry.computeFaceNormals();
                child.geometry.computeBoundingSphere();

                // mesh = THREE.SceneUtils.createMultiMaterialObject(child.geometry, );
                
                child.material = this.materials
                child.castShadow = true;
                child.receiveShadow = true;

                scale = ((window.innerWidth * .5) * .4) / (child.geometry.boundingSphere.radius * 2);
                child.material.needsUpdate = true;
            }

        }.bind(this) );

        tempDae.scale.x = tempDae.scale.y = tempDae.scale.z = scale;
        tempDae.position.x = offset;
        tempDae.position.y = -20;

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
            timeline.add( TweenMax.to(this.dae.position, 1.8, {ease: Quart.easeInOut, x: -offset}) , 0);
        }

        timeline.add( TweenMax.to(tempDae.position, 1.8, {ease: Quart.easeInOut, x: 0}), 0);

        timeline.play()

        // this.container.add(this.dae);
    }

    updateWireColour(c)
    {
        if(!this.dae) return;
        this.dae.traverse( function ( child ) {

            if ( child instanceof THREE.Mesh ) {
                let a = new THREE.Color(c);
                child.material.color = a;
                child.material.needsUpdate = true;
            }
        } );
    }

    getURL(url)
    {
        let parsed = URL.parse(url, true);
        if(parsed.host === null) return url;
        return "https://googledrive.com/host/" + parsed.query.id + "?r=" + UtilsP.rrandom(9999);
    }

    render()
    {
        this.particleSystem.rotation.y -= .0005;
        this.renderer.render(this.container, this.camera);
    }

    onResize()
    {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}

export default Gallery;