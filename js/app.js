  /**
  * 游戏相关配置
  * @type {Object}
  */
  var CONFIG = {
    status: 'start', // 游戏开始默认为开始中
    level: 1, // 游戏默认等级
    totalLevel: 6, // 总共6关
    numPerLine: 7, // 游戏默认每行多少个怪兽
    canvasPadding: 30, // 默认画布的间隔
    bulletSize: 10, // 默认子弹长度
    bulletSpeed: 10, // 默认子弹的移动速度
    enemySpeed: 2, // 默认敌人移动距离
    enemySize: 50, // 默认敌人的尺寸
    enemyGap: 10,  // 默认敌人之间的间距
    enemyIcon: './img/enemy.png', // 怪兽的图像
    enemyBoomIcon: './img/boom.png', // 怪兽死亡的图像
    enemyDirection: 'right', // 默认敌人一开始往右移动
    planeSpeed: 5, // 默认飞机每一步移动的距离
    planeSize: {
      width: 60,
      height: 100
    }, // 默认飞机的尺寸,
    planeIcon: './img/plane.png',
  };
 // 元素
var container = document.getElementById('game');
var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");
var image = new Image();
var image1 = new Image();
var image2 = new Image();
var score = document.querySelector('.score');
var ltext = document.querySelector('.game-success .game-next-level');
var bossAnimateID;
//怪兽移动最大的Y值
var maxY = canvas.height - CONFIG.canvasPadding - CONFIG.planeSize.height - CONFIG.enemySize;
//怪兽生存图片
image.src = CONFIG.enemyIcon;
//怪兽死亡图片
image1.src = CONFIG.enemyBoomIcon;
//飞机图片
image2.src = CONFIG.planeIcon;
// requestAnimationFrame兼容写法
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
                                      window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());
/**
 * 整个游戏对象
 */
var GAME = {
  //分数
  grade: 0,
  //游戏等级
  level: CONFIG.level,
  //怪兽数组
  enemyArr: [],
  //飞机对象
  plane: null,
  //子弹对象
  bulletArr: [],
  /**
   * 初始化函数,这个函数只执行一次
   * @param  {object} opts 
   * @return {[type]}      [description]
   */
  init: function(opts) {
    this.status = CONFIG.status;
    this.bindEvent();
  },
  bindEvent: function() {
    var self = this;
    var playBtn = document.querySelector('.js-play');
    var replayBtn = document.querySelectorAll('.js-replay')[0];
    var sreplayBtn = document.querySelectorAll('.js-replay')[1];
    var nextBtn = document.querySelector('.js-next');
    //声音按钮
    var soundBtn = document.querySelector('.iconfont');
    // 开始游戏按钮绑定
    playBtn.onclick = function() {
      self.play();
    };
    //重新开始游戏按钮绑定
    replayBtn.onclick = function() {
      self.play();
    }
    //继续下一关游戏
    nextBtn.onclick = function() {
      self.play();
    }
    //声音控制
    soundBtn.onclick = function() {
      if (soundBtn.classList[1] === 'icon-soundOn') {
        soundBtn.classList.remove('icon-soundOn');
        soundBtn.classList.add('icon-soundOff');
        BGM.status = 'off';
        BGM.mainBGM.pause();
      }else {
        soundBtn.classList.remove('icon-soundOff');
        soundBtn.classList.add('icon-soundOn');
        BGM.status = 'on';
        BGM.mainBGM.play();
      }
    }
    //再玩一次
    sreplayBtn.onclick = function() {
      self.play();
    }
  },
  addGrade: function() {
    this.grade++;
  },
  initGrade: function() {
    context.font = '18px';
    context.fillStyle = 'white';
    context.fillText('分数: '+this.grade, 20, 20);
  },
  initEnemys: function() {
    //生成Boss
    if (GAME.level === CONFIG.totalLevel) {
      this.enemyArr[0] = new Enemy(canvas.width / 2 - 150, CONFIG.canvasPadding, 150, 150, CONFIG.enemyDirection);
      this.enemyArr[0].drawBoss();
      BGM.mainBGM.src = 'sound-font/bossbg.mp3';
      BGM.mainBGM.load();
      return;
    }
    //生成普通关卡怪兽
    for (var i = 0; i < GAME.level; i++) {
      //当行怪兽
      var lenemys = [];

      for (var j = 0; j < CONFIG.numPerLine; j++) {
        lenemys[j] = new Enemy(CONFIG.canvasPadding + (CONFIG.enemySize + CONFIG.enemyGap) * j,
        CONFIG.canvasPadding + (CONFIG.enemySize + CONFIG.enemyGap) * i,
        CONFIG.enemySize, CONFIG.enemySize, CONFIG.enemyDirection);
        lenemys[j].draw();
      }

      this.enemyArr[i] = lenemys;
    }
  },
  /**
   * 更新游戏状态，分别有以下几种状态：
   * start  游戏前
   * playing 游戏中
   * failed 游戏失败
   * success 游戏成功
   * stop 游戏暂停
   */
  setStatus: function(status) {
    this.status = status;
    container.setAttribute("data-status", status);
  },
  play: function() {
    this.setStatus('playing');
    this.initGrade();
    //初始化怪兽
    this.initEnemys();
    //初始化飞机
    this.plane = new Plane(canvas.width / 2, canvas.height - CONFIG.canvasPadding - CONFIG.planeSize.height, CONFIG.planeSize.width, CONFIG.planeSize.height);
    this.plane.draw();
    keyborderEvent('on');
    BGM.setVolume();
    if(BGM.status === 'on') {
      BGM.mainBGM.play();
    }
  }
};
/**
 * 怪兽对象
 */
function Enemy(x, y, width, height, movedir) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.movedir = movedir;
  this.animateID = null;
}
/**
 * Boss绘制函数
 */
Enemy.prototype.drawBoss = function() {
  var eself = this;

  if (image.complete) {
    context.drawImage(image, eself.x, eself.y, eself.width, eself.height);
    (function BossAnimate() {
      var lx = eself.x;
      var ly = eself.y;
      eself.moveBoss();
      context.clearRect(lx, ly, eself.width, eself.height);
      context.drawImage(image, eself.x, eself.y, eself.width, eself.height);
      eself.animateID = requestAnimationFrame(BossAnimate);
    })();
    if (GAME.level === CONFIG.totalLevel) {
      //每隔5s发射一枚子弹
     bossAnimateID = setInterval(function() {
        var bossbullet = new Bullet((eself.x + (eself.width / 2)),
        eself.y + eself.height, 1, CONFIG.bulletSize, CONFIG.bulletSpeed);
        bossbullet.bossMove();
      }, 5000);
    }
    return;
  }

  image.onload = function() {
    context.drawImage(image, eself.x, eself.y, eself.width, eself.height);
    (function BossAnimate() {
      var lx = eself.x;
      var ly = eself.y;
      eself.moveBoss();
      context.clearRect(lx, ly, eself.width, eself.height);
      context.drawImage(image, eself.x, eself.y, eself.width, eself.height);
      eself.animateID = requestAnimationFrame(BossAnimate);
    })();
    if (GAME.level === CONFIG.totalLevel) {
     bossAnimateID = setInterval(function() {
        var bossbullet = new Bullet((eself.x + (eself.width / 2)),
        eself.y + eself.height, 1, CONFIG.bulletSize, CONFIG.bulletSpeed);
        bossbullet.bossMove();
      }, 5000);
    }
  };
};
/**
 * 普通怪兽绘制函数
 */
Enemy.prototype.draw = function() {
  var eself = this;

  if (image.complete) {
    context.drawImage(image, eself.x, eself.y, eself.width, eself.height);
    (function enemyAnimate() {
      var lx = eself.x;
      var ly = eself.y;
      eself.move();
      context.clearRect(lx, ly, eself.width, eself.height);
      context.drawImage(image, eself.x, eself.y, eself.width, eself.height);
      eself.animateID = requestAnimationFrame(enemyAnimate);
      //游戏结束,停止动画 
      if (eself.y > maxY) {
        cancleAllAimate();
        GAME.enemyArr = [];
        GAME.plane = null;
        GAME.bulletArr = [];
        context.clearRect(0, 0, canvas.width, canvas.height);
        keyborderEvent('off');
        score.innerHTML = '';
        score.innerHTML = GAME.grade;
        GAME.setStatus('failed');
        GAME.level = CONFIG.level;
        GAME.grade = 0;
      }
    })();
    return;
  }

  image.onload = function() {
    context.drawImage(image, eself.x, eself.y, eself.width, eself.height);
    (function enemyAnimate() {
      var lx = eself.x;
      var ly = eself.y;
      eself.move();
      context.clearRect(lx, ly, eself.width, eself.height);
      context.drawImage(image, eself.x, eself.y, eself.width, eself.height);
      eself.animateID = requestAnimationFrame(enemyAnimate);
      if (eself.y > maxY) {
        cancleAllAimate();
        GAME.enemyArr = [];
        GAME.plane = null;
        GAME.bulletArr = [];
        context.clearRect(0, 0, canvas.width, canvas.height);
        keyborderEvent('off');
        score.innerHTML = '';
        score.innerHTML = GAME.grade;
        GAME.setStatus('failed');
        GAME.level = CONFIG.level;
        GAME.grade = 0;
      }
    })();
  };
};
Enemy.prototype.moveX = function() {
  //从左往右移动
  if (this.movedir === 'right') {
    this.x += CONFIG.enemySpeed;
  }else if (this.movedir === 'left') {
    this.x -= CONFIG.enemySpeed;
  }
};
Enemy.prototype.moveY = function() {
  var h = CONFIG.enemySize;
  //怪兽移动到最后一行的处理
  if ((this.y + CONFIG.enemySize - maxY) > 0 && (this.y + CONFIG.enemySize - maxY) < CONFIG.enemySize) {
    h = maxY - this.y;
  }
  this.y += h;
};
/**
 * Boss的移动函数
 */
Enemy.prototype.moveBoss = function() {
  if (this.x < CONFIG.canvasPadding) {
    this.x = CONFIG.canvasPadding - CONFIG.enemySpeed;
    this.movedir = 'right';
    this.moveX();
  }else if (this.x > (canvas.width - CONFIG.canvasPadding - this.width)) {
    this.x = (canvas.width - CONFIG.canvasPadding -  this.width) + CONFIG.enemySpeed;
    this.movedir = 'left';
    this.moveX();
  }else {
    this.moveX();
  }
};
/**
 * 普通怪兽移动函数
 */
Enemy.prototype.move = function() {
  if (this.x < CONFIG.canvasPadding) {
    this.x = CONFIG.canvasPadding - CONFIG.enemySpeed;
    this.movedir = 'right';
    newLine('right');
  }else if (this.x > (canvas.width - CONFIG.canvasPadding -  this.width)) {
    this.x = (canvas.width - CONFIG.canvasPadding -  this.width) + CONFIG.enemySpeed;
    this.movedir = 'left';
    newLine('left');
  }else {
    this.moveX();
  }
};
/**
 * 怪兽消灭时的动画函数
 */
Enemy.prototype.destroy = function() {
  var eself = this;

  if (image1.complete) {
    (function destroy() {
      setTimeout(function() {
        cancelAnimationFrame(eself.animateID);
        context.clearRect(eself.x, eself.y, eself.width, eself.height);
        context.drawImage(image1, eself.x, eself.y, eself.width, eself.height);
      }, 50);
      setTimeout(function() {
        context.clearRect(eself.x, eself.y, eself.width, eself.height);
      }, 100);
    })();
    return;
  }

  image1.onload = function() {
    (function destroy() {
      setTimeout(function() {
        cancelAnimationFrame(eself.animateID);
        context.clearRect(eself.x, eself.y, eself.width, eself.height);
        context.drawImage(image1, eself.x, eself.y, eself.width, eself.height);
      }, 150);
      setTimeout(function() {
        context.clearRect(eself.x, eself.y, eself.width, eself.height);
      }, 250);
    })();
  };
};
/**
 * 控制整行怪兽的换行
 * @param {Array} objs 怪兽对象数组
 * @param {String} dir 怪兽移动方向
 */
function newLine(dir) {
  var objs = GAME.enemyArr;
  for (var i = 0; i < objs.length; i++) {
    for (var j = 0; j < objs[i].length; j++) {
      context.clearRect(objs[i][j].x, objs[i][j].y, objs[i][j].width, objs[i][j].height);
      objs[i][j].moveY();
      objs[i][j].movedir = dir;
      objs[i][j].moveX();
    }
  }
}
/**
 * 取消所有生存怪兽的动画
 * 
 */
function cancleAllAimate() {
  var objs = GAME.enemyArr;
  for (var i = 0; i < objs.length; i++) {
    for (var j = 0; j < objs[i].length; j++) {
      cancelAnimationFrame(objs[i][j].animateID);
    }
  }
  for (var i = 0; i < GAME.bulletArr.length; i++) {
    cancelAnimationFrame(GAME.bulletArr[i].animateID);
  }
}
/**
 * 子弹对象
 * @param {Number} x 子弹的横坐标
 * @param {Number} y 子弹的纵坐标
 * @param {Number} sizeW 子弹的宽度
 * @param {Number} sizeH 子弹的长度
 * @param {Number} speed 子弹的飞行速度
 */
function Bullet(x, y, sizeW, sizeH, speed) {
  this.x = x;
  this.y = y;
  this.sizeW = sizeW;
  this.sizeH = sizeH;
  this.speed = speed;
  this.animateID = null;
}
Bullet.prototype.draw = function() {
  context.beginPath();
  context.moveTo(this.x, this.y);
  context.lineTo(this.x, this.y-this.sizeH);
  context.lineWidth = this.sizeW;
  context.strokeStyle = 'white';
  context.closePath();
  context.stroke();
};
/**
 * Boss子弹的绘制函数
 */
Bullet.prototype.bossBulletDraw = function() {
  context.beginPath();
  context.moveTo(this.x, this.y);
  context.lineTo(this.x, this.y + this.sizeH);
  context.lineWidth = this.sizeW;
  context.strokeStyle = 'white';
  context.closePath();
  context.stroke();
}
Bullet.prototype.moveAnimate = function() {
  var bself = this;
  bself.draw();
  (function bulletAnimate() {
    context.clearRect(bself.x-1, bself.y - bself.sizeH, bself.sizeW+1, bself.sizeH);
    bself.y -= bself.speed;
    bself.draw();
    bself.animateID = requestAnimationFrame(bulletAnimate);
    bself.enemyCD();
  })();
};
/**
 * Boss发射的子弹的动画函数
 */
Bullet.prototype.bossMove = function() {
  var bself = this;
  bself.bossBulletDraw();
  (function bossBullet() {
    context.clearRect(bself.x-1, bself.y - 1, bself.sizeW+1, bself.sizeH);
    bself.y += bself.speed;
    bself.bossBulletDraw();
    bself.animateID = requestAnimationFrame(bossBullet);
    bself.bossCD();
  })();
};
/**
 * Boss发射的子弹与飞机的碰撞检测
 */
Bullet.prototype.bossCD = function() {
  var bself = this;
  if (CD(bself, GAME.plane)) {
    cancelAnimationFrame(bself.animateID);
    cancelAnimationFrame(GAME.enemyArr[0].animateID);
    clearInterval(bossAnimateID);
    context.clearRect(bself.x-1, bself.y - bself.sizeH, bself.sizeW+1, bself.sizeH);
    for (var i = 0; i < GAME.bulletArr.length; i++) {
      cancelAnimationFrame(GAME.bulletArr[i].animateID);
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    keyborderEvent('off');
    GAME.enemyArr = [];
    score.innerHTML = '';
    score.innerHTML = GAME.grade;
    GAME.setStatus('failed');
    GAME.level = CONFIG.level;
    GAME.grade = 0;
  }
}
/**
 * 子弹与怪兽的碰撞检测
 * @return {[type]} [description]
 */
Bullet.prototype.enemyCD = function() {
  var bself = this;
  if (GAME.level === CONFIG.totalLevel) {
    if (CD(bself, GAME.enemyArr[0])) {
      cancelAnimationFrame(bself.animateID);
      context.clearRect(bself.x-1, bself.y - bself.sizeH, bself.sizeW+1, bself.sizeH);
      //当Boss的大小在CONFIG.enemySize~150之间时，子弹打击会让Boss不断变小，到达CONFIG.enemySize时，一枪就Boom!
      if (GAME.enemyArr[0].width === CONFIG.enemySize) {
        GAME.enemyArr[0].destroy();
        GAME.addGrade();
        GAME.enemyArr = [];
        clearInterval(bossAnimateID);
        GAME.setStatus('all-success');
        GAME.grade = 0;
        GAME.level = CONFIG.level;
        for (var i = 0; i < GAME.bulletArr.length; i++) {
          cancelAnimationFrame(GAME.bulletArr[i].animateID);
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        keyborderEvent('off');
        return;
      }else {
        GAME.enemyArr[0].width -= 0.5;
        GAME.enemyArr[0].height -= 0.5;
        return;
      }
    }
  }
  for (var i = 0; i < GAME.enemyArr.length; i++) {
    for (var j = 0; j < GAME.enemyArr[i].length; j++) {
      if (CD(bself, GAME.enemyArr[i][j])) {
        GAME.addGrade();
        context.clearRect(0, 0, canvas.width, 30);
        context.beginPath();
        GAME.initGrade();
        cancelAnimationFrame(bself.animateID);
        context.clearRect(bself.x-1, bself.y - bself.sizeH, bself.sizeW+1, bself.sizeH);
        GAME.enemyArr[i][j].destroy();
        GAME.enemyArr[i] = GAME.enemyArr[i].filter(function(item, index) {
          return item !==  GAME.enemyArr[i][j];
        });
        if (GAME.enemyArr[i].length === 0) {
          GAME.enemyArr.splice(i, 1);
        }
        GAME.bulletArr = GAME.bulletArr.filter(function(item, index) {
          return item !== bself;
        });
        if (GAME.enemyArr.length === 0) {
            GAME.level++;
            ltext.innerHTML = '';
            ltext.innerHTML = '下一个Level: ' + GAME.level;
            GAME.setStatus('success');
          for (var i = 0; i < GAME.bulletArr.length; i++) {
            cancelAnimationFrame(GAME.bulletArr[i].animateID);
          }
          context.clearRect(0, 0, canvas.width, canvas.height);
          keyborderEvent('off');
        }
        break;
      }
    }
  }

};
/**
 * 飞机对象
 */
function Plane(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}
Plane.prototype.draw = function() {
  var pself = this;
  if (image2.complete) {
    context.clearRect(CONFIG.canvasPadding, canvas.height - CONFIG.canvasPadding - CONFIG.planeSize.height,
    canvas.width, CONFIG.planeSize.height + CONFIG.canvasPadding);
    context.drawImage(image2, pself.x, pself.y, pself.width, pself.height);
    return;
  }
  image2.onload = function() {
    context.clearRect(CONFIG.canvasPadding, canvas.height - CONFIG.canvasPadding - CONFIG.planeSize.height,
    canvas.width, CONFIG.planeSize.height + CONFIG.canvasPadding);
    context.drawImage(image2, pself.x, pself.y, pself.width, pself.height);
  };
};
Plane.prototype.move = function(keyborder) {
  switch(keyborder) {
    case '37':
      this.x - CONFIG.planeSpeed < CONFIG.canvasPadding ? this.x = CONFIG.canvasPadding : this.x -= CONFIG.planeSpeed;
      this.draw();
      break;
    case '39':
      this.x + CONFIG.planeSpeed > (canvas.width - CONFIG.canvasPadding - CONFIG.planeSize.width)
      ? this.x = canvas.width - CONFIG.canvasPadding - CONFIG.planeSize.width
      : this.x += CONFIG.planeSpeed;
      this.draw();
      break;
  }
}
/**
 * 碰撞检测函数
 * @param {Object} r1 矩形对象
 * @param {Object} r2 矩形对象
 * @return {Boolean} 是否发生碰撞
 */
function CD(r1, r2) {
  if (!(r2.width + r2.x < r1.x) && !(r1.sizeW + r1.x < r2.x) &&
      !(r1.sizeH + r1.y < r2.y) && !(r2.height + r2.y < r1.y)) {
    return true;
  } else {
    return false;
  }
}
function keyborderEvent(status) {
  var ltime;
  var ntime;
  if (status === 'off') {
    document.onkeydown = null;
  }else {
    var keyPressed = {};
    document.onkeyup = function(e) {
      ntime = Date.now();
      var key = e.keyCode || e.which || e.charCode;
      keyPressed[key] = false;
      if (ntime - ltime > 5) {
        BGM.bulletBGM.pause();
      }
    };
    document.onkeydown = function(e) {
      var key = e.keyCode || e.which || e.charCode;
      keyPressed[key] = true;
    };
    setInterval(function() {
      if (GAME.enemyArr.length === 0) {
        return;
      }
      for (var key in keyPressed) {
        if (keyPressed[key]) {
          if (key === '37' || key === '39') {
            GAME.plane.move(key);
          }
        }
      }
    }, 18);
    setInterval(function() {
      if (GAME.enemyArr.length === 0) {
        return;
      }
      for (var key in keyPressed) {
        if (keyPressed[key]) {
          var newBullet;
          if (key === '38' || key === '32') {
            newBullet = new Bullet((GAME.plane.x + (GAME.plane.width / 2)), GAME.plane.y, 1, CONFIG.bulletSize, CONFIG.bulletSpeed);
            if (BGM.status === 'on') {
              BGM.bulletBGM.currentTime = 0.3;
              BGM.bulletBGM.play();
              ltime = Date.now();
            }
            newBullet.moveAnimate();
            GAME.bulletArr.push(newBullet);
          }
        }
      }
    }, 75);
  }
}
var BGM = {
  status: 'on',
  bulletBGM: document.querySelector('#bullet-bgm'),
  mainBGM: document.querySelector('#main-bgm'),
  setVolume: function() {
    this.mainBGM.volume = 0.12;
    this.bulletBGM.volume = 1.0;
  }
}
//飞机移动流畅性有问题(遗留问题)
// 初始化
GAME.init();
