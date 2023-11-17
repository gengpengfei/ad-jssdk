export default{
  loadLink:function(src) {
    var d = document.createElement("link");
    d.rel = "preconnect";
    d.href = src;
    document.head ? document.head.appendChild(d) : document.body.appendChild(d);
  },
  loadScript:function(src) {
    var d = document.createElement("script");
    d.async = "async";
    d.src = src;
    document.head ? document.head.appendChild(d) : document.body.appendChild(d);
  }
}
