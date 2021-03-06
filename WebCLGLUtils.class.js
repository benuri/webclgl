/** 
* Utilities
* @class
* @constructor
*/
var WebCLGLUtils = function() {
    /**
     * loadQuad
     */
    this.loadQuad = function(node, length, height) {
        var l=(length==undefined)?0.5:length;
        var h=(height==undefined)?0.5:height;
        this.vertexArray = [-l, -h, 0.0,
            l, -h, 0.0,
            l,  h, 0.0,
            -l,  h, 0.0];

        this.textureArray = [0.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 1.0, 0.0,
            0.0, 1.0, 0.0];

        this.indexArray = [0, 1, 2,      0, 2, 3];

        var meshObject = {};
        meshObject.vertexArray = this.vertexArray;
        meshObject.textureArray = this.textureArray;
        meshObject.indexArray = this.indexArray;

        return meshObject;
    };

    /**
     * getWebGLContextFromCanvas
     * @param {HTMLCanvasElement} canvas
     * @param {Object} ctxOpt
     */
    this.getWebGLContextFromCanvas = function(canvas, ctxOpt) {
        var gl;
        /*try {
            if(ctxOpt == undefined) gl = canvas.getContext("webgl2");
            else gl = canvas.getContext("webgl2", ctxOpt);

            console.log((gl == null)?"no webgl2":"using webgl2");
        } catch(e) {
            gl = null;
        }
        if(gl == null) {
            try {
                if(ctxOpt == undefined) gl = canvas.getContext("experimental-webgl2");
                else gl = canvas.getContext("experimental-webgl2", ctxOpt);

                console.log((gl == null)?"no experimental-webgl2":"using experimental-webgl2");
            } catch(e) {
                gl = null;
            }
        }*/
        if(gl == null) {
            try {
                if(ctxOpt == undefined) gl = canvas.getContext("webgl");
                else gl = canvas.getContext("webgl", ctxOpt);

                console.log((gl == null)?"no webgl":"using webgl");
            } catch(e) {
                gl = null;
            }
        }
        if(gl == null) {
            try {
                if(ctxOpt == undefined) gl = canvas.getContext("experimental-webgl");
                else gl = canvas.getContext("experimental-webgl", ctxOpt);

                console.log((gl == null)?"no experimental-webgl":"using experimental-webgl");
            } catch(e) {
                gl = null;
            }
        }
        if(gl == null) gl = false;
        return gl;
    };

    /**
     * createShader
     */
    this.createShader = function(gl, name, sourceVertex, sourceFragment, shaderProgram) {
        var _sv = false, _sf = false;

        var makeDebug = (function(infoLog, shader) {
            console.log(infoLog);

            var arrErrors = [];
            var errors = infoLog.split("\n");
            for(var n = 0, f = errors.length; n < f; n++) {
                if(errors[n].match(/^ERROR/gim) != null) {
                    var expl = errors[n].split(':');
                    var line = parseInt(expl[2]);
                    arrErrors.push([line,errors[n]]);
                }
            }
            var sour = gl.getShaderSource(shader).split("\n");
            sour.unshift("");
            for(var n = 0, f = sour.length; n < f; n++) {
                var lineWithError = false;
                var errorStr = '';
                for(var e = 0, fe = arrErrors.length; e < fe; e++) {
                    if(n == arrErrors[e][0]) {
                        lineWithError = true;
                        errorStr = arrErrors[e][1];
                        break;
                    }
                }
                if(lineWithError == false) {
                    console.log("%c"+n+' %c'+sour[n], "color:black", "color:blue");
                } else {
                    console.log('%c►►%c'+n+' %c'+sour[n]+'\n%c'+errorStr, "color:red", "color:black", "color:blue", "color:red");
                }
            }
        }).bind(this);


        var shaderVertex = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(shaderVertex, sourceVertex);
        gl.compileShader(shaderVertex);
        if (!gl.getShaderParameter(shaderVertex, gl.COMPILE_STATUS)) {
            var infoLog = gl.getShaderInfoLog(shaderVertex);
            console.log("%c"+name+' ERROR (vertex program)', "color:red");

            if(infoLog != undefined)
                makeDebug(infoLog, shaderVertex);
        } else  {
            gl.attachShader(shaderProgram, shaderVertex);
            _sv = true;
        }

        var shaderFragment = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shaderFragment, sourceFragment);
        gl.compileShader(shaderFragment);
        if (!gl.getShaderParameter(shaderFragment, gl.COMPILE_STATUS)) {
            var infoLog = gl.getShaderInfoLog(shaderFragment);
            console.log("%c"+name+' ERROR (fragment program)', "color:red");

            if(infoLog != undefined)
                makeDebug(infoLog, shaderFragment);
        } else {
            gl.attachShader(shaderProgram, shaderFragment);
            _sf = true;
        }

        if(_sv == true && _sf == true) {
            gl.linkProgram(shaderProgram);
            var success = gl.getProgramParameter(shaderProgram, gl.LINK_STATUS);
            if(success) {
                return true;
            } else {
                console.log('Error shader program '+name+':\n ');
                var log = gl.getProgramInfoLog(shaderProgram);
                if(log != undefined)
                    console.log(log);
                return false;
            }
        } else {
            return false;
        }
    };

    /**
     * Get Uint8Array from HTMLImageElement
     * @returns {Uint8Array}
     * @param {HTMLImageElement} imageElement
     */
    this.getUint8ArrayFromHTMLImageElement = function(imageElement) {
        var e = document.createElement('canvas');
        e.width = imageElement.width;
        e.height = imageElement.height;
        var ctx2D_tex = e.getContext("2d");
        ctx2D_tex.drawImage(imageElement, 0, 0);
        var arrayTex = ctx2D_tex.getImageData(0, 0, imageElement.width, imageElement.height);

        return arrayTex.data;
    };

    /**
     * Dot product vector4float
     */
    this.dot4 = function(vector4A,vector4B) {
        return vector4A[0]*vector4B[0] + vector4A[1]*vector4B[1] + vector4A[2]*vector4B[2] + vector4A[3]*vector4B[3];
    };

    /**
     * Compute the fractional part of the argument. fract(pi)=0.14159265...
     */
    this.fract = function(number) {
        return number - Math.floor(number);
    };

    /**
     * Pack 1float (0.0-1.0) to 4float rgba (0.0-1.0, 0.0-1.0, 0.0-1.0, 0.0-1.0)
     */
    this.pack = function(v) {
        var bias = [1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0];

        var r = v;
        var g = this.fract(r * 255.0);
        var b = this.fract(g * 255.0);
        var a = this.fract(b * 255.0);
        var colour = [r, g, b, a];

        var dd = [colour[1]*bias[0],colour[2]*bias[1],colour[3]*bias[2],colour[3]*bias[3]];

        return [colour[0]-dd[0],colour[1]-dd[1],colour[2]-dd[2],colour[3]-dd[3] ];
    };

    /**
     * Unpack 4float rgba (0.0-1.0, 0.0-1.0, 0.0-1.0, 0.0-1.0) to 1float (0.0-1.0)
     */
    this.unpack = function(colour) {
        var bitShifts = [1.0, 1.0/255.0, 1.0/(255.0*255.0), 1.0/(255.0*255.0*255.0)];
        return this.dot4(colour, bitShifts);
    };

    /**
     * Get pack GLSL function string
     * @returns {String}
     */
    this.packGLSLFunctionString = function() {
        return 'vec4 pack (float depth) {\n'+
            'const vec4 bias = vec4(1.0 / 255.0,\n'+
            '1.0 / 255.0,\n'+
            '1.0 / 255.0,\n'+
            '0.0);\n'+

            'float r = depth;\n'+
            'float g = fract(r * 255.0);\n'+
            'float b = fract(g * 255.0);\n'+
            'float a = fract(b * 255.0);\n'+
            'vec4 colour = vec4(r, g, b, a);\n'+

            'return colour - (colour.yzww * bias);\n'+
            '}\n';
    };

    /**
     * Get unpack GLSL function string
     * @returns {String}
     */
    this.unpackGLSLFunctionString = function() {
        return 'float unpack (vec4 colour) {\n'+
            'const vec4 bitShifts = vec4(1.0,\n'+
            '1.0 / 255.0,\n'+
            '1.0 / (255.0 * 255.0),\n'+
            '1.0 / (255.0 * 255.0 * 255.0));\n'+
            'return dot(colour, bitShifts);\n'+
            '}\n';
    };

    /**
     * getOutputBuffers
     * @param {WebCLGLKernel|WebCLGLVertexFragmentProgram} prog
     * @param {Array<WebCLGLBuffer>} buffers
     * @returns {Array<WebCLGLBuffer>}
     */
    this.getOutputBuffers = function(prog, buffers) {
        var outputBuff = null;
        if(prog.output != undefined) {
            outputBuff = [];
            if(prog.output[0] != null) {
                for(var n=0; n < prog.output.length; n++) {
                    //if(buffers.hasOwnProperty(prog.output[n]) == false && _alerted == false)
                    //    _alerted = true, alert("output argument "+prog.output[n]+" not found in buffers. add desired argument as shared");

                    outputBuff[n] = buffers[prog.output[n]];
                }
            } else
                outputBuff = null;
        }
        return outputBuff;
    };

    /**
     * parseSource
     * @param {String} source
     * @param {Object} values
     * @returns {String}
     */
    this.parseSource = function(source, values) {
        for(var key in values) {
            var regexp = new RegExp(key+"\\[.*?\\]","gm");
            var varMatches = source.match(regexp);// "Search current "argName" in source and store in array varMatches
            //console.log(varMatches);
            if(varMatches != null) {
                for(var nB = 0, fB = varMatches.length; nB < fB; nB++) { // for each varMatches ("A[x]", "A[x]")
                    var regexpNativeGL = new RegExp('```(\s|\t)*gl.*'+varMatches[nB]+'.*```[^```(\s|\t)*gl]',"gm");
                    var regexpNativeGLMatches = source.match(regexpNativeGL);
                    if(regexpNativeGLMatches == null) {
                        var name = varMatches[nB].split('[')[0];
                        var vari = varMatches[nB].split('[')[1].split(']')[0];

                        var map = { 'float4_fromSampler': source.replace(name+"["+vari+"]", 'texture2D('+name+','+vari+')'),
                            'float_fromSampler': source.replace(name+"["+vari+"]", 'texture2D('+name+','+vari+').x'),
                            'float4_fromAttr': source.replace(name+"["+vari+"]", name),
                            'float_fromAttr': source.replace(name+"["+vari+"]", name)};
                        source = map[values[key].type];
                    }
                }
            }
        }
        source = source.replace(/```(\s|\t)*gl/gi, "").replace(/```/gi, "").replace(/;/gi, ";\n").replace(/}/gi, "}\n").replace(/{/gi, "{\n");
        return source;
    };

    /**
     * lines_vertex_attrs
     * @param {Object} values
     */
    this.lines_vertex_attrs = function(values) {
        var str = '';
        for(var key in values) {
            str += {'float4_fromSampler': 'uniform sampler2D '+key+';',
                    'float_fromSampler': 'uniform sampler2D '+key+';',
                    'float4_fromAttr': 'attribute vec4 '+key+';',
                    'float_fromAttr': 'attribute float '+key+';',
                    'float': 'uniform float '+key+';',
                    'float4': 'uniform vec4 '+key+';',
                    'mat4': 'uniform mat4 '+key+';'}[values[key].type]+'\n';
        }
        return str;
    };

    /**
     * lines_fragment_attrs
     * @param {Object} values
     */
    this.lines_fragment_attrs = function(values) {
        var str = '';
        for(var key in values) {
            str += {'float4_fromSampler': 'uniform sampler2D '+key+';',
                    'float_fromSampler': 'uniform sampler2D '+key+';',
                    'float': 'uniform float '+key+';',
                    'float4': 'uniform vec4 '+key+';',
                    'mat4': 'uniform mat4 '+key+';'}[values[key].type]+'\n';
        }
        return str;
    };

    /**
     * lines_drawBuffersInit
     * @param {int} maxDrawBuffers
     */
    this.lines_drawBuffersInit = function(maxDrawBuffers) {
        var str = '';
        for(var n= 0, fn=maxDrawBuffers; n < fn; n++) {
            str += ''+
            'float out'+n+'_float = -999.99989;\n'+
            'vec4 out'+n+'_float4;\n';
        }
        return str;
    };

    this.lines_drawBuffersWriteInit = function(maxDrawBuffers) {
        var str = '';
        for(var n= 0, fn=maxDrawBuffers; n < fn; n++) {
            str += ''+
            'layout(location = '+n+') out vec4 outCol'+n+';\n';
        }
        return str;
    };

    /**
     * lines_drawBuffersWrite
     * @param {int} maxDrawBuffers
     */
    this.lines_drawBuffersWrite = function(maxDrawBuffers) {
        var str = '';
        for(var n= 0, fn=maxDrawBuffers; n < fn; n++) {
            str += ''+
            'if(out'+n+'_float != -999.99989) gl_FragData['+n+'] = vec4(out'+n+'_float,0.0,0.0,1.0);\n'+
            ' else gl_FragData['+n+'] = out'+n+'_float4;\n';
        }
        return str;
    };

    /**
     * checkArgNameInitialization
     * @param {Object} inValues
     * @param {String} argName
     */
    this.checkArgNameInitialization = function(inValues, argName) {
        if(inValues.hasOwnProperty(argName) == false) {
            inValues[argName] = {
                "type": null,
                "expectedMode": null, // "ATTRIBUTE", "SAMPLER", "UNIFORM"
                "location": null};
        }
    };

    /**
     * get_global_id3_GLSLFunctionString
     */
    this.get_global_id3_GLSLFunctionString = function() {
        return ''+
        'vec2 get_global_id(float id, float bufferWidth, float geometryLength) {\n'+
            'float num = (id*geometryLength)/bufferWidth;'+
            'float column = fract(num)*bufferWidth;'+
            'float row = floor(num);'+

            'float ts = 1.0/(bufferWidth-1.0);'+

            'return vec2(column*ts, row*ts);'+
            '}\n';
    };

    /**
     * get_global_id2_GLSLFunctionString
     */
    this.get_global_id2_GLSLFunctionString = function() {
        return ''+
            'vec2 get_global_id(vec2 id, float bufferWidth) {\n'+
            'float column = id.x;'+
            'float row = id.y;'+

            'float ts = 1.0/(bufferWidth-1.0);'+

            'return vec2(column*ts, row*ts);'+
            '}\n';
    };
    
};