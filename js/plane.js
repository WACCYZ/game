/*
* @Author: lihui
* @Date:   2017-08-27 12:09:06
* @Last Modified by:   lihui
* @Last Modified time: 2017-08-28 04:18:24
*/
/**
 * 飞机对象
 */
function Plane(obj) {
    var obj = obj || {};
    Element.call(this, obj);
    this.icon = obj.icon;
    this.bullets = [];
    this.lastTime = Date.now();
}
util.inheritPrototype(Plane, Element);
Plane.prototype.drawBullet = function() {
    var bullets = this.bullets;
    var i = bullets.length;
    while(i--) {
        var bullet = bullets[i];
        bullet.fly('enemy');
        if (bullet.y <= 0) {
            bullets.splice(i, 1);
        } else {
            bullet.draw();
        }
    }
};
Plane.prototype.draw = function() {
    context.drawImage(this.icon, this.x, this.y, this.size.width, this.size.height);
    this.drawBullet();
};
Plane.prototype.translate = function(direction) {
    switch (direction) {
        case 'left':
            this.move(-this.speed, 0);
            break;
        case 'right':
            this.move(this.speed, 0);
            break;
    }
}
/**
 * 发射子弹函数
 * @param  {Number} bulletSize  子弹的长度
 * @param  {Number} bulletSpeed 子弹的移动速度
 * @return {[type]}             [description]
 */
Plane.prototype.shoot = function(bulletSize, bulletSpeed) {
    var bgm = BGM.shootBGM;
    if (Date.now() - this.lastTime > 200) {
        var newBullet = new Bullet({
            x: this.x + this.size.width / 2,
            y: this.y,
            size: bulletSize,
            speed: bulletSpeed
        });
        this.bullets.push(newBullet);
        this.lastTime = Date.now();
        bgm.currentTime = 0.2;
        bgm.play();
        setTimeout(function() {
            bgm.pause();
        }, 150);
    }
};
/**
 * 是否击中目标
 * @param  {Object}  target 目标
 * @return {Boolean}        [description]
 */
Plane.prototype.isHit = function(target, type) {
    var bullets = this.bullets;
    for (var i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].CD(target)) {
            this.bullets.splice(i, 1);
            if (type === 'boss' && target.size > 30) {
                target.size -= 2;
                return false;
            }
            return true;
        }
    }
    return false;
};