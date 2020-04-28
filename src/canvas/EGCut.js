import React from 'react';
import config from './config';

class EGCut extends React.Component {
  constructor(props) {
    super(props);
    this.cut = React.createRef();
    this.BB = React.createRef();
    this.getBBoxData = this.getBBoxData.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = { highlight: false };

    this.eventListener = window.addEventListener('click', this.handleClick)
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

  componentDidMount() { 
    this.interval = setInterval(() => this.setState(this.getBBoxData()), 1);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleClick);
    clearInterval(this.interval);
  }

  render() {
    let childEl = this.props.children;
    if (childEl.length < 1) {
      childEl = <EGCut>{" "}</EGCut>
    }
    let highlight = this.state.highlight && this.props.enableHighlight;
    let { _x, _y, _w, _h } = this.state;
    return (
      <React.Fragment>
        <rect
          x={_x}
          y={_y}
          width={_w}
          height={_h}
          fillOpacity="0.7" 
          strokeOpacity="1"
          stroke="black"
          fill={highlight ? "#9AA899" : "white"}
          onMouseEnter={() => this.setState({ highlight: true })}
          onMouseLeave={() => this.setState({ highlight: false })}
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