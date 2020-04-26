import React from 'react';
import config from './config';

class EGVariable extends React.Component {
  constructor(props) {
    super(props);
    this.text = React.createRef()
    this.getCoords = this.props.getCoords
    this.state = {
      x: props.x,
      y: props.y,
      cursorOver: false,
      dragging: false
    };

    this.panzoom = this.props.panzoom

    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    window.addEventListener('mousedown', this.handleDragStart.bind(this))
    window.addEventListener('mouseup', this.handleDragEnd.bind(this))
  }

  componentDidMount() {  
    this.text.current.style.cursor = "pointer";
  }

  handleDragStart(evt) {
    if (this.state.cursorOver) {
      this.panzoom.pause()
      this.setState({ dragging: true })
    }
  }

  handleDragEnd(evt) {
    this.panzoom.resume()
    let { x, y } = this.state;
    this.props.setCoords(x, y);
    this.setState({ dragging: false })
  }

  onMouseMove(evt) {
    if (this.state.dragging) {
      let { x, y } = this.getCoords(evt.clientX, evt.clientY)
      x = Math.round(x/config.gridSize)*config.gridSize
      y = Math.round(y/config.gridSize)*config.gridSize
      this.props.setCoords(x, y);
      this.setState({ x: x, y: y })
    }
  }

  render() {
    return (
      <text 
        className="noselect"
        x={this.state.x} 
        y={this.state.y} 
        id={this.props.id}
        onMouseEnter={() => this.setState({ cursorOver: true })}
        onMouseLeave={() => this.setState({ cursorOver: false })}
        ref={this.text}>
        {this.props.children}
      </text>
    );
  }
}

export default EGVariable;