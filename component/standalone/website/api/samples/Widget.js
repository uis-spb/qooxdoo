addSample(".widget", {
  html: ['<div id="widget-example"></div>'],
  javascript: function() {
    var widget = q("#widget-example").toWidget();
    widget.enabled = false;
  }
});

addSample(".widget", {
  javascript: function() {
    var widget = new qx.ui.Widget();
    widget.on("tab", function () {
      console.log('click on widget');
    });
  }
});