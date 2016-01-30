// Control
var gl;
var program;
var animation = true;
var worldRotation = false;
var isPerspective = true;
var rotateAroundExtraAxis = false;

var rotationQueue = [];

// Attribute locations
var aPosition;
var aColor;

// Parameters
var translation = [0.0, 0.0, 0.0];
var rotation    = [0.0, 0.0, 0.0];
var scaling     = [1.0, 1.0, 1.0];

// World Attributes
var WORLD_ROTATION_MATRIX = mat4();
var modelViewMatrix;
var perspectiveMatrix;
var orthoMatrix;

// Uniforms' Location
var matrixLocation;
var SCALE_MATRIX;
var ROTATION_MATRIX;
var TRANSLATION_MATRIX;
var modelViewLoc;
var perspectiveLoc;

// Attributes Location
var VERTEX_LOC;
var COLOR_LOC;

// Camera Parameters
var camEye = vec3(2.0, 2.0, 3.0);
var camAt  = vec3(0, 0, 0);
var camUp  = vec3(0, 1, 0);
var camRotationSpeed = 1.0;

// Cube vertices and colors array
var points = [];
var colors = [];

// Objects
var cube;
var cubeAxes;
var groundLines;
var extraAxis;

window.onload = function init()
{
    linkHTML();
    initGL();
    initShader();

    uniformsLookup();
    attributesLookup();

    initObjects();  

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    render();
}

function initGL()
{
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
}

function initShader()
{
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
}

function initObjects()
{
    colorCube();
    cube = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    cube.initBuffers();

    var axesV = generateAxesPoints();
    var axesC = generateAxesColors();
    cubeAxes = new ObjectGL(gl, program, axesV, axesC, gl.LINES);
    cubeAxes.initBuffers();
    cube.addChildren(cubeAxes);

    var lineV = generateLinePoints();
    var lineC = generateLineColors();
    groundLines = new ObjectGL(gl, program, lineV, lineC, gl.LINES);
    groundLines.initBuffers();

    var newAxisV = generateExtraAxisPoints();
    var newAxisC = generateExtraAxisColors();
    extraAxis = new ObjectGL(gl, program, newAxisV, newAxisC, gl.LINES);
    extraAxis.initBuffers();
    extraAxis.enable = false;
    cube.addChildren(extraAxis);
}

function attributesLookup()
{
    VERTEX_LOC = gl.getAttribLocation(program, "a_position");
    COLOR_LOC = gl.getAttribLocation(program, "vColor");    
}

function uniformsLookup()
{
    SCALE_MATRIX       = gl.getUniformLocation(program, "u_scale");
    ROTATION_MATRIX    = gl.getUniformLocation(program, "u_rotation");
    TRANSLATION_MATRIX = gl.getUniformLocation(program, "u_translation");
    modelViewLoc   = gl.getUniformLocation(program, "u_modelView");
    projectionLoc  = gl.getUniformLocation(program, "u_projection");
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    calculateMatrices();

    gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelViewMatrix));

    if(isPerspective)
    {
        gl.uniformMatrix4fv(projectionLoc, false, flatten(perspectiveMatrix));
    }
    else
    {
        gl.uniformMatrix4fv(projectionLoc, false, flatten(orthoMatrix));
    }

    if(worldRotation)
    {
        rotateCamera();
    }

    if(rotateAroundExtraAxis)
    {
        cube.rotateZ(1.0);
    }

    cube.render();
    cubeAxes.render();
    extraAxis.render();
    groundLines.render();

    if(animation)
    {
        incrementRotation();
        requestAnimFrame(render);
    }
}


////////////////////////////////////////////////////////////////////////////
//                     TRANSFORMATION GENERATORS                          //
////////////////////////////////////////////////////////////////////////////

