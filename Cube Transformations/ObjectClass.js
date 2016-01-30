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
	this.translation = [0.0, 0.0, 0.0];
	this.rotation 	 = [0.0, 0.0, 0.0];
	this.scale 		 = [0.0, 0.0, 0.0];

	// Object transformation matrices
	this.rotationMatrix = mat4();
	this.translationMatrix = mat4();
	this.scaleMatrix = mat4();

	// State
	this.hasChild = false;
	this.enable = true;
	
	// Methods
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
			// Accumulate cube rotation + world rotation
			var finalRotation = mult(WORLD_ROTATION_MATRIX, this.rotationMatrix);
			
			// Pass tranformations to the shader
			gl.uniformMatrix4fv(ROTATION_MATRIX    , false, flatten(finalRotation));
			gl.uniformMatrix4fv(SCALE_MATRIX       , false, flatten(this.scaleMatrix));
			gl.uniformMatrix4fv(TRANSLATION_MATRIX , false, flatten(this.translationMatrix));

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

	ObjectGL.prototype.rotateX = function(angle)
	{
		var rotationApplied = rotate(angle, this.xAxis);
		this.yAxis = multMat4Vec3(rotationApplied, this.yAxis);
		this.zAxis = multMat4Vec3(rotationApplied, this.zAxis);

		// Update object's rotation matrix
		this.rotationMatrix = mult(rotationApplied, this.rotationMatrix);

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


	ObjectGL.prototype.translateX = function(tx)
	{
		this.translation[0] = tx;
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
		this.translation[1] = ty;
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
		this.translation[2] = tz;
		this.translate();
		
		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].translateZ(tz);
			}
		}
	}

	ObjectGL.prototype.translate = function()
	{
		this.translationMatrix = translate(this.translation);

		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].translate();
			}
		}
	}

	ObjectGL.prototype.changeScale = function(value)
	{
		this.scale = [value, value, value];
		this.scaleMatrix = scalem(this.scale);

		if(this.hasChild)
		{
			for(var i = 0; i < this.children.length; i++)
			{
				this.children[i].changeScale(value);
			}
		}
	}


	ObjectGL.prototype.addChildren = function(child)
	{
		if( child == null || typeof(child) !== typeof(this) )
		{
			throw new Error("Trying to add a child that is null OR not an ObjectGL type to the hierarchy");
		}

		this.children.push(child);
		this.hasChild = true;
	}
}

function multMat4Vec3(m, v)
{
    var result = vec3();
    
    result[0] = v[0]*m[0][0] + v[1]*m[0][1] + v[2]*m[0][2];
    result[1] = v[0]*m[1][0] + v[1]*m[1][1] + v[2]*m[1][2];
    result[2] = v[0]*m[2][0] + v[1]*m[2][1] + v[2]*m[2][2];
    
    return result;
}