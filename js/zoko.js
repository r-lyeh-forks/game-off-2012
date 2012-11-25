// Generated by CoffeeScript 1.3.3
var BoxBlock, BoxObject, EmptyBlock, GamePlay, KeyboardController, LevelState, LevelView, LiftBlock, LiftObject, Observable, PlatformBlock, Player, PlayerObject, SkyObject, SolidBlock, StaticLevelObject, View, createTextures, e3d, loadFilesUsing, loadImageFile, loadImageFiles, loadJsonFile, loadJsonFiles, loadResourceFiles, makeBackFace, makeBox, makeFrontFace, makeLeftFace, makeLidlessBox, makeQuad, makeRightFace, makeTopFace, mat, resource_dir, vec,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Observable = (function() {

  function Observable() {}

  Observable.prototype.notifyObservers = function() {
    var observer, _i, _len, _ref, _results;
    if (this.observers != null) {
      _ref = this.observers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        observer = _ref[_i];
        if (observer != null) {
          _results.push(observer.update(this));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  return Observable;

})();

GamePlay = function() {
  var levelState;
  return levelState = new LevelState(levels.test);
};

KeyboardController = function(levelState) {
  return $(document).on('keydown', function(e) {
    switch (e.which) {
      case 37:
        return levelState.movePlayer('left');
      case 38:
        return levelState.movePlayer('up');
      case 39:
        return levelState.movePlayer('right');
      case 40:
        return levelState.movePlayer('down');
    }
  });
};

EmptyBlock = (function() {

  EmptyBlock.prototype.type = 'empty';

  EmptyBlock.prototype["static"] = false;

  function EmptyBlock(level, position) {
    this.level = level;
    this.position = position;
  }

  EmptyBlock.prototype.move = function() {
    var below;
    below = this.level.blockBelow(this.position);
    return below.type !== 'empty';
  };

  EmptyBlock.prototype.update = function() {
    return false;
  };

  return EmptyBlock;

})();

SolidBlock = (function() {

  function SolidBlock() {}

  SolidBlock.prototype.type = 'solid';

  SolidBlock.prototype["static"] = true;

  SolidBlock.prototype.move = function() {
    return false;
  };

  SolidBlock.prototype.update = function() {
    return false;
  };

  return SolidBlock;

})();

PlatformBlock = (function() {

  function PlatformBlock() {}

  PlatformBlock.prototype.type = 'platform';

  PlatformBlock.prototype["static"] = true;

  PlatformBlock.prototype.move = function() {
    return false;
  };

  PlatformBlock.prototype.update = function() {
    return false;
  };

  return PlatformBlock;

})();

BoxBlock = (function() {

  BoxBlock.prototype.type = 'box';

  BoxBlock.prototype["static"] = false;

  function BoxBlock(level, position) {
    this.level = level;
    this.position = position;
  }

  BoxBlock.prototype.move = function(direction, force) {
    var above, here, next;
    if (force >= 1) {
      here = this.position;
      next = vec.add(here, direction);
      if (this.level.blockAt(next).move(direction, force - 1)) {
        above = vec.add(here, [0, 0, 1]);
        this.level.blockAt(above).move(direction, force);
        this.level.swapBlocksAt(here, next);
        return true;
      }
    }
    return false;
  };

  BoxBlock.prototype.update = function() {
    var gravity;
    gravity = 1;
    return this.move([0, 0, -1], gravity);
  };

  return BoxBlock;

})();

LiftBlock = (function() {

  LiftBlock.prototype.type = 'lift';

  LiftBlock.prototype["static"] = false;

  function LiftBlock(level, position) {
    this.level = level;
    this.position = position;
    this.bottom = this.position[2];
    this.top = this.position[2];
  }

  LiftBlock.prototype.move = function() {
    return false;
  };

  LiftBlock.prototype.update = function() {
    var above, below, down, force, here, up;
    up = [0, 0, 1];
    down = [0, 0, -1];
    here = this.position;
    above = vec.add(here, up);
    below = vec.add(here, down);
    if (this.level.blockAt(above).type === 'empty') {
      if (here[2] !== this.bottom) {
        this.level.swapBlocksAt(here, below);
        return true;
      }
    } else {
      if (here[2] !== this.top) {
        force = Infinity;
        if (this.level.blockAt(above).move(up, force)) {
          this.level.swapBlocksAt(here, above);
          return true;
        }
      }
    }
    return false;
  };

  return LiftBlock;

})();

Player = (function() {

  Player.prototype.type = 'player';

  Player.prototype["static"] = false;

  function Player(level, position) {
    this.level = level;
    this.position = position;
  }

  Player.prototype.move = function(direction, force) {
    var here, next;
    here = this.position;
    next = vec.add(here, direction);
    if (this.level.blockAt(next).move(direction, force)) {
      this.level.swapBlocksAt(here, next);
      return true;
    }
    return false;
  };

  Player.prototype.update = function() {
    var gravity;
    gravity = 1;
    return this.move([0, 0, -1], gravity);
  };

  return Player;

})();

LevelState = (function(_super) {

  __extends(LevelState, _super);

  function LevelState(levelData) {
    var block, instance, layer, position, row, x, y, z;
    this.blockArray = (function() {
      var _i, _len, _results;
      _results = [];
      for (z = _i = 0, _len = levelData.length; _i < _len; z = ++_i) {
        layer = levelData[z];
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (y = _j = 0, _len1 = layer.length; _j < _len1; y = ++_j) {
            row = layer[y];
            _results1.push((function() {
              var _k, _len2, _results2;
              _results2 = [];
              for (x = _k = 0, _len2 = row.length; _k < _len2; x = ++_k) {
                block = row[x];
                position = [x, y, z];
                switch (block) {
                  case 'O':
                    _results2.push(new SolidBlock);
                    break;
                  case 'X':
                    _results2.push(new PlatformBlock);
                    break;
                  case '#':
                    _results2.push(new BoxBlock(this, position));
                    break;
                  case '^':
                    _results2.push(new LiftBlock(this, position));
                    break;
                  case 'S':
                    _results2.push(this.player = new Player(this, position));
                    break;
                  default:
                    _results2.push(new EmptyBlock(this, position));
                }
              }
              return _results2;
            }).call(this));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    }).call(this);
    this.height = this.blockArray.length;
    this.depth = this.blockArray[0].length;
    this.width = this.blockArray[0][0].length;
    instance = this;
    this.forEach('lift', function(lift, position) {
      var below;
      below = instance.blockBelow(position);
      if (below.type === 'lift') {
        below.top = position[2];
        return instance.setBlockAt(position, new EmptyBlock);
      }
    });
  }

  LevelState.prototype.forEach = function(type, callback) {
    var block, layer, result, row, x, y, z, _i, _j, _k, _len, _len1, _len2, _ref;
    result = [];
    _ref = this.blockArray;
    for (z = _i = 0, _len = _ref.length; _i < _len; z = ++_i) {
      layer = _ref[z];
      for (y = _j = 0, _len1 = layer.length; _j < _len1; y = ++_j) {
        row = layer[y];
        for (x = _k = 0, _len2 = row.length; _k < _len2; x = ++_k) {
          block = row[x];
          if (block.type === type) {
            result.push(callback(block, [x, y, z]));
          }
        }
      }
    }
    return result;
  };

  LevelState.prototype.forEachBlock = function(callback) {
    var block, layer, row, x, y, z, _i, _len, _ref, _results;
    _ref = this.blockArray;
    _results = [];
    for (z = _i = 0, _len = _ref.length; _i < _len; z = ++_i) {
      layer = _ref[z];
      _results.push((function() {
        var _j, _len1, _results1;
        _results1 = [];
        for (y = _j = 0, _len1 = layer.length; _j < _len1; y = ++_j) {
          row = layer[y];
          _results1.push((function() {
            var _k, _len2, _results2;
            _results2 = [];
            for (x = _k = 0, _len2 = row.length; _k < _len2; x = ++_k) {
              block = row[x];
              _results2.push(callback(block, [x, y, z]));
            }
            return _results2;
          })());
        }
        return _results1;
      })());
    }
    return _results;
  };

  LevelState.prototype.blockAt = function(position) {
    var x, y, z;
    x = position[0], y = position[1], z = position[2];
    if (x < 0 || x >= this.width) {
      return new EmptyBlock(this, position);
    }
    if (y < 0 || y >= this.depth) {
      return new EmptyBlock(this, position);
    }
    if (z < 0 || z >= this.height) {
      return new EmptyBlock(this, position);
    }
    return this.blockArray[z][y][x];
  };

  LevelState.prototype.blockBelow = function(position) {
    var block, x, y, z;
    x = position[0], y = position[1], z = position[2];
    while (!(--z < 0)) {
      block = this.blockAt([x, y, z]);
      if (block.type !== 'empty') {
        return block;
      }
    }
    return new EmptyBlock(this, [x, y, z]);
  };

  LevelState.prototype.setBlockAt = function(position, block) {
    var x, y, z;
    block.level = this;
    block.position = position;
    x = position[0], y = position[1], z = position[2];
    return this.blockArray[z][y][x] = block;
  };

  LevelState.prototype.swapBlocksAt = function(position1, position2) {
    var block1, block2;
    block1 = this.blockAt(position1);
    block2 = this.blockAt(position2);
    this.setBlockAt(position1, block2);
    return this.setBlockAt(position2, block1);
  };

  LevelState.prototype.movePlayer = function(direction) {
    var force, offset;
    offset = (function() {
      switch (direction) {
        case 'left':
          return [-1, 0, 0];
        case 'up':
          return [0, -1, 0];
        case 'right':
          return [1, 0, 0];
        case 'down':
          return [0, 1, 0];
      }
    })();
    force = 1;
    if (this.player.move(offset, force)) {
      while (this.update()) {}
      return undefined;
    }
  };

  LevelState.prototype.update = function() {
    var changed;
    changed = false;
    this.forEachBlock(function(block) {
      return changed = changed || block.update();
    });
    return changed;
  };

  return LevelState;

})(Observable);

resource_dir = 'res/';

loadImageFile = function(filename, callback) {
  var image;
  image = new Image;
  image.onload = function() {
    return callback(image);
  };
  return image.src = resource_dir + filename;
};

loadJsonFile = function(filename, callback) {
  var request;
  request = new XMLHttpRequest;
  request.open('GET', resource_dir + filename, true);
  request.onreadystatechange = function() {
    var data;
    if (request.readyState === 4) {
      data = JSON.parse(request.responseText);
      return callback(data);
    }
  };
  return request.send();
};

loadFilesUsing = function(loadFilesFunc, filenames, callback) {
  var entry, filename, key, loaded, nLoaded, nTotal, _results;
  if (filenames instanceof Object === false) {
    filename = filenames;
    return loadFilesFunc(filename, callback);
  } else {
    if (filenames instanceof Array) {
      nTotal = filenames.length;
      loaded = [];
    } else {
      nTotal = 0;
      for (key in filenames) {
        if (!__hasProp.call(filenames, key)) continue;
        nTotal++;
      }
      loaded = {};
    }
    nLoaded = 0;
    _results = [];
    for (key in filenames) {
      if (!__hasProp.call(filenames, key)) continue;
      entry = filenames[key];
      _results.push((function(key) {
        return loadFilesUsing(loadFilesFunc, entry, function(data) {
          loaded[key] = data;
          if (++nLoaded === nTotal) {
            return callback(loaded);
          }
        });
      })(key));
    }
    return _results;
  }
};

loadImageFiles = function(filenames, callback) {
  return loadFilesUsing(loadImageFile, filenames, callback);
};

loadJsonFiles = function(filenames, callback) {
  return loadFilesUsing(loadJsonFile, filenames, callback);
};

loadResourceFiles = function(filenames, callback) {
  var imagesLoaded, jsonLoaded, loaded;
  imagesLoaded = false;
  jsonLoaded = false;
  loaded = {};
  loadImageFiles(filenames.images, function(images) {
    loaded.images = images;
    imagesLoaded = true;
    if (jsonLoaded) {
      return callback(loaded);
    }
  });
  return loadJsonFiles(filenames.json, function(json) {
    loaded.json = json;
    jsonLoaded = true;
    if (imagesLoaded) {
      return callback(loaded);
    }
  });
};

e3d = e3d || {};

e3d.Camera = (function() {

  function Camera() {
    this.position = [0, 0, 0];
    this.rotation = [0, 0, 0];
    this.distance = 0;
  }

  Camera.prototype.createMatrix = function() {
    var aspect, eye, far, fovy, matrix, near, target, up;
    fovy = 45;
    aspect = e3d.width / e3d.height;
    near = 0.1;
    far = 100;
    eye = [0, 0, 0];
    target = [0, -1, 0];
    up = [0, 0, 1];
    matrix = mat.perspective(fovy, aspect, near, far);
    matrix = mat.lookat(matrix, eye, target, up);
    matrix = mat.translate(matrix, [0, -this.distance, 0]);
    matrix = mat.rotateX(matrix, -this.rotation[0]);
    matrix = mat.rotateY(matrix, -this.rotation[1]);
    matrix = mat.rotateZ(matrix, -this.rotation[2]);
    matrix = mat.translate(matrix, vec.neg(this.position));
    return matrix;
  };

  return Camera;

})();

e3d = e3d || {};

e3d.init = function(canvas) {
  var gl;
  gl = canvas.getContext('experimental-webgl', {
    alpha: false
  });
  gl.enable(gl.DEPTH_TEST);
  e3d.width = canvas.width;
  e3d.height = canvas.height;
  e3d.gl = gl;
  e3d.scene = null;
  e3d.noTexture = new e3d.Texture(null);
  e3d.onrender = null;
  return e3d.program.mesh.init();
};

e3d.run = function() {
  var frame, requestAnimationFrame;
  requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
    return window.setTimeout(callback, 1000 / 60);
  };
  frame = function() {
    var gl;
    requestAnimationFrame(frame);
    gl = e3d.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (e3d.scene != null) {
      e3d.scene.render();
    }
    if (e3d.onrender != null) {
      return e3d.onrender();
    }
  };
  return requestAnimationFrame(frame);
};

mat = {
  row: function(m, i) {
    return [m[i * 4 + 0], m[i * 4 + 1], m[i * 4 + 2], m[i * 4 + 3]];
  },
  col: function(m, i) {
    return [m[i + 4 * 0], m[i + 4 * 1], m[i + 4 * 2], m[i + 4 * 3]];
  },
  mul: function(a, b) {
    var c0, c1, c2, c3, dot, r0, r1, r2, r3;
    c0 = mat.col(a, 0);
    c1 = mat.col(a, 1);
    c2 = mat.col(a, 2);
    c3 = mat.col(a, 3);
    r0 = mat.row(b, 0);
    r1 = mat.row(b, 1);
    r2 = mat.row(b, 2);
    r3 = mat.row(b, 3);
    dot = vec.dot4;
    return [dot(c0, r0), dot(c1, r0), dot(c2, r0), dot(c3, r0), dot(c0, r1), dot(c1, r1), dot(c2, r1), dot(c3, r1), dot(c0, r2), dot(c1, r2), dot(c2, r2), dot(c3, r2), dot(c0, r3), dot(c1, r3), dot(c2, r3), dot(c3, r3)];
  },
  translate: function(m, v) {
    var t;
    t = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, v[0], v[1], v[2], 1];
    return mat.mul(m, t);
  },
  scale: function(m, v) {
    var s;
    s = [v[0], 0, 0, 0, 0, v[1], 0, 0, 0, 0, v[2], 0, 0, 0, 0, 1];
    return mat.mul(m, s);
  },
  rotateX: function(m, a) {
    var c, r, s;
    s = Math.sin(a);
    c = Math.cos(a);
    r = [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
    return mat.mul(m, r);
  },
  rotateY: function(m, a) {
    var c, r, s;
    s = Math.sin(a);
    c = Math.cos(a);
    r = [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1];
    return mat.mul(m, r);
  },
  rotateZ: function(m, a) {
    var c, r, s;
    s = Math.sin(a);
    c = Math.cos(a);
    r = [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    return mat.mul(m, r);
  },
  lookat: function(m, eye, target, up) {
    var dot, l, x, y, z;
    z = vec.unit(vec.sub(eye, target));
    x = vec.unit(vec.cross(z, up));
    y = vec.unit(vec.cross(x, z));
    dot = vec.dot;
    l = [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
    return mat.mul(m, l);
  },
  identity: function() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },
  frustum: function(left, right, bottom, top, near, far) {
    var a00, a11, a20, a21, a22, a32;
    a00 = (near * 2) / (right - left);
    a11 = (near * 2) / (top - bottom);
    a20 = (right + left) / (right - left);
    a21 = (top + bottom) / (top - bottom);
    a22 = -(far + near) / (far - near);
    a32 = -(far * near * 2) / (far - near);
    return [a00, 0, 0, 0, 0, a11, 0, 0, a20, a21, a22, -1, 0, 0, a32, 0];
  },
  perspective: function(fovy, aspect, near, far) {
    var right, top;
    top = near * Math.tan(fovy * Math.PI / 360);
    right = top * aspect;
    return mat.frustum(-right, right, -top, top, near, far);
  }
};

e3d = e3d || {};

e3d.Mesh = (function() {

  function Mesh(data) {
    var gl, program;
    gl = e3d.gl;
    program = e3d.program.mesh;
    this.vertexbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    this.nvertices = data.length / 8;
  }

  Mesh.prototype.render = function() {
    var gl, program;
    gl = e3d.gl;
    program = e3d.program.mesh;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexbuffer);
    gl.vertexAttribPointer(program.aPositionLoc, 3, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(program.aTexCoordLoc, 2, gl.FLOAT, false, 32, 12);
    gl.vertexAttribPointer(program.aColorLoc, 3, gl.FLOAT, false, 32, 20);
    return gl.drawArrays(gl.TRIANGLES, 0, this.nvertices);
  };

  return Mesh;

})();

e3d = e3d || {};

e3d.Object = (function() {

  function Object() {
    this.position = [0, 0, 0];
    this.rotation = [0, 0, 0];
    this.scale = [1, 1, 1];
    this.meshes = [];
    this.textures = [];
    this.children = [];
  }

  Object.prototype.render = function(matrix) {
    var child, gl, i, mesh, program, _i, _j, _len, _len1, _ref, _ref1, _results;
    gl = e3d.gl;
    program = e3d.program.mesh;
    matrix = mat.translate(matrix, this.position);
    matrix = mat.rotateX(matrix, this.rotation[0]);
    matrix = mat.rotateY(matrix, this.rotation[1]);
    matrix = mat.rotateZ(matrix, this.rotation[2]);
    matrix = mat.scale(matrix, this.scale);
    program.setMatrix(matrix);
    e3d.noTexture.use();
    _ref = this.meshes;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      mesh = _ref[i];
      if (mesh != null) {
        if (this.textures[i] != null) {
          this.textures[i].use();
        }
        mesh.render();
      }
    }
    _ref1 = this.children;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      child = _ref1[_j];
      if (child != null) {
        _results.push(child.render(matrix));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Object;

})();

e3d = e3d || {};

e3d.Scene = (function() {

  function Scene() {
    this.objects = [];
    this.camera = null;
  }

  Scene.prototype.render = function() {
    var matrix, object, program, _i, _len, _ref;
    program = e3d.program.mesh;
    if (this.camera != null) {
      program.begin();
      matrix = this.camera.createMatrix();
      _ref = this.objects;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        object = _ref[_i];
        if (object != null) {
          object.render(matrix);
        }
      }
      return program.end();
    }
  };

  return Scene;

})();

e3d = e3d || {};

e3d.program = {
  mesh: {
    vertexSource: "uniform mat4 uMatrix;\nattribute vec3 aPosition;\nattribute vec2 aTexCoord;\nattribute vec3 aColor;\nvarying vec2 vTexCoord;\nvarying vec3 vColor;\n\nvoid main() {\n\n  gl_Position = uMatrix * vec4(aPosition,1);\n  vTexCoord = aTexCoord;\n  vColor = aColor;\n\n}",
    fragmentSource: "precision mediump float;\n\nuniform sampler2D uTexture;\nvarying vec2 vTexCoord;\nvarying vec3 vColor;\n\nvoid main() {\n\n  gl_FragColor = texture2D(uTexture, vTexCoord) * vec4(vColor,1);\n\n}",
    init: function() {
      var gl, me, program, uMatrixLoc, uTextureLoc;
      gl = e3d.gl;
      me = e3d.program.mesh;
      program = e3d.compileProgram(me.vertexSource, me.fragmentSource);
      uMatrixLoc = gl.getUniformLocation(program, 'uMatrix');
      uTextureLoc = gl.getUniformLocation(program, 'uTexture');
      me.aPositionLoc = gl.getAttribLocation(program, 'aPosition');
      me.aTexCoordLoc = gl.getAttribLocation(program, 'aTexCoord');
      me.aColorLoc = gl.getAttribLocation(program, 'aColor');
      gl.useProgram(program);
      gl.uniform1i(uTextureLoc, 0);
      gl.useProgram(null);
      me.setMatrix = function(matrix) {
        return gl.uniformMatrix4fv(uMatrixLoc, false, matrix);
      };
      me.begin = function() {
        gl.useProgram(program);
        gl.enableVertexAttribArray(me.aPositionLoc);
        gl.enableVertexAttribArray(me.aTexCoordLoc);
        return gl.enableVertexAttribArray(me.aColorLoc);
      };
      return me.end = function() {
        gl.disableVertexAttribArray(me.aPositionLoc);
        gl.disableVertexAttribArray(me.aTexCoordLoc);
        gl.disableVertexAttribArray(me.aColorLoc);
        return gl.useProgram(null);
      };
    }
  }
};

e3d.compileProgram = function(vertexSource, fragmentSource) {
  var compileShader, gl, program;
  gl = e3d.gl;
  compileShader = function(type, source) {
    var shader;
    shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(gl.getShaderInfoLog(shader));
      throw "compileShader fail!";
    }
    return shader;
  };
  program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getProgramInfoLog(program));
    throw "linkProgram fail!";
  }
  return program;
};

e3d = e3d || {};

e3d.Texture = (function() {

  function Texture(image) {
    var gl, pixels;
    gl = e3d.gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    if (image != null) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      this.width = image.width;
      this.height = image.height;
    } else {
      pixels = new Uint8Array([255, 255, 255, 255]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      this.width = 0;
      this.height = 0;
    }
  }

  Texture.prototype.use = function() {
    var gl;
    gl = e3d.gl;
    return gl.bindTexture(gl.TEXTURE_2D, this.texture);
  };

  Texture.prototype.free = function() {
    var gl;
    gl = e3d.gl;
    if (this.texture != null) {
      gl.deleteTexture(this.texture);
      return this.texture = null;
    }
  };

  return Texture;

})();

vec = {
  add: function(u, v) {
    return [u[0] + v[0], u[1] + v[1], u[2] + v[2]];
  },
  sub: function(u, v) {
    return [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
  },
  mul: function(v, k) {
    return [v[0] * k, v[1] * k, v[2] * k];
  },
  div: function(v, k) {
    return [v[0] / k, v[1] / k, v[2] / k];
  },
  neg: function(v) {
    return [-v[0], -v[1], -v[2]];
  },
  dot: function(u, v) {
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  },
  dot4: function(u, v) {
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3];
  },
  cross: function(u, v) {
    return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  },
  len: function(v) {
    return Math.sqrt(vec.dot(v, v));
  },
  unit: function(v) {
    return vec.div(v, vec.len(v));
  }
};

BoxObject = (function(_super) {
  var boxMeshes, boxTextures;

  __extends(BoxObject, _super);

  boxMeshes = [];

  boxTextures = [];

  BoxObject.setTextures = function(textures) {
    var index, texture, _i, _len, _results;
    _results = [];
    for (index = _i = 0, _len = textures.length; _i < _len; index = ++_i) {
      texture = textures[index];
      _results.push(boxTextures[index] = texture);
    }
    return _results;
  };

  function BoxObject(box) {
    this.box = box;
    BoxObject.__super__.constructor.call(this);
    if (boxMeshes.length === 0) {
      boxMeshes = [new e3d.Mesh(makeBox())];
    }
    this.meshes = boxMeshes;
    this.textures = boxTextures;
  }

  BoxObject.prototype.render = function(matrix) {
    this.position = this.box.position;
    return BoxObject.__super__.render.call(this, matrix);
  };

  return BoxObject;

})(e3d.Object);

LevelView = (function() {

  function LevelView() {
    var imagefiles, instance;
    this.camera = new e3d.Camera;
    this.camera.distance = 12;
    this.camera.rotation = [0.5, 0, 0];
    this.scene = new e3d.Scene;
    this.scene.camera = this.camera;
    imagefiles = {
      'sky': ['/tex/sky.png'],
      'level': ['/tex/wall.png', '/tex/floor.png', '/tex/platform.png'],
      'box': ['/tex/box.png'],
      'lift': ['/tex/lift.png', '/tex/lifttop.png'],
      'player': ['/tex/player.png']
    };
    instance = this;
    loadImageFiles(imagefiles, function(images) {
      SkyObject.setTextures(createTextures(images['sky']));
      StaticLevelObject.setTextures(createTextures(images['level']));
      BoxObject.setTextures(createTextures(images['box']));
      LiftObject.setTextures(createTextures(images['lift']));
      PlayerObject.setTextures(createTextures(images['player']));
      return e3d.scene = instance.scene;
    });
    this.currState = null;
  }

  LevelView.prototype.build = function(levelState) {
    var boxGroup, center, levelModel, liftGroup, skySphere;
    center = [levelState.width / 2, levelState.depth / 2, levelState.height / 2];
    this.camera.position = center;
    skySphere = new SkyObject;
    skySphere.position = center;
    levelModel = new StaticLevelObject(levelState);
    boxGroup = new e3d.Object;
    boxGroup.children = levelState.forEach('box', function(box, position) {
      return new BoxObject(box);
    });
    liftGroup = new e3d.Object;
    liftGroup.children = levelState.forEach('lift', function(lift, x, y, z) {
      return new LiftObject(lift);
    });
    this.player = new PlayerObject(levelState.player);
    return this.scene.objects = [skySphere, levelModel, boxGroup, liftGroup, this.player];
  };

  LevelView.prototype.update = function(levelState) {
    if (levelState !== this.currState) {
      this.currState = levelState;
      return this.build(levelState);
    }
  };

  return LevelView;

})();

LiftObject = (function(_super) {
  var liftMeshes, liftTextures;

  __extends(LiftObject, _super);

  liftMeshes = [];

  liftTextures = [];

  LiftObject.setTextures = function(textures) {
    var index, texture, _i, _len, _results;
    _results = [];
    for (index = _i = 0, _len = textures.length; _i < _len; index = ++_i) {
      texture = textures[index];
      _results.push(liftTextures[index] = texture);
    }
    return _results;
  };

  function LiftObject(lift) {
    this.lift = lift;
    LiftObject.__super__.constructor.call(this);
    if (liftMeshes.length === 0) {
      liftMeshes = [new e3d.Mesh(makeLidlessBox()), new e3d.Mesh(makeTopFace())];
    }
    this.meshes = liftMeshes;
    this.textures = liftTextures;
  }

  LiftObject.prototype.render = function(matrix) {
    this.position = this.lift.position;
    return LiftObject.__super__.render.call(this, matrix);
  };

  return LiftObject;

})(e3d.Object);

PlayerObject = (function(_super) {
  var playerMeshes, playerTextures;

  __extends(PlayerObject, _super);

  playerMeshes = [];

  playerTextures = [];

  PlayerObject.setTextures = function(textures) {
    var index, texture, _i, _len, _results;
    _results = [];
    for (index = _i = 0, _len = textures.length; _i < _len; index = ++_i) {
      texture = textures[index];
      _results.push(playerTextures[index] = texture);
    }
    return _results;
  };

  function PlayerObject(player) {
    this.player = player;
    PlayerObject.__super__.constructor.call(this);
    if (playerMeshes.length === 0) {
      playerMeshes = [new e3d.Mesh(makeBox())];
    }
    this.meshes = playerMeshes;
    this.textures = playerTextures;
  }

  PlayerObject.prototype.render = function(matrix) {
    this.position = this.player.position;
    return PlayerObject.__super__.render.call(this, matrix);
  };

  return PlayerObject;

})(e3d.Object);

SkyObject = (function(_super) {
  var skyMeshes, skyTextures;

  __extends(SkyObject, _super);

  skyMeshes = [];

  skyTextures = [];

  SkyObject.setTextures = function(textures) {
    var index, texture, _i, _len, _results;
    _results = [];
    for (index = _i = 0, _len = textures.length; _i < _len; index = ++_i) {
      texture = textures[index];
      _results.push(skyTextures[index] = texture);
    }
    return _results;
  };

  function SkyObject() {
    SkyObject.__super__.constructor.call(this);
    if (skyMeshes.length === 0) {
      skyMeshes[0] = null;
      loadJsonFile('mod/sky.json', function(sky) {
        return skyMeshes[0] = new e3d.Mesh(sky);
      });
    }
    this.meshes = skyMeshes;
    this.textures = skyTextures;
    this.scale = [90, 90, 90];
  }

  return SkyObject;

})(e3d.Object);

StaticLevelObject = (function(_super) {
  var levelTextures;

  __extends(StaticLevelObject, _super);

  levelTextures = [];

  StaticLevelObject.setTextures = function(textures) {
    var index, texture, _i, _len, _results;
    _results = [];
    for (index = _i = 0, _len = textures.length; _i < _len; index = ++_i) {
      texture = textures[index];
      _results.push(levelTextures[index] = texture);
    }
    return _results;
  };

  function StaticLevelObject(levelState) {
    var depth, platformTop, side, solidTop, width;
    StaticLevelObject.__super__.constructor.call(this);
    width = levelState.width;
    depth = levelState.depth;
    side = [];
    solidTop = [];
    platformTop = [];
    levelState.forEachBlock(function(block, position) {
      var backBlock, frontBlock, leftBlock, rightBlock, topBlock;
      if (block["static"]) {
        leftBlock = levelState.blockAt(vec.add(position, [-1, 0, 0]));
        rightBlock = levelState.blockAt(vec.add(position, [1, 0, 0]));
        backBlock = levelState.blockAt(vec.add(position, [0, -1, 0]));
        frontBlock = levelState.blockAt(vec.add(position, [0, 1, 0]));
        topBlock = levelState.blockAt(vec.add(position, [0, 0, 1]));
        if (!leftBlock["static"]) {
          side = side.concat(makeLeftFace(position));
        }
        if (!rightBlock["static"]) {
          side = side.concat(makeRightFace(position));
        }
        if (!backBlock["static"]) {
          side = side.concat(makeBackFace(position));
        }
        if (!frontBlock["static"]) {
          side = side.concat(makeFrontFace(position));
        }
        if (!topBlock["static"]) {
          if (block.type === 'solid') {
            solidTop = solidTop.concat(makeTopFace(position));
          }
          if (block.type === 'platform') {
            return platformTop = platformTop.concat(makeTopFace(position));
          }
        }
      }
    });
    this.meshes = [new e3d.Mesh(side), new e3d.Mesh(solidTop), new e3d.Mesh(platformTop)];
    this.textures = levelTextures;
  }

  return StaticLevelObject;

})(e3d.Object);

createTextures = function(images) {
  var image, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = images.length; _i < _len; _i++) {
    image = images[_i];
    _results.push(new e3d.Texture(image));
  }
  return _results;
};

makeQuad = function(positions, color) {
  var b, g, p, r, v;
  p = positions;
  r = color[0], g = color[1], b = color[2];
  v = [[p[0][0], p[0][1], p[0][2], 0, 0, r, g, b], [p[1][0], p[1][1], p[1][2], 1, 0, r, g, b], [p[2][0], p[2][1], p[2][2], 0, 1, r, g, b], [p[3][0], p[3][1], p[3][2], 1, 1, r, g, b]];
  return [].concat(v[0], v[1], v[2], v[3], v[2], v[1]);
};

makeLeftFace = function(position) {
  var color, positions, x, y, z;
  if (position == null) {
    position = [0, 0, 0];
  }
  x = position[0], y = position[1], z = position[2];
  positions = [[x, y, z + 1], [x, y + 1, z + 1], [x, y, z], [x, y + 1, z]];
  color = [0.7, 0.7, 0.7];
  return makeQuad(positions, color);
};

makeRightFace = function(position) {
  var color, positions, x, y, z;
  if (position == null) {
    position = [0, 0, 0];
  }
  x = position[0], y = position[1], z = position[2];
  positions = [[x + 1, y + 1, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z], [x + 1, y, z]];
  color = [0.8, 0.8, 0.8];
  return makeQuad(positions, color);
};

makeBackFace = function(position) {
  var color, positions, x, y, z;
  if (position == null) {
    position = [0, 0, 0];
  }
  x = position[0], y = position[1], z = position[2];
  positions = [[x + 1, y, z + 1], [x, y, z + 1], [x + 1, y, z], [x, y, z]];
  color = [0.6, 0.6, 0.6];
  return makeQuad(positions, color);
};

makeFrontFace = function(position) {
  var color, positions, x, y, z;
  if (position == null) {
    position = [0, 0, 0];
  }
  x = position[0], y = position[1], z = position[2];
  positions = [[x, y + 1, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z], [x + 1, y + 1, z]];
  color = [0.9, 0.9, 0.9];
  return makeQuad(positions, color);
};

makeTopFace = function(position) {
  var color, positions, x, y, z;
  if (position == null) {
    position = [0, 0, 0];
  }
  x = position[0], y = position[1], z = position[2];
  positions = [[x, y, z + 1], [x + 1, y, z + 1], [x, y + 1, z + 1], [x + 1, y + 1, z + 1]];
  color = [1.0, 1.0, 1.0];
  return makeQuad(positions, color);
};

makeLidlessBox = function(position) {
  return [].concat(makeLeftFace(position), makeRightFace(position), makeBackFace(position), makeFrontFace(position));
};

makeBox = function(position) {
  return [].concat(makeLidlessBox(position), makeTopFace(position));
};

View = function(canvas) {
  e3d.init(canvas);
  this.level = null;
  return this.update = function(context) {};
};
