import widget from './util/widget';
import debug from './tools/debug';

var metaxObject = {
    cmd:[],
    debug:false,
    //-- 自定义cmd数组的push方法，通过拦截数组push实现监控广告加载
    addProxy:function(){
        //-- 判断在js加载成功前是否已经有广告指令了
        debug.log('有前置广告指令待加载');
        if(this.cmd.length){
            for(var i=0;i<this.cmd.length;i++){
                debug.log('加载广告',this.cmd[i]);
                new widget(this.cmd[i]).init();
            }
            this.cmd = [];
        }
        Object.defineProperty(this.cmd, 'push', {
            value: function (...args) {
                debug.log('加载广告',args[0]);
                new widget(args[0]).init();
            },
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
}
//-- 判断是否有metaxTag对象
window.metaxtag = null != window.metaxtag ? Object.assign(metaxObject,window.metaxtag) : Object.assign(metaxObject,{ cmd:[] });
window.metaxtag.addProxy();