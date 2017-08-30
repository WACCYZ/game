/*
* @Author: lihui
* @Date:   2017-08-22 17:37:31
* @Last Modified by:   lihui
* @Last Modified time: 2017-08-27 12:18:56
*/
/**
 * 父类对象
 * @param {Object} obj 参数对象
 */
function Element(obj) {
	var obj = obj || {};
	this.x = obj.x;
	this.y = obj.y;
	this.size = obj.size;
	this.speed = obj.speed;
};
Element.prototype = {
	move: function(x, y) {
		this.x += x;
		this.y += y;
	},
	draw: function(){
	}
};