/*
* @Author: lihui
* @Date:   2017-08-27 12:30:59
* @Last Modified by:   lihui
* @Last Modified time: 2017-08-28 04:32:10
*/
/**
 * 子弹对象
 * @param {Object} obj 实例对象
 */
function Bullet(obj) {
    var obj = obj || {};
    Element.call(this, obj);
}
util.inheritPrototype(Bullet, Element);
Bullet.prototype.draw = function() {
    context.beginPath();
    context.strokeStyle = 'white';
    context.moveTo(this.x, this.y);
    context.lineTo(this.x, this.y - this.size);
    context.closePath();
    context.stroke();
};
Bullet.prototype.fly = function(type) {
    switch (type) {
        case 'enemy':
            this.move(0, -this.speed);
            break;
        case 'boss':
            this.move(0, this.speed);
            break;
    }
};
/**
 * 碰撞检测函数
 * @param {Object} r1 矩形对象
 * @param {Object} r2 矩形对象
 * @return {Boolean} 是否发生碰撞
 */
Bullet.prototype.CD = function(target) {
    if (!(this.x < target.x) &&
        !(target.size + target.x < this.x) &&
        !(target.size + target.y < this.y) &&
        !(this.size + this.y < target.y)) {
        return true;
    } else {
        return false;
    }
};