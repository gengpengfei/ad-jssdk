import debug from "../tools/debug";
import message from "../util/message";

function widget(options){
  //-- 如果广告为空,是否折叠容器
  this.collapseEmptyDiv = options.collapseEmptyDiv || false;
  //-- 广告为空时,触发回调
  this.onAdResponseEmpty = options.onAdResponseEmpty || function() {};
  //-- 广告正常填充，触发回调
  this.onAdResponseFull = options.onAdResponseFull || function() {};
  //-- 设置广告容器id
  this.slotElementId = options.slotElementId || null;
  //-- 设置广告参数
  this.requestParams = options.requestParams || {};
  //-- 是否提前渲染
  this.isAdvanceRender = options.isAdvanceRender || false;
};
//-- 初始化广告
widget.prototype.init = function() {
  var that = this;
  if(!that.slotElementId){
    debug.log('广告配置缺少必传参数 slotElementId');
    return;
  }
  if(!that.requestParams.adunitId){
    debug.log('广告配置缺少必传参数 adunitId');
    return;
  }
  if(!that.requestParams.pubId){
    debug.log('广告配置缺少必传参数 pubId');
    return;
  }
  //-- 判断广告容器是否渲染成功
  that.waitForElement().then(function() {
    debug.log('广告容器渲染成功');
    that.insertWidgetBlock();
  });
}
widget.prototype.createWidgetDiv = function() {
  debug.log('创建广告容器'+this.slotElementId);
  this.widgetBlockId = this.slotElementId + "_metax_" + new Date().getTime();
  var widgetDiv = document.createElement("div");
  widgetDiv.id = this.widgetBlockId;
  widgetDiv.style.width = "100%";
  widgetDiv.style.height = "100%";
  document.getElementById(this.slotElementId).appendChild(widgetDiv)
}
widget.prototype.insertWidgetBlock = function() {
  var that = this;
  //-- 创建广告容器
  that.createWidgetDiv();
  //-- 启用可视化监听
  that.widgetBlockVisible().then(function(){
    debug.log('广告容器可视化');
    //-- 触发广告加载
    that.insertWidgetIframe();
  });
}
widget.prototype.getWidgetSize = function() {
  return {
    width: parseInt(document.getElementById(this.slotElementId).offsetWidth),
    height: parseInt(document.getElementById(this.slotElementId).offsetHeight)
  }
}
widget.prototype.insertWidgetIframe = function(e) {
  debug.log("开始渲染Iframe广告"+this.slotElementId);
  document.getElementById(this.widgetBlockId).appendChild(this.createIframe());
}
widget.prototype.createIframe = function() {
  var that = this;
  var iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', "allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation");
  iframe.setAttribute('style', "width:100%;height:100%;margin:0;border:0;padding:0");
  iframe.setAttribute('frameborder', 0);
  iframe.setAttribute('allowtransparency', true);
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('name', this.slotElementId + "_iframe");
  iframe.src = this.adRequest();
  iframe.addEventListener('load', function(e) {
    if(message.getIframeMessage(that.slotElementId + "_iframe")){
      debug.log('广告正常展示');
      that.onAdResponseFull(that.widgetBlockId);
    }else{
      debug.log('广告未正确展示');
      //-- 触发广告展示失败回调
      that.onAdResponseEmpty(that.widgetBlockId);
      //-- 判断是否需要折叠广告容器
      that.collapseWidgetDiv();
    }
  });
  return iframe;
}
widget.prototype.collapseWidgetDiv = function() {
  this.collapseEmptyDiv && debug.log('折叠广告容器');
  this.collapseEmptyDiv && (document.getElementById(this.slotElementId).style.display = "none");
}
widget.prototype.adRequest = function() {
  var _obj = {
    MX_PUBID:this.requestParams.pubId,
    MX_ADUNITID:this.requestParams.adunitId,
    MX_CACHEBUSTER: new Date().getTime(),
    MX_WIDTH: this.getWidgetSize().width,
    MX_HEIGHT: this.getWidgetSize().height,
    MX_DEVICE_LANGUAGE: navigator.language,
    MX_SECURE: window.location.protocol == "http:" ? 0 : 1,
    MX_URL: encodeURIComponent(window.location.href),
    MX_REFERER: encodeURIComponent(document.referrer),
    MX_CHANNEL: "Google--520678__90", //-- 90标识metaxplay的cp标识
    MX_INV: this.requestParams.inv == 'app'? 'app' : 'site',
    MX_APP_NAME: this.requestParams.appName,
    MX_APP_BUNDLE: this.requestParams.appBundle,
    MX_APP_ID: this.requestParams.appBundle,
    MX_APP_STORE_URL: encodeURIComponent(this.requestParams.appStoreUrl),
    MX_APP_VERSION: this.requestParams.appVersion,
    MX_APP_DOMAIN: encodeURIComponent(window.location.href),
    MX_USER_AGENT: encodeURIComponent(navigator.userAgent),
  };
  var url = 'https://rtbus.m.com/ads/html?pubid=MX_PUBID&adunit=MX_ADUNITID&lang=MX_DEVICE_LANGUAGE&w=MX_WIDTH&h=MX_HEIGHT&secure=MX_SECURE&url=MX_URL&referer=MX_REFERER&cb=MX_CACHEBUSTER&channel=MX_CHANNEL';
  if(_obj.MX_INV == "app"){
    url += "&inv=MX_INV&appname=MX_APP_NAME&appid=MX_APP_ID&bundle=MX_APP_BUNDLE&storeurl=MX_APP_STORE_URL&appver=MX_APP_VERSION&appdomain=MX_APP_DOMAIN&ua=MX_USER_AGENT";
  }
  Object.keys(_obj).forEach(function(key){
      url = url.replace(key,_obj[key]);
  })
  return url;
  // return "http://127.0.0.1:9000/test/iframe.html"
}
widget.prototype.widgetBlockVisible = function() {
  var that = this;
  return new Promise(function(t) {
    //-- 判断是否支持IntersectionObserver，不支持直接走广告渲染逻辑
    if (!window.IntersectionObserver || that.isAdvanceRender) {
      return t();
    }
    var observerConfig = {
      rootMargin: "0px",
      threshold: [0]
    };
    var _observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        //-- 需要兼容在部分设备上，entry对象上不存在isIntersecting属性
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          _observer.unobserve(entry.target);
          return t();
        }
      });
    }, observerConfig);
    var widgetBlock = document.getElementById(that.slotElementId);
    widgetBlock && _observer.observe(widgetBlock);
  });
}
//-- 广告容器如果渲染，直接返回，否则启用监听，等待渲染，当广告可视化时，渲染广告容器
widget.prototype.waitForElement = function() {
  var slotElementId = this.slotElementId;
  return new Promise(function(t) {
    if (document.querySelector("#"+slotElementId)){
      return t();
    }
    var _server = new MutationObserver(function() {
      document.querySelector("#"+slotElementId) && (t(), _server.disconnect());
    });
    _server.observe(document, { childList: !0, subtree: !0 });
  });
}

export default widget;
