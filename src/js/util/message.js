import debug from "../tools/debug";

var iframeMessage = {
  _map:{},
  //-- 监听广告event
  addMessage : function() {
    var that = this;
    // 监听来自iframe的消息
    window.addEventListener('message', function(event) {
      if (event.data && typeof event.data == "string") {
        var iframeName;
        try {
          var data = JSON.parse(event.data);
          iframeName = data.name || event.data;
        } catch (error) {
          iframeName = event.data;
        }
        debug.log('广告返回正常展示事件'+iframeName);
        that._map[iframeName] = true;
      }
    })
  },
  getIframeMessage: function(iframeName) {
    return this._map[iframeName];
  }
};
iframeMessage.addMessage();
export default iframeMessage;