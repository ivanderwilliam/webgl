"use strict";

var canvas;
var gl;
var gl_program;

var points = [];

var NumTimesToSubdivide = 1;
var twistAngle = 1;
var lowIntensity;
var highIntensity;

var color;
var uAngle;

var buffer_vertex;

var renderEdges

window.onload = function init()
{
    // Load javascript functions
	loadFunctions();

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -0.5, -0.5 ),
        vec2(    0,  0.5 ),
        vec2(  0.5, -0.5 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    //gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    gl_program = program;

    // Load the data into the GPU

    // ---------- Vertices buffer
    var bufferId = gl.createBuffer();
    buffer_vertex = bufferId;

    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var uColor = gl.getUniformLocation(program, "a_color");
    color = uColor;

    uAngle = gl.getUniformLocation(program, "theta");
    gl.uniform1f(uAngle, 0);

    render();
};

function tessellate()
{
    // Reset the points array, to start over the tessellation process
    points = [];

    var vertices = [
        vec2( -0.5, -0.5 ),
        vec2(    0,  0.5 ),
        vec2(  0.5, -0.5 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);

    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( gl_program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    var uColor = gl.getUniformLocation(gl_program, "a_color");
    color = uColor;

    uAngle = gl.getUniformLocation(gl_program, "theta");
    gl.uniform1f(uAngle, 0);


    render();
}

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{
    // check for end of recursion
    if ( count <= 0 ) {     // Tava fazendo recursões infinitas (count negativo) com count === 0
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );        
        divideTriangle( b, bc, ab, count );

        // Recursively divide the new triangle as well
        divideTriangle(ab, ac, bc, count);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    // Triangle twist
    var hasTwist = document.getElementById("checkbox-twist").checked;
    if(hasTwist)
    {
        updateTwistIntesity();
        gl.uniform1f(uAngle, twistAngle);
    }
    
    // Draw triangles
    gl.uniform4fv(color,  [1.0, 0.0, 0.0, 1.0]);
    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    
    // Triangle edges
    if(renderEdges)
    {
        // Set color to black
        gl.uniform4fv(color,  [0.0, 0.0, 0.0, 1.0]);

        // Draw edges, one triangle at time
        for (var i = 0; i <= points.length - 3; i += 3)
        {
            gl.drawArrays(gl.LINE_LOOP, i, 3);
        }
    }    
}

function loadFunctions()
{
    lowIntensity   = document.getElementById("r1");
    highIntensity = document.getElementById("r2");

    document.getElementById("checkbox-edge").onclick = function()
    {
        if(this.checked)
        {
            renderEdges = true;
        }
        else
        {
            renderEdges = false;
        }

        render();
    }

    document.getElementById("checkbox-twist").onclick = function()
    {
        if(this.checked)
        {
            updateTwistIntesity();
            gl.uniform1f(uAngle, twistAngle);
        }
        else
        {
            gl.uniform1f(uAngle, 0);    
        }

        render();
    }

    var slider = document.getElementById("slider-subdivisions");
    if(slider)
    {
        slider.onchange = function()
        {
            NumTimesToSubdivide = slider.value;
            document.getElementById("current-subdivision").innerHTML = "(" + NumTimesToSubdivide.toString() + ")";
            tessellate();
        }
    }

    document.getElementsByName("intensity").onchange = function()
    {
        render();
    }
}

function updateTwistIntesity()
    {       

        if(lowIntensity.checked)
        {            
            twistAngle = lowIntensity.value;
        }
        else
        {
            twistAngle = highIntensity.value;
        }
    }