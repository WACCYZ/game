/*
* @Author: lihui
* @Date:   2017-08-22 17:31:56
* @Last Modified by:   lihui
* @Last Modified time: 2017-08-28 04:31:45
*/
/**
 * 怪兽对象
 */
function Enemy(obj) {
  var obj = obj || {};
  Element.call(this, obj);
  this.liveIcon = obj.liveIcon;
  this.boomIcon = obj.boomIcon;
  this.boomCount = 0;
  this.MaxY = obj.maxY;
  this.status = 'living';
}
util.inheritPrototype(Enemy, Element);
/**
 * 怪兽绘制函数
 */
Enemy.prototype.draw = function() {
  switch (this.status) {
    case 'living':
      context.drawImage(this.liveIcon, this.x, this.y, this.size, this.size);
      break;
    case 'booming':
      context.drawImage(this.boomIcon, this.x, this.y, this.size, this.size);
      break;
  }
};
Enemy.prototype.moveX = function(direction) {
  //从左往右移动
  if (direction === 'right') {
    this.move(this.speed, 0);
  }else {
    this.move(-this.speed, 0);
  }
};
Enemy.prototype.moveY = function() {
  var h = this.size;
  if ((this.y + this.size - this.MaxY) > 0 && this.y <  this.MaxY) {
    h = this.MaxY - this.y;
  }
  this.move(0, h);
};
Enemy.prototype.booming = function() {
  this.status = 'booming';
  if (this.boomCount > 2) {
    this.status = 'boomed';
  }
  this.boomCount++;
};
