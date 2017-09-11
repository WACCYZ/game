 // 元素
var container = document.getElementById('game');
var score = document.querySelector('.score');
var ltext = document.querySelector('.game-level');
var lnext = document.querySelector('.game-success .game-next-level');
var btn = document.querySelector('.unabled');
//画布
var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");
var canvasWidth = canvas.clientWidth;
var canvasHeight = canvas.clientHeight;
/**
 * 整个游戏对象
 */
var GAME = {
    //分数
    grade: 0,
    //游戏等级
    level: 0,
    //怪兽数组
    enemyArr: [],
    //飞机对象
    plane: null,
    /**
    * 初始化函数,这个函数只执行一次
    * @param  {object} opts
    * @return {[type]}      [description]
    */
    init: function() {
        var self = this;
        var opts = Object.assign({}, CONFIG);
        this.opts = opts;
        this.level = opts.level;
        var padding = opts.canvasPadding;
        this.padding = padding;

        //怪兽相关极限坐标
        this.enemyMaxY = canvasHeight - padding - opts.planeSize.height - opts.enemySize;
        this.enemyMinX = padding;
        this.enemyMaxX = canvasWidth - padding -  opts.enemySize;

        //飞机相关坐标
        var planeWidth = opts.planeSize.width;
        this.planePosX = canvasWidth / 2 - planeWidth;
        this.planePosY = canvasHeight - padding - opts.planeSize.height;
        this.planeMinX = padding;
        this.planeMaxX = canvasWidth - padding -  planeWidth;

        this.status = opts.status;
        this.keyboard = new keyBoard();
        this.bgm = BGM;
        ltext.innerHTML = '当前Level: ' + this.level;
        //资源相关
        var pictures = [
            opts.enemyIcon,
            opts.enemyBoomIcon,
            opts.planeIcon
        ];
        var music = [
            opts.generalBGMSrc,
            opts.bossBGMSrc,
            opts.shootBGMSrc
        ];
        util.resourceLoad(pictures, music, function(images, audios) {
            opts.enemyIconImg = images[0];
            opts.enemyBoomIconImg = images[1];
            opts.planeIconImg = images[2];
            self.bgm.generalBGM = audios[0];
            self.bgm.bossBGM = audios[1];
            self.bgm.shootBGM = audios[2];
            self.opts = opts;
            btn.classList.remove('unabled');
            btn.classList.add('button');
            self.bindEvent();
        })
    },
  bindEvent: function() {
    var self = this;
    var playBtn = document.querySelector('.js-play');
    var gamePanel= document.querySelector('.game-panel');
    var nextBtn = document.querySelector('.js-next');
    //声音按钮
    var soundBtn = document.querySelector('.iconfont');
    // 开始游戏按钮绑定
    playBtn.onclick = function() {
      self.play();
    };
    // 重新玩游戏按钮绑定
    gamePanel.addEventListener('click', function(e) {
        if (e.target.classList[0] === 'js-replay') {
            self.level = self.opts.level;
            self.play();
            self.grade = 0;
        }
    }, false);
    //继续下一关游戏
    nextBtn.onclick = function() {
      self.play();
    }
    //声音控制
    soundBtn.onclick = function() {
      if (soundBtn.classList[1] === 'icon-soundOn') {
        soundBtn.classList.remove('icon-soundOn');
        soundBtn.classList.add('icon-soundOff');
        self.bgm.status = 'off';
        self.bgm.off();
      }else {
        soundBtn.classList.remove('icon-soundOff');
        soundBtn.classList.add('icon-soundOn');
        self.bgm.status = 'on';
        self.bgm.setVolume();
      }
    }
  },
  initGrade: function() {
    context.font = '18px';
    context.fillStyle = 'white';
    context.fillText('分数: '+this.grade, 20, 20);
  },
  initEnemys: function() {
    var opts = this.opts;
    var padding = this.padding;
    var level = this.level;
    var enemyGap = opts.enemyGap;
    var numPerLine = opts.numPerLine;
    var enemySize = opts.enemySize;
    var enemySpeed = opts.enemySpeed;
    var liveIcon = opts.enemyIconImg;
    var boomIcon = opts.enemyBoomIconImg;
    var maxY = this.enemyMaxY;
    var bgm = this.bgm;
    this.enemyArr = [];
    this.taskType = 'general';
    //生成Boss
    if (this.level === opts.totalLevel) {
      this.enemyArr.push(new Boss({
        x: canvasWidth / 2 - 150,
        y: padding,
        size: 150,
        speed: enemySpeed,
        liveIcon: liveIcon,
        boomIcon: boomIcon,
        limiteY: canvasHeight
      }));
      bgm.generalBGM.pause();
      bgm.bossBGM.play();
      bgm.status === 'on' ? bgm.setVolume() : bgm.off();
      this.taskType = 'boss';
      return;
    }
    //生成普通关卡怪兽
    for (var i = 0; i < level; i++) {
      for (var j = 0; j < numPerLine; j++) {
        var enemyInit = {
          x: padding + j * (enemySize + enemyGap),
          y: padding + i * enemySize,
          size: enemySize,
          speed: enemySpeed,
          liveIcon: liveIcon,
          boomIcon: boomIcon,
          maxY: maxY
        }
        this.enemyArr.push(new Enemy(enemyInit));
      }
    }
    bgm.bossBGM.pause();
    bgm.generalBGM.play();
    bgm.status === 'on' ? bgm.setVolume() : bgm.off();
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
        //移动方向(不重置存会导致偶数次重新开始游戏怪兽的初始移动方向为左)
        this.opts.enemyDirection = 'right';
        //初始化怪兽
        this.initEnemys();
        //初始化飞机
        this.plane = new Plane({
            x: this.planePosX,
            y: this.planePosY,
            size: this.opts.planeSize,
            icon: this.opts.planeIconImg,
            speed: this.opts.planeSpeed
        });
        this.setStatus('playing');
        this.update();
    },
    /**
    * 结束方式有三种
    * - all-success
    * - success
    * - failed
    */
    end: function(type) {
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        switch (type) {
            case 'failed':
                score.innerHTML = this.grade;
                break;
            case 'success':
                lnext.innerHTML = '下一个Level: ' + ++this.level;
                break;
        }
        this.setStatus(type);
    },
    update: function() {
        var self = this;
        var opts = this.opts;
        var enemies = this.enemyArr;
        var plane = this.plane;
        var endType;
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        this.updateEnemies();
        this.updatePlane();
        if (enemies.length === 0) {
            endType = this.level === opts.totalLevel ? 'all-success' : 'success';
            this.end(endType);
            return;
        }
        if (enemies[enemies.length - 1].y > this.enemyMaxY) {
            endType = 'failed';
            this.end(endType);
            return;
        }
        if (enemies[0].isHit && enemies[0].isHit(plane)) {
            endType = 'failed';
            this.end(endType);
            return;
        }
        this.draw();
        requestAnimationFrame(function() {
            self.update();
        })
    },
    updateEnemies : function() {
        var opts = this.opts;
        var needDown = false;
        var plane = this.plane;
        var enemies = this.enemyArr;
        var bulletSize = this.opts.bulletSize;
        var bulletSpeed = this.opts.bulletSpeed;
        var enemyMaxX;
        //飞机初始化的时间，作为怪兽发射子弹的时间起点
        this.lastTime = this.lastTime ? this.lastTime : plane.lastTime;
        //得到当前怪兽中最大、最小横坐标
        var enemiesXY = util.getHorizontalBoundary(enemies);
        if (this.taskType === 'boss') {
            enemyMaxX = this.enemyMaxX + opts.enemySize - enemies[0].size;
        }else {
            enemyMaxX = this.enemyMaxX;
        }
        //判断是否需要换行
        if (enemiesXY.minX < this.enemyMinX || enemiesXY.maxX > enemyMaxX) {
            opts.enemyDirection = opts.enemyDirection === 'right' ? 'left' : 'right';
            needDown = this.taskType === 'boss' ? false : true;
        }
        for (var i = enemies.length - 1; i >= 0; i--) {
            if (needDown) {
                enemies[i].moveY();
            }
            enemies[i].moveX(opts.enemyDirection);
            switch (enemies[i].status) {
                case 'living':
                    //判断是否被击中
                    if (plane.isHit(enemies[i], this.taskType)) {
                        enemies[i].booming();
                    }
                    break;
                case 'booming':
                    enemies[i].booming();
                    break;
                case 'boomed':
                    enemies.splice(i, 1);
                    this.grade++;
                    break;
            }
        }
        if (this.taskType === 'boss' && Date.now() - this.lastTime > 1000) {
            enemies[0].shoot(bulletSize, bulletSpeed);
            this.lastTime = Date.now();
        }
    },
    updatePlane: function() {
        var keyboard = this.keyboard;
        var minX = this.planeMinX;
        var maxX = this.planeMaxX;
        var plane = this.plane;
        var bulletSize = this.opts.bulletSize;
        var bulletSpeed = this.opts.bulletSpeed;
        if (keyboard.pressLeft && plane.x > minX) {
            plane.translate('left');
        }
        if (keyboard.pressRight && plane.x < maxX) {
            plane.translate('right');
        }
        if (keyboard.pressUp || keyboard.pressSpace) {
            plane.shoot(bulletSize, bulletSpeed);
        }
    },
    draw: function() {
        this.initGrade();
        this.plane.draw();
        this.enemyArr.forEach(function(item) {
            item.draw();
        });
    }
};

// 初始化
GAME.init();