function calculateMatrices()
{
    translationMatrix     = translate(translation[0], translation[1], translation[2]);

    var rotationXMatrix   = rotateX(rotation[0]);
    var rotationYMatrix   = rotateY(rotation[1]);
    var rotationZMatrix   = rotateZ(rotation[2]);
    WORLD_ROTATION_MATRIX = mult(rotationZMatrix, rotationYMatrix);
    WORLD_ROTATION_MATRIX = mult(WORLD_ROTATION_MATRIX, rotationXMatrix);
    
    scaleMatrix           = scalem(scaling[0], scaling[1], scaling[2]);

    modelViewMatrix   = lookAt(camEye, camAt, camUp);

    perspectiveMatrix = perspective(45, canvas.width/canvas.height, 0.3, 50.0);
    orthoMatrix       = ortho(-3.0, 3.0, -2.0, 2.0, -100.0, 100.0);

}

function rotateCamera()
{
    var x = camEye[0];
    var z = camEye[2];

    var angle = radians(camRotationSpeed);

    camEye[0] = x * Math.cos(angle) + z * Math.sin(angle);
    camEye[2] = z * Math.cos(angle) - x * Math.sin(angle);
}

////////////////////////////////////////////////////////////////////////////
//                          HELPER FUNCTIONS                              //
////////////////////////////////////////////////////////////////////////////

function projectionMode()
{
    var orthoMode = document.getElementById("ortho-mode");

    if(orthoMode != null)
    {
        if(orthoMode.checked)
        {
            isPerspective = false; 
        }
        else
        {
            isPerspective = true;
        }
    }    
}

function incrementRotation()
{
    if(isXChecked())
    {
        cube.rotateX(2.0);
    }

    if(isYChecked())
    {
        cube.rotateY(2.0);
    }

    if(isZChecked())
    {
        cube.rotateZ(2.0);
    }
}

function isXChecked()
{
    var rotateX = document.getElementById("rotate-over-x");
    if(rotateX)
    {
        return rotateX.checked;
    }
}

function isYChecked()
{
    var rotateY = document.getElementById("rotate-over-y");
    if(rotateY)
    {
        return rotateY.checked;
    }
}

function isZChecked()
{
    var rotateZ = document.getElementById("rotate-over-z");
    if(rotateZ)
    {
        return rotateZ.checked;
    }
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 1.0, 1.0, 1.0, 1.0 ],  // white
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 1.0, 0.6, 0.0, 1.0 ],  // orange
        [ 1.0, 0.0, 1.0, 1.0 ]   // magenta
    ];

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );

        // for solid colored faces use 
        colors.push(vertexColors[a]);        
    }
}

function generateAxesPoints()
{
    data = [
        vec4(0.0, 0.0, 0.0, 1.0), vec4(1.0, 0.0, 0.0, 1.0),
        vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0),
        vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0)
    ]

    return data;
}

function generateAxesColors()
{
    data = [
        vec4(1.0, 0.0, 0.0, 1.0), vec4(1.0, 0.0, 0.0, 1.0),
        vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0),
        vec4(0.0, 0.0, 1.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0)
    ]
    return data;
}

function generateLinePoints()
{
    data = [
        vec4(-1.0, -1.0, -100.0, 1.0), vec4(-1.0, -1.0, 100.0, 1.0),
        vec4(1.0, -1.0, -100.0, 1.0),  vec4(1.0, -1.0, 100.0, 1.0)
    ]
    return data;
}

function generateLineColors()
{
    data = [
        vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0),
        vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0)
    ]
    return data;
}

function generateExtraAxisPoints()
{
    data = [
        vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 2.0, 1.0)
    ]
    return data;
}

function generateExtraAxisColors()
{
    data = [
        //vec4(1.0, 0.2, 0.4, 1.0), vec4(1.0, 0.2, 0.4, 1.0)
        vec4(1.0, 1.0, 0.0, 0.7), vec4(1.0, 1.0, 0.0, 0.7)
    ]
    return data;
}

function linkHTML()
{
    disableAngleButtons();

    var playButton = document.getElementById("play-pause");
    if(playButton)
    {
        playButton.onclick = function()
        {
            animation = !animation;

            if(animation)
            {
                render();
                playButton.innerHTML = "Pause";
            }
            else
            {
                playButton.innerHTML = "Play";
            }
        }
    }

    var orthoMode = document.getElementById("ortho-mode");
    var perspMode = document.getElementById("persp-mode");

    orthoMode.onclick = function()
    {
        isPerspective = false;
    }

    perspMode.onclick = function()
    {
        isPerspective = true;
    }

    var rotateGlobalY = document.getElementById("rotate-global-y");
    var rotSpeed = document.getElementById("rot-speed");
    if(rotateGlobalY)
    {
        rotateGlobalY.onclick = function()
        {
            worldRotation = rotateGlobalY.checked;
            rotSpeed.disabled = !rotateGlobalY.checked;
        }
    }
}

////////////////////////////////////////////////////////////////////////////
//                             DOM FUNCTIONS                              //
////////////////////////////////////////////////////////////////////////////

function translateCube(axis, pos)
{
    if(axis == 0)
    {
        cube.translateX(pos);
    }
    else if(axis == 1)
    {
        cube.translateY(pos);
    }
    else if(axis == 2)
    {
        cube.translateZ(pos);
    }
}

function scaleCube(scale)
{
    cube.changeScale(scale);
}

function changeCamRotationSpeed(speed)
{
    camRotationSpeed = speed;
}

function renderExtraAxis()
{
    extraAxis.enable = !extraAxis.enable;

    if(extraAxis.enable)
    {
        disableCubeRotation();
        enableAngleButtons();
        toggleAxisCheckbox();
    }
    else
    {
        enableCubeRotation();
        disableAngleButtons();
        toggleAxisCheckbox();
        rotateAroundExtraAxis = false;
        document.getElementById("extra-axis-rotation").checked = false;
    }
}

function updateTheta(direction)
{
    extraAxis.rotateX(5.0 * direction);
    
    var rotParameter = ["theta", 5.0 * direction];
    rotationQueue.push(rotParameter);
}

function updatePhi(direction)
{
    extraAxis.rotateY(5.0 * direction);

    var rotParameter = ["phi", 5.0 * direction];
    rotationQueue.push(rotParameter);
}

function setCubePosition()
{
    cube.children.pop();

    for(var i=0; i < rotationQueue.length;i++)
    {
        var angle = rotationQueue[i][0];
        var rotation = rotationQueue[i][1];

        if(angle == "theta")
        {
            cube.rotateX(rotation);
        }
        else if(angle == "phi")
        {
            cube.rotateY(rotation);
        }
    }

    cube.children.push(extraAxis);
    rotationQueue = [];
}

function toggleExtraAxisRotation(rotationSwitch)
{
    if(rotationSwitch)
    {
        //disableCubeRotation();        
        disableAngleButtons();

        setCubePosition();
        rotateAroundExtraAxis = true;
    }
    else
    {
        //enableCubeRotation();
        enableAngleButtons();

        rotateAroundExtraAxis = false;
    }
}

function disableCubeRotation()
{   
    var rotX = document.getElementById("rotate-over-x");
    var rotY = document.getElementById("rotate-over-y");
    var rotZ = document.getElementById("rotate-over-z");

    rotX.checked = false;
    rotY.checked = false;
    rotZ.checked = false;

    rotX.disabled = true;
    rotY.disabled = true;
    rotZ.disabled = true;    
}

function enableCubeRotation()
{   
    var rotX = document.getElementById("rotate-over-x");
    var rotY = document.getElementById("rotate-over-y");
    var rotZ = document.getElementById("rotate-over-z");

    rotX.disabled = false;
    rotY.disabled = false;
    rotZ.disabled = false;    
}

function disableAngleButtons()
{
    var buttons = document.getElementsByClassName("angleChange");

    for(var i =0; i < buttons.length; i++)
    {
        buttons[i].disabled = true;
    }
}

function enableAngleButtons()
{
    var buttons = document.getElementsByClassName("angleChange");

    for(var i =0; i < buttons.length; i++)
    {
        buttons[i].disabled = false;
    }
}

function toggleAxisCheckbox()
{
    var axisRotation = document.getElementById("extra-axis-rotation");
    axisRotation.disabled = !axisRotation.disabled;
}