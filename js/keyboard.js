/*
* @Author: lihui
* @Date:   2017-08-27 19:46:53
* @Last Modified by:   lihui
* @Last Modified time: 2017-09-05 11:32:41
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