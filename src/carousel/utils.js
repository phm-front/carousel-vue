export function Item(element, options) {
  element.item = this;
  this.element = element;
  if (element.tagName === "IMG") {
    this.fullWidth = element.width;
    this.fullHeight = element.height;
  } else {
    element.style.display = "inline-block";
    this.fullWidth = element.offsetWidth;
    this.fullHeight = element.offsetHeight;
  }
  element.style.position = "absolute";
  if (options.transforms) {
    this.element.style['transform-origin'] = "0 0";
  }
  this.moveTo = function (x, y, scale) {
    this.width = this.fullWidth * scale;
    this.height = this.fullHeight * scale;
    this.x = x;
    this.y = y;
    this.scale = scale;

    var style = this.element.style;
    style.zIndex = ("" + scale * 100) | 0;

    if (options.transforms) {
      style['transform'] =
        "translate(" + x + "px, " + y + "px) scale(" + scale + ")";
    } else {
      // The gap between the image and its reflection doesn't resize automatically
      if (options.mirror && this.element.tagName === "IMG")
        this.reflection.style.marginTop = options.mirror.gap * scale + "px";

      style.width = this.width + "px";
      style.left = x + "px";
      style.top = y + "px";
    }
  }
}