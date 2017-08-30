/*
* @Author: lihui
* @Date:   2017-08-27 16:49:42
* @Last Modified by:   lihui
* @Last Modified time: 2017-08-28 19:53:00
*/

// requestAnimationFrame兼容写法
window.requestAnimFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function(callback) {
    window.setTimeout(callback, 1000 / 30);
};
function inheritPrototype(child, parent) {
    var proto = Object.create(parent.prototype);
    proto.constructor = child;
    child.prototype = proto;
};
/**
 * 加载资源
 * @param  {Arry}   pictures 图片资源
 * @param  {Arry}   music    音频资源
 * @param  {Function} callback 回调函数
 * @return {[type]}            [description]
 */
function resourceLoad(pictures, music, callback) {
    var finishCount = 0;
    var images = [];
    var audios = [];
    for (var i = 0; i < pictures.length; i++) {
        images[i] = new Image();
        images[i].src = pictures[i];
        images[i].onload = function() {
            finishCount++;
        };
    }
    for (var j = 0; j < music.length; j++) {
        audios[j] = new Audio(music[j]);
        audios[j].onloadedmetadata = function() {
            finishCount++;
            if (finishCount === pictures.length + music.length) {
                callback(images, audios);
            }
        };
    }
};
/**
 * 获取目标对象实例们中最小的横坐标和最大的横坐标
 */
function getHorizontalBoundary(arrs) {
    var minX, maxX;
    arrs.forEach(function (item) {
        if (!minX && !maxX) {
            minX = item.x;
            maxX = item.x;
        } else {
            if (item.x < minX) {
                minX = item.x;
            }
            if (item.x > maxX) {
                maxX = item.x;
            }
        }
    });
    return {
    minX: minX,
    maxX: maxX
    }
};
var util = {
    inheritPrototype: inheritPrototype,
    resourceLoad: resourceLoad,
    getHorizontalBoundary: getHorizontalBoundary
};
