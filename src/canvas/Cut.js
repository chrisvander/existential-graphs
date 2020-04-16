import React from 'react';
import config from './config';

class DraggableText extends React.Component {
  constructor(props) {
    super(props);
    this.cut = React.createRef();
    this.BB = React.createRef();
    this.getBBoxData = this.getBBoxData.bind(this);
    this.state = {};
  }

  getBBoxData() {
    if (this.cut.current) {
      let { x, y, width, height } = this.cut.current.getBBox();
      let _x = x - config.cutPadding;
      let _y = y - config.cutPadding;
      let _w = width + config.cutPadding * 2;
      let _h = height + config.cutPadding * 2;
      return { _x, _y, _w, _h };
    }
    return {};
  }

  componentDidMount() { 
    this.setState(this.getBBoxData());
  }

  componentDidUpdate() {
    let bb = this.BB.current;
    let b = this.getBBoxData();
    bb.setAttribute('x', b._x);
    bb.setAttribute('y', b._y);
    bb.setAttribute('width', b._w);
    bb.setAttribute('height', b._h);
  }

  render() {
    let b = this.getBBoxData();
    if (this.props.children.length > 0)
      return (
        <React.Fragment>
          <rect
            x={b._x}
            y={b._y}
            width={b._w}
            height={b._h}
            ref={this.BB}
            fillOpacity="0.7" 
            strokeOpacity="1"
            stroke="black"
            fill="white"
            pointerEvents="none"
            rx={config.cutCornerRadius.toString()} 
            ry={config.cutCornerRadius.toString()} 
          />
          <g ref={this.cut}>
            {this.props.children}
          </g>
        </React.Fragment>
      );
    else return <React.Fragment />
  }
}

export default DraggableText;