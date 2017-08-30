/*
* @Author: lihui
* @Date:   2017-08-27 19:46:53
* @Last Modified by:   lihui
* @Last Modified time: 2017-08-28 00:44:16
*/
function keyBoard() {
    document.onkeydown = this.keyDown.bind(this);
    document.onkeyup = this.keyUp.bind(this);
}
keyBoard.prototype = {
    pressLeft: false,//是否按左键
    pressRight: false,//是否按右键
    pressUp: false,//是否按上键
    pressSpace: false,//是否按空格键
    keyDown: function(e) {
        var key = e.keyCode || e.which || e.charCode;
        switch (key) {
            //左
            case 37:
                this.pressLeft = true;
                this.pressRight = false;
                break;
            //上
            case 38:
                this.pressUp = true;
                break;
            //右
            case 39:
                this.pressRight = true;
                this.pressLeft = false;
                break;
            //空格
            case 32:
                this.pressSpace = true;
        }
    },
    keyUp: function(e) {
        var key = e.keyCode || e.which || e.charCode;
        switch (key) {
            //左
            case 37:
                this.pressLeft = false;
                break;
            //上
            case 38:
                this.pressUp = false;
                break;
            //右
            case 39:
                this.pressRight = false;
                break;
            //空格
            case 32:
                this.pressSpace = false;
        }
    }

}
// var ltime;
//   var ntime;
//   if (status === 'off') {
//     document.onkeydown = null;
//   }else {
//     var keyPressed = {};
//     document.onkeyup = function(e) {
//       ntime = Date.now();
//       var key = e.keyCode || e.which || e.charCode;
//       keyPressed[key] = false;
//       if (ntime - ltime > 5) {
//         BGM.bulletBGM.pause();
//       }
//     };
//     document.onkeydown = function(e) {
//       var key = e.keyCode || e.which || e.charCode;
//       keyPressed[key] = true;
//     };
//     setInterval(function() {
//       if (GAME.enemyArr.length === 0) {
//         return;
//       }
//       for (var key in keyPressed) {
//         if (keyPressed[key]) {
//           if (key === '37' || key === '39') {
//             GAME.plane.move(key);
//           }
//         }
//       }
//     }, 18);
//     setInterval(function() {
//       if (GAME.enemyArr.length === 0) {
//         return;
//       }
//       for (var key in keyPressed) {
//         if (keyPressed[key]) {
//           var newBullet;
//           if (key === '38' || key === '32') {
//             newBullet = new Bullet((GAME.plane.x + (GAME.plane.width / 2)), GAME.plane.y, 1, CONFIG.bulletSize, CONFIG.bulletSpeed);
//             if (BGM.status === 'on') {
//               BGM.bulletBGM.currentTime = 0.3;
//               BGM.bulletBGM.play();
//               ltime = Date.now();
//             }
//             newBullet.moveAnimate();
//             GAME.bulletArr.push(newBullet);
//           }
//         }
//       }
//     }, 75);
//   }