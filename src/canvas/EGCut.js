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
    this.state = { 
      highlight: false,
      bounding: {_x:0,_y:0,_w:0,_h:0}
    };

    window.addEventListener('click', this.handleClick)
  }

  handleClick() {
    if (this.state.highlight 
      && this.props.enableHighlight 
      && this.props.selectedCallback) 
    {
      this.props.selectedCallback(this.props.id);
      this.setState({ highlight: false });
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

  render() {
    let highlight = this.state.highlight && this.props.enableHighlight;
    let reject = this.props.selectedCallback != null && this.state.highlight && !this.props.enableHighlight;
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
          onMouseEnter={(e) => this.setState({ highlight: true })}
          onMouseLeave={(e) => this.setState({ highlight: false })}
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