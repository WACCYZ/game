/*
* @Author: lihui
* @Date:   2017-08-28 01:06:11
* @Last Modified by:   lihui
* @Last Modified time: 2017-08-28 19:39:37
*/
var BGM = {
    status: 'on',
    shootBGM: null,
    generalBGM: null,
    bossBGM: null,
    setVolume: function() {
        this.generalBGM.volume = this.bossBGM.volume = 0.12;
        this.shootBGM.volume = 1.0;
    },
    off: function() {
        this.generalBGM.volume = this.bossBGM.volume = 0;
        this.shootBGM.volume = 0;
    }
};