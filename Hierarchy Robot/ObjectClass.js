function ObjectGL(gl, program, verticesArray, colorsArray, drawType)
{
	// WebGL related variables
	this.glContext = gl;
	this.glProgram = program;
	this.vertexBuffer;
	this.colorBuffer;
	this.drawType = drawType;

	this.vertices = verticesArray;
	this.colors   = colorsArray;
	this.children = [];

	// Object coordinate axes
	this.xAxis = vec4(1.0, 0.0, 0.0, 0.0);
	this.yAxis = vec4(0.0, 1.0, 0.0, 0.0);
	this.zAxis = vec4(0.0, 0.0, 1.0, 0.0);

	// Object current transformation
	this.position = [0.0, 0.0, 0.0];
	this.rotation = [0.0, 0.0, 0.0];
	this.scale 	  = [1.0, 1.0, 1.0];

	// Object transformation matrices
	this.rotationMatrix = mat4();
	this.translationMatrix = mat4();
	this.scaleMatrix = mat4();

	this.inverseTranslation = mat4();

	// State
	this.hasChild = false;
	this.enable = true;
	
///////////////////////////////////////////////////////////////////////////
//				       INITIALIZATION AND SETUP                          //
///////////////////////////////////////////////////////////////////////////

	ObjectGL.prototype.initVertexBuffer = function()
	{
		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

		gl.vertexAttribPointer(this.vertexLoc, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertexLoc);
	}

	ObjectGL.prototype.initColorBuffer = function()
	{
		this.colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW);

		gl.vertexAttribPointer(this.colorLoc, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.colorLoc);
	}

	ObjectGL.prototype.initBuffers = function()
	{
		this.initVertexBuffer();
		this.initColorBuffer();
	}

	ObjectGL.prototype.render = function()
	{
		if(this.enable)
		{
			this.updateShaderMatrices();

		    // Vertices Buffer
		    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		    gl.vertexAttribPointer(VERTEX_LOC, 4, gl.FLOAT, false, 0, 0);
		    gl.enableVertexAttribArray(VERTEX_LOC);
		    
		    // Color Buffer
		    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
		    gl.vertexAttribPointer(COLOR_LOC, 4, gl.FLOAT, false, 0, 0);
		    gl.enableVertexAttribArray(COLOR_LOC);
		    
		    // Draw
		    gl.drawArrays( this.drawType, 0, (this.vertices).length );
		}
		
	}

///////////////////////////////////////////////////////////////////////////
//				          TRANSFORMATIONS                                //
///////////////////////////////////////////////////////////////////////////

	ObjectGL.prototype.rotateX = function(angle)
	{
		this.rotation[0] = (this.rotation[0] + angle) % 360;

		var rotationApplied = rotate(angle, this.xAxis);
		this.yAxis = multMat4Vec3(rotationApplied, this.yAxis);
		this.zAxis = multMat4Vec3(rotationApplied, this.zAxis);

		// Update object's rotation matrix
		this.rotationMatrix = mult(rotationApplied, this.rotationMatrix);
		this.updateShaderMatrices();

		// Apply tranformation on children
		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].rotateX(angle);
			}
		}
	}

	ObjectGL.prototype.rotateY = function(angle)
	{
		this.rotation[1] = (this.rotation[1] + angle) % 360;

		var rotationApplied = rotate(angle, this.yAxis);
		this.xAxis = multMat4Vec3(rotationApplied, this.xAxis);
		this.zAxis = multMat4Vec3(rotationApplied, this.zAxis);

		// Update object's rotation matrix
		this.rotationMatrix = mult(rotationApplied, this.rotationMatrix);

		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].rotateY(angle);
			}
		}
	}

	ObjectGL.prototype.rotateZ = function(angle)
	{
		this.rotation[2] = (this.rotation[2] + angle) % 360;

		var rotationApplied = rotate(angle, this.zAxis);
		this.xAxis = multMat4Vec3(rotationApplied, this.xAxis);
		this.yAxis = multMat4Vec3(rotationApplied, this.yAxis);

		// Update object's rotation matrix
		this.rotationMatrix = mult(rotationApplied, this.rotationMatrix);

		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].rotateZ(angle);
			}
		}
	}

	ObjectGL.prototype.pivotRotatation = function(angle, pivotPos, axis, rotateChildren)
	{
		// Generate tranformation matrices
		var translateToPivot = translate(negate(pivotPos));
		var rotationOverPivot = rotate(angle, axis);
		var translateBack = inverse(translateToPivot);

		// Accumulate tranformations
		var finalTransformation = mult(rotationOverPivot, translateToPivot);
		finalTransformation = mult(translateBack, finalTransformation);

		// Apply tranformation
		this.translationMatrix = mult(finalTransformation, this.translationMatrix);

		// Update Object properties
		this.xAxis = multMat4Vec3(rotationOverPivot, this.xAxis);
		this.yAxis = multMat4Vec3(rotationOverPivot, this.yAxis);
		this.zAxis = multMat4Vec3(rotationOverPivot, this.zAxis);
				
		//this.position = multMat4Vec3(finalTransformation, this.position);

		this.position = vec4To3( multMat4Vec4(finalTransformation, vec3To4(this.position)) );
		

		this.updateShaderMatrices();

		if(rotateChildren)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].pivotRotatation(angle, pivotPos, axis, true);
			}
		}
	}


	ObjectGL.prototype.translateX = function(tx)
	{
		this.position[0] = tx;
		this.translate();
		
		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].translateX(tx);
			}
		}
	}

	ObjectGL.prototype.translateY = function(ty)
	{
		this.position[1] = ty;
		this.translate();
		
		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].translateY(ty);
			}
		}
	}

	ObjectGL.prototype.translateZ = function(tz)
	{
		this.position[2] = tz;
		this.translate();
		
		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].translateZ(tz);
			}
		}
	}

	ObjectGL.prototype.translateTo = function(x, y, z)
	{
		this.position = [x,y,z];
		this.translate();

		// if(this.hasChild)
		// {
		// 	for(var i = 0; i < this.children.length; i++)
		// 	{
		// 		this.children[i].translateTo(x, y, z);
		// 	}
		// }
	}

	ObjectGL.prototype.translate = function()
	{
		this.translationMatrix = translate(this.position);
		//this.inverseTranslation = inverse(this.translationMatrix);

		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].translate();
			}
		}
	}

	ObjectGL.prototype.translateUsingMatrix = function(tMatrix)
	{
		this.translationMatrix = tMatrix;
		//this.inverseTranslation = inverse(this.translationMatrix);

		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].translateUsingMatrix(tMatrix);
			}
		}

	}



	ObjectGL.prototype.changeScale = function(value)
	{
		this.scale = [value, value, value];
		this.scaleMatrix = scalem(this.scale);

		// if(this.hasChild)
		// {
		// 	for(var i = 0; i < this.children.length; i++)
		// 	{
		// 		this.children[i].changeScale(value);
		// 	}
		// }
	}

	ObjectGL.prototype.scaleX = function(value)
	{
		this.scale[0] = value;
		this.scaleMatrix = scalem(this.scale);

		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].scaleX(value);
			}
		}
	}

	ObjectGL.prototype.scaleY = function(value)
	{
		this.scale[1] = value;
		this.scaleMatrix = scalem(this.scale);

		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].scaleY(value);
			}
		}
	}

	ObjectGL.prototype.scaleZ = function(value)
	{
		this.scale[2] = value;
		this.scaleMatrix = scalem(this.scale);

		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].scaleZ(value);
			}
		}
	}

///////////////////////////////////////////////////////////////////////////
//				            HIERARCHY METHODS                            //
///////////////////////////////////////////////////////////////////////////

	ObjectGL.prototype.addChildren = function(child)
	{
		if( child == null || typeof(child) !== typeof(this) )
		{
			throw new Error("Trying to add a child that is null OR not an ObjectGL type to the hierarchy");
		}

		this.children.push(child);
		this.hasChild = true;
	}


	ObjectGL.prototype.updateShaderMatrices = function()
	{
		// Accumulate cube rotation + world rotation
		//var finalRotation = mult(WORLD_ROTATION_MATRIX, this.rotationMatrix);
		
		// Pass tranformations to the shader
		//gl.uniformMatrix4fv(ROTATION_MATRIX    , false, flatten(finalRotation));
		gl.uniformMatrix4fv(ROTATION_MATRIX    , false, flatten(this.rotationMatrix));
		gl.uniformMatrix4fv(SCALE_MATRIX       , false, flatten(this.scaleMatrix));
		gl.uniformMatrix4fv(TRANSLATION_MATRIX , false, flatten(this.translationMatrix));		
	}
}