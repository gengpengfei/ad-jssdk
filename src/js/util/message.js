import debug from "../tools/debug";

var iframeMessage = {
  _map:{},
  //-- 监听广告event
  addMessage : function() {
    var that = this;
    // 监听来自iframe的消息
    window.addEventListener('message', function(event) {
      if (event.data && typeof event.data == "string") {
        debug.log('广告返回正常展示事件',event.data);
        that._map[event.data] = true;
      }
    })
  },
  getIframeMessage: function(iframeName) {
    return this._map[iframeName];
  }
};
iframeMessage.addMessage();
export default iframeMessage;