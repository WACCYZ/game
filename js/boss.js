/*
* @Author: lihui
* @Date:   2017-08-28 01:45:12
* @Last Modified by:   lihui
* @Last Modified time: 2017-08-28 04:16:00
*/
function Boss(obj) {
    var obj = obj || {};
    Enemy.call(this, obj);
    this.bullets = [];
    this.limiteY = obj.limiteY;
}
util.inheritPrototype(Boss, Enemy);
Boss.prototype.shoot = function(bulletSize, bulletSpeed) {
      var bossbullet = new Bullet({
        x: this.x + this.size / 2,
        y: this.y + this.size,
        size: bulletSize,
        speed: bulletSpeed
      });
      this.bullets.push(bossbullet);
}
Boss.prototype.drawBullet = function() {
    var bullets = this.bullets;
    var i = bullets.length;
    while(i--) {
        var bullet = bullets[i];
        bullet.fly('boss');
        if (bullet.y >= this.limiteY) {
            bullets.splice(i, 1);
        }else {
            bullet.draw();
        }
    }
}
Boss.prototype.draw = function() {
    switch (this.status) {
        case 'living':
          context.drawImage(this.liveIcon, this.x, this.y, this.size, this.size);
          this.drawBullet();
          break;
        case 'booming':
          context.drawImage(this.boomIcon, this.x, this.y, this.size, this.size);
          break;
    }
};
/**
 * 是否击中目标
 * @param  {Object}  target 目标
 * @return {Boolean}        [description]
 */
Boss.prototype.isHit = function(target) {
    var bullets = this.bullets;
    for (var i = bullets.length - 1; i >= 0; i--) {
        if (this.CD(bullets[i], target)) {
            this.bullets = [];
            return true;
        }
    }
    return false;
};
Boss.prototype.CD = function(bullet, plane) {
    if (!(plane.size.width + plane.x < bullet.x) &&
        !(bullet.size + bullet.x < plane.x) &&
        !(bullet.size + bullet.y < plane.y) &&
        !(plane.size.height + plane.y < bullet.y)) {
            return true;
        } else {
            return false;
        }
}