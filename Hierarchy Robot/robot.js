    // Control
var gl;
var program;
var animation = true;
var isPerspective = true;
var objectsToRender = [];

// Attribute locations
var aPosition;
var aColor;

// World Attributes
var modelViewMatrix;
var perspectiveMatrix;
var orthoMatrix;

// Uniforms' Location
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

// Orthographic View Parameters
var left   = -3.0;
var right  = 3.0;
var bottom = -2.0;
var up     = 2.0;
var near   = -100.0;
var far    = 100;

// cube vertices and colors array
var points = [];
var colors = [];

// Objects
var head, body, shoulderRight, shoulderLeft,
    upperArmR, upperArmL, elbowRight, elbowLeft,
    lowerArmL, lowerArmR, handRight, handLeft;

var cubeAxes;
var groundLines;


window.onkeydown = function(e)
{
	keyDownHandler(e);
}

window.onload = function init()
{
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
    buildRobot();
    upperArmR.pivotRotatation(-45, shoulderRight.position, shoulderRight.xAxis, true);
    lowerArmR.pivotRotatation(-30, elbowRight.position, elbowRight.xAxis, true);
    lowerArmL.pivotRotatation(-25, elbowLeft.position, elbowLeft.xAxis, true);

    var axesV = generateAxesPoints();
    var axesC = generateAxesColors();
    cubeAxes = new ObjectGL(gl, program, axesV, axesC, gl.LINES);
    cubeAxes.initBuffers();
    body.addChildren(cubeAxes);
    objectsToRender.push(cubeAxes);

    var lineV = generateLinePoints();
    var lineC = generateLineColors();
    groundLines = new ObjectGL(gl, program, lineV, lineC, gl.LINES);
    groundLines.initBuffers();
    objectsToRender.push(groundLines);

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

	for(var i = 0; i < objectsToRender.length; i++)
	{
		objectsToRender[i].render();
	}

    if(animation)
    {
        requestAnimFrame(render);
    }
}

////////////////////////////////////////////////////////////////////////////
//				       TRANSFORMATION GENERATORS                          //
////////////////////////////////////////////////////////////////////////////

function calculateMatrices()
{
    modelViewMatrix   = lookAt(camEye, camAt, camUp);
    perspectiveMatrix = perspective(45, canvas.width/canvas.height, 0.3, 50.0);
    orthoMatrix       = ortho(left, right, bottom, up, near, far);
}

function cameraRotation(angleDegree)
{
	var x = camEye[0];
	var z = camEye[2];

	var angle = radians(angleDegree);

	camEye[0] = x * Math.cos(angle) + z * Math.sin(angle);
    camEye[2] = z * Math.cos(angle) - x * Math.sin(angle);
}

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

function keyDownHandler(e)
{
	switch(e.which)
	{
		// Robot Controller
		case 'Q'.charCodeAt(0):
            upperArmR.pivotRotatation(10, shoulderRight.position, shoulderRight.xAxis, true);
			break;
		case 'W'.charCodeAt(0):
			upperArmR.pivotRotatation(-10, shoulderRight.position, shoulderRight.xAxis, true);
			break;
		case 'E'.charCodeAt(0):
			upperArmL.pivotRotatation(-10, shoulderLeft.position, shoulderLeft.xAxis, true);
			break;
		case 'R'.charCodeAt(0):
			upperArmL.pivotRotatation(10, shoulderLeft.position, shoulderLeft.xAxis, true);
			break;
		case 'A'.charCodeAt(0):
			lowerArmR.pivotRotatation(10, elbowRight.position, elbowRight.xAxis, true);
			break;
		case 'S'.charCodeAt(0):
			lowerArmR.pivotRotatation(-10, elbowRight.position, elbowRight.xAxis, true);
			break;
        case 'D'.charCodeAt(0):
            lowerArmL.pivotRotatation(10, elbowLeft.position, elbowLeft.xAxis, true);
            break;
        case 'F'.charCodeAt(0):
            lowerArmL.pivotRotatation(-10, elbowLeft.position, elbowLeft.xAxis, true);
            break;
        case 'Z'.charCodeAt(0):
            handRight.pivotRotatation(-15, handRight.position, lowerArmR.yAxis, true);
            break;
        case 'X'.charCodeAt(0):
            handRight.pivotRotatation(15, handRight.position, lowerArmR.yAxis, true);
            break;
        case 'C'.charCodeAt(0):
            handLeft.pivotRotatation(-15, handLeft.position, lowerArmL.yAxis, true);
            break;
        case 'V'.charCodeAt(0):
            handLeft.pivotRotatation(15, handLeft.position, lowerArmL.yAxis, true);
            break;

		case 'B'.charCodeAt(0):
			body.pivotRotatation(10, body.position, [0,1,0], true);
			break;
        case 'H'.charCodeAt(0):
            head.pivotRotatation(10, head.position, body.yAxis, true);
            break;

		// Camera Controller
		case 37:
			cameraRotation(-4);
			break;
		case 39:
			cameraRotation(4);
			break;

		// DEBUG
		case 36: //Home
            console.log("DEBUG VALUES");
			break;
	}
}