import React from 'react';
import config from './config';

class EGCut extends React.Component {
  constructor(props) {
    super(props);
    this.cut = React.createRef();
    this.BB = React.createRef();
    this.getBBoxData = this.getBBoxData.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.update = this.update.bind(this);
    this.getCoords = this.props.getCoords
    this.state = { 
      highlight: false,
      cursorOver: false,
      bounding: {_x:0,_y:0,_w:0,_h:0}
    };

    this.panzoom = this.props.panzoom

    window.addEventListener('click', this.handleClick)
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('mousedown', this.handleDragStart.bind(this))
    window.addEventListener('mouseup', this.handleDragEnd.bind(this))
  }

  handleClick() {
    if (this.state.cursorOver 
      && this.props.enableHighlight 
      && this.props.selectedCallback) 
    {
      this.props.selectedCallback(this.props.id);
      this.setState({ cursorOver: false });
    }
  }

  getBBoxData() {
    if (this.cut.current) {
      let { x, y, width, height } = this.cut.current.getBBox();
      let _x = x - config.cutPadding.horizontal;
      let _y = y - config.cutPadding.vertical;
      let _w = width + config.cutPadding.horizontal * 2;
      let _h = height + config.cutPadding.vertical * 2;
      return { _x, _y, _w, _h };
    }
    return {};
  }

  update() {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.setState({ bounding: this.getBBoxData() });
      }, 1);
      setTimeout(() => {
        clearInterval(this.interval);
        this.interval = null;
      }, 100);
    }
  }

  componentDidMount() { 
    this.update()
  }

  componentDidUpdate() {
    this.update()
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleClick);
    if (this.interval)
      clearInterval(this.interval);
  }

  handleDragStart(evt) {
    if (this.state.cursorOver) {
      this.panzoom.pause();
      let { x, y } = this.getCoords(evt.clientX, evt.clientY);
      this.setState({ dragging: true, x, y })
    }
  }

  handleDragEnd(evt) {
    this.panzoom.resume();
    this.setState({ dragging: false });
  }

  onMouseMove(evt) {
    if (this.state.dragging) {
      let x_orig = this.state.x;
      let y_orig = this.state.y;
      let { x, y } = this.getCoords(evt.clientX, evt.clientY)
      x = Math.round(x/config.gridSize)*config.gridSize
      y = Math.round(y/config.gridSize)*config.gridSize
      this.props.setCoords(x-x_orig, y-y_orig);
      this.setState({ x: x, y: y });
    }
  }

  render() {
    let highlight = this.state.cursorOver && this.props.enableHighlight;
    let reject = this.props.selectedCallback != null && this.state.cursorOver && !this.props.enableHighlight;
    let stroke = "black";
    if (highlight) stroke = "blue";
    else if (reject) stroke = "red";
    let { _x, _y, _w, _h } = this.state.bounding;
    return (
      <React.Fragment>
        <rect
          x={_x}
          y={_y}
          width={_w}
          height={_h}
          fillOpacity="0.7" 
          strokeOpacity="1"
          stroke={stroke}
          fill={highlight ? "#DFDFDA" : "white"}
          onMouseEnter={(e) => this.setState({ cursorOver: true })}
          onMouseLeave={(e) => this.setState({ cursorOver: false })}
          rx={config.cutCornerRadius.toString()} 
          ry={config.cutCornerRadius.toString()}
        />
        <g ref={this.cut}>
          {this.props.children}
        </g>
      </React.Fragment>
    );
  }
}

export default EGCut;