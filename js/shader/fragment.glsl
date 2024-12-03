uniform float time;
uniform float progress;
//uniform sampler2D texture1;
uniform sampler2D uTexture; // Set this to uTexture (Refer app.js)
uniform vec4 resolution;
varying vec2 vUv;
varying vec4 vPosition;

void main()	{
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	vec4 color = texture2D(uTexture, vUv);
	gl_FragColor = vec4(vUv,0.0,1.);
	gl_FragColor = color;
}