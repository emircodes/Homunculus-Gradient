import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gsap } from "gsap";
import * as dat from "dat.gui";

// Import shaders
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";

import t1 from '../img/img1.jpg'
import t2 from '../img/img2.jpg'
import t3 from '../img/img3.jpg'

// The correct import paths for the postprocessing library are:

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { CustomPass } from "./CustomPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { DotScreenShader } from "three/examples/jsm/shaders/DotScreenShader.js";

//import { EffectComposer } from 'three/jsm/addons/postprocessing/EffectComposer.js';
//import { RenderPass } from 'three/jsm/addons/postprocessing/RenderPass.js';
//import { ShaderPass } from 'three/jsm/addons/postprocessing/ShaderPass.js';
//import { RGBShiftShader } from 'three/jsm/addons/shaders/RGBShiftShader.js';
//import { DotScreenShader } from 'three/jsm/addons/shaders/DotScreenShader.js';
//import { OutputPass } from 'three/jsm/addons/postprocessing/OutputPass.js';



export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.urls = [t1, t2, t3];

    this.textures = this.urls.map(url=>new THREE.TextureLoader().load(url))
    //console.log(this.textures)

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    //this.width = window.innerWidth;
    //this.height = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    this.renderer.setSize(this.width, this.height);
    //this.renderer.setClearColor(0xeeeeee, 1); // White BG
    this.renderer.setClearColor(0x000000, 1); // Black BG
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    //this.container = document.getElementById("container");
    //this.width = this.container.offsetWidth;
    //this.height = this.container.offsetHeight;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      0.01,
      1000
    );
    this.camera.position.set(0, 0, 2);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    //this.paused = false;
    this.isPlaying = true;

    this.initPost();

    //this.setupResize();
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    this.settings();

    console.log(this.width, this.height)
    console.log(this.urls)
    console.log(this.textures)

    
  }

  initPost() {

    this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( new RenderPass( this.scene, this.camera ) );

		this.effect1 = new ShaderPass( CustomPass ); // Note: Adjust Shader (DotScreenShader -> CustomPass)
		//this.effect1.uniforms[ 'scale' ].value = 2;
		this.composer.addPass( this.effect1 );

		//const effect2 = new ShaderPass( RGBShiftShader );
		//effect2.uniforms[ 'amount' ].value = 0.0015;
		//this.composer.addPass( effect2 );

  }

  //settings
  settings(){
    let that = this;
    this.settings = {
      progress: 0,
      scale: 1,
    };

    this.gui = new dat.GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01);
    this.gui.add(this.settings, "scale", 0, 10, 0.01);

  }


  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    // Update material resolution
    //const a1 = this.width / this.height > this.imageAspect ? 
    //  this.width / this.height * this.imageAspect : 1;
    //const a2 = this.width / this.height > this.imageAspect ? 
    //  1 : this.height / this.width / this.imageAspect;
    //
    //this.material.uniforms.resolution.value.set(this.width, this.height, a1, a2);
  }

  addObjects() {
    this.imageAspect = 853 / 1280; // Adjust this as needed
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uTexture: { value: this.textures[0] },
        resolution: { value: new THREE.Vector4() },
        uvRate1: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.geometry = new THREE.PlaneGeometry(1.9/2, 1/2, 1, 1); // Note: Adjust Image sizing

    this.meshes = [];

    this.textures.forEach((t,i)=>{
      let m = this.material.clone();
      m.uniforms.uTexture.value = t;
      let mesh = new THREE.Mesh(this.geometry, m);
      this.scene.add(mesh);
      this.meshes.push(mesh);
      mesh.position.x = i - 1; // Note: Adjust Image Position (Centering it)
      //mesh.position.y = -1
      //mesh.rotation.z = Math.PI/2
    })

    //this.plane = new THREE.Mesh(this.geometry, this.material);
    //this.scene.add(this.plane);
  }

  render() {
    //if (this.paused) return;

    this.meshes.forEach((m,i)=>{
      m.position.y = -this.settings.progress
      m.rotation.z = -this.settings.progress*Math.PI/2
    })
    this.time += 0.003;
    this.material.uniforms.time.value = this.time;

    this.effect1.uniforms['time'].value = this.time;
    this.effect1.uniforms['progress'].value = this.settings.progress;
    this.effect1.uniforms['scale'].value = this.settings.scale;
    requestAnimationFrame(this.render.bind(this));
    //this.renderer.render(this.scene, this.camera);

    this.composer.render();
  }

}

//new Sketch("container");
new Sketch({
  dom: document.getElementById("container")
});
