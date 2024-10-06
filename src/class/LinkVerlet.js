export default class LinkVerlet {

  constructor({
    obj1,
    obj2,
    distance,
    color = 'tomato',
    visible = true,
  }) {
    this.obj1 = obj1;
    this.obj2 = obj2;
    this.distance = distance;
    this.color = color;
    this.visible = visible;
  }

  update(dt) {
    const distance = this.obj1.distanceTo(this.obj2);
    const diff = this.distance - distance;
    const angle = Math.atan2(this.obj2.y - this.obj1.y, this.obj2.x - this.obj1.x);
    const dx = Math.cos(angle) * diff / 2;
    const dy = Math.sin(angle) * diff / 2;
    if (!this.obj1.sticky) {
      this.obj1.x -= dx;
      this.obj1.y -= dy;
    }
    if (!this.obj2.sticky) {
      this.obj2.x += dx;
      this.obj2.y += dy;
    }
  }

  draw(ctx) {
    if (!this.visible) return;
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.obj1.x, this.obj1.y);
    ctx.lineTo(this.obj2.x, this.obj2.y);
    ctx.stroke();
  }

}