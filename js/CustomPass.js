import {
	Vector2
} from 'three';

/**
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

const CustomPass = {

	//name: 'DotScreenShader',

	uniforms: {

		'tDiffuse': { value: null },
        'time': { value: 0 },
        'scale': { value: 1 },
        'progress': { value: 0 },
		'tSize': { value: new Vector2( 256, 256 ) },
		'center': { value: new Vector2( 0.5, 0.5 ) },
		'angle': { value: 1.57 },
		'scale': { value: 1.0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform vec2 center;
		uniform float angle;
        uniform float time; // add time
        uniform float scale; // add scale   
        uniform float progress; // add progress
		//uniform float scale;
		uniform vec2 tSize;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		float pattern() {

			float s = sin( angle ), c = cos( angle );

			vec2 tex = vUv * tSize - center;
			vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;

			return ( sin( point.x ) * sin( point.y ) ) * 4.0;

		}

		void main() {

            vec2 newUV = vUv;

            //newUV = vUv + 0.1*vec2(sin(10.*vUv.x),sin(10.*vUv.y));

            

			//float average = ( color.r + color.g + color.b ) / 3.0;

			//gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );

            
            
            // Let p = centeredUV
            vec2 p = 2.*vUv - vec2(1.);

            //float scale = 1.;

            p += 0.1*cos(scale*3.*p.yx + time + vec2(1.2, 3.4));
            p += 0.1*cos(scale*3.7*p.yx + 1.4*time + vec2(2.2, 3.4));
            p += 0.1*cos(scale*5.*p.yx + 2.6*time + vec2(4.2, 1.4));
            p += 0.3*cos(scale*7.*p.yx + 3.6*time + vec2(10.2, 3.4));

			

            //newUV = vUv + centeredUV*vec2(1.,0.);

            //newUV.x = length(centeredUV);
            //newUV.y = 0.;

            newUV.x = mix(vUv.x, length(p), progress);
            newUV.y = mix(vUv.y, 0., progress);

            vec4 color = texture2D( tDiffuse, newUV ); //Note: vUv -> newUV
            
            gl_FragColor = color;
            //gl_FragColor = vec4(length(p),0., 0.0, 1.0);

		}`

};

export { CustomPass };
