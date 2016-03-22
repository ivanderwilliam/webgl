function buildRobot()
{
    colorCube();

    body = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    body.initBuffers();
    body.scaleX(0.75);
    body.scaleY(1.0);
    body.scaleZ(0.5);
    objectsToRender.push(body);

    head = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    head.initBuffers();
    head.changeScale(0.35)
    head.translateY(0.7);
    body.addChildren(head);
    objectsToRender.push(head);

    // ---- Right side
    
    shoulderRight = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    shoulderRight.initBuffers();
    shoulderRight.changeScale(0.1);
    shoulderRight.translateTo(-0.4, 0.4, 0.0);
    body.addChildren(shoulderRight);
    objectsToRender.push(shoulderRight);

    upperArmR = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    upperArmR.initBuffers();
    upperArmR.translateX(-0.5);
    upperArmR.translateY(0.25); 
    upperArmR.scaleX(0.15);
    upperArmR.scaleY(0.45);
    upperArmR.scaleZ(0.2);
    body.addChildren(upperArmR);
    objectsToRender.push(upperArmR);

    elbowRight = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    elbowRight.initBuffers();
    elbowRight.changeScale(0.1);
    elbowRight.translateTo(-0.5, 0.0, 0.0);
    objectsToRender.push(elbowRight);
    upperArmR.addChildren(elbowRight);

    lowerArmR = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    lowerArmR.initBuffers();
    lowerArmR.translateX(-0.5);
    lowerArmR.translateY(-0.25); 
    lowerArmR.scaleX(0.15);
    lowerArmR.scaleY(0.45);
    lowerArmR.scaleZ(0.2);
    upperArmR.addChildren(lowerArmR);
    objectsToRender.push(lowerArmR);

    handRight = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    handRight.initBuffers();
    handRight.translateX(-0.5);
    handRight.translateY(-0.55);
    handRight.scaleX(0.10);
    handRight.scaleY(0.15);
    handRight.scaleZ(0.15);
    lowerArmR.addChildren(handRight);
    objectsToRender.push(handRight);


    // ---- Left side

    shoulderLeft = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    shoulderLeft.initBuffers();
    shoulderLeft.changeScale(0.1);
    shoulderLeft.translateTo(0.4, 0.4, 0.0);
    body.addChildren(shoulderLeft);
    objectsToRender.push(shoulderLeft);

    upperArmL = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    upperArmL.initBuffers();
    upperArmL.translateX(0.5); 
    upperArmL.translateY(0.25); 
    upperArmL.scaleX(0.15);
    upperArmL.scaleY(0.45);
    upperArmL.scaleZ(0.2);
    body.addChildren(upperArmL);
    objectsToRender.push(upperArmL);

    elbowLeft = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    elbowLeft.initBuffers();
    elbowLeft.changeScale(0.1);
    elbowLeft.translateTo(0.5, 0.0, 0.0);
    objectsToRender.push(elbowLeft);
    upperArmL.addChildren(elbowLeft);

    lowerArmL = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    lowerArmL.initBuffers();
    lowerArmL.translateX(0.5);
    lowerArmL.translateY(-0.25); 
    lowerArmL.scaleX(0.15);
    lowerArmL.scaleY(0.45);
    lowerArmL.scaleZ(0.2);
    upperArmL.addChildren(lowerArmL);
    objectsToRender.push(lowerArmL);

    handLeft = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    handLeft.initBuffers();
    handLeft.translateX(0.5);
    handLeft.translateY(-0.55);
    handLeft.scaleX(0.10);
    handLeft.scaleY(0.15);
    handLeft.scaleZ(0.15);
    lowerArmL.addChildren(handLeft);
    objectsToRender.push(handLeft);

    // Leg
    leg = new ObjectGL(gl, program, points, colors, gl.TRIANGLES);
    leg.initBuffers();
    leg.translateY(-0.8); 
    leg.scaleX(0.3);
    leg.scaleY(0.65);
    leg.scaleZ(0.25);
    body.addChildren(leg);
    objectsToRender.push(leg);
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