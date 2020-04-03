import React from 'react';
import InfiniteCanvas from 'infinite-canvas';
import { Stage, Shape, Ticker, Bitmap } from "@createjs/easeljs";

class Canvas extends React.Component {
  constructor(props) {
    super(props);

    console.log(this.props.proof)

    this.onDrop = this.onDrop.bind(this);
    this.canvas = React.createRef();
    this.deviceScale = window.devicePixelRatio
    this.state = {
      proof: this.props.proof,
    };
  }

  resize(canvas) {
    let ctx = canvas.getContext('2d');
    let scale = this.deviceScale;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(scale, scale);
    return canvas;
  }

  onDrop(event) {
    let stage = this.stage;
    let bm = new Bitmap(event.dataTransfer.getData('bm'));
    console.log(event.dataTransfer.getData('type'))
    bm.x = event.clientX * this.deviceScale;
    bm.y = event.clientY * this.deviceScale;
    console.log(bm)
    stage.addChild(bm);
  }

  componentDidMount() {
    this.stage = new Stage(this.canvas.current);
    window.addEventListener('resize', () => {
      this.canvas.current = this.resize(this.canvas.current);
    });
    Ticker.addEventListener("tick", (event) => {
      this.stage.update();
    });
    this.resize(this.canvas.current);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this);
  }

  render() {
    return (
      <canvas 
        onDrop={this.onDrop}
        onDragOver={(e)=>e.preventDefault()}
        ref={this.canvas} />
    );
  }
}

export default Canvas;
