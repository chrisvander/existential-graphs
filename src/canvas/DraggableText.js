import React from 'react';

class DraggableText extends React.Component {
  constructor(props) {
    super(props);
    this.text = React.createRef()
    this.getCoords = this.props.getCoords
    this.state = {
      x: props.x,
      y: props.y,
      dragging: false
    };

    this.props.addMoveListener(this.onMouseMove.bind(this))
  }

  componentDidMount() {  
    this.text.current.style.cursor = "pointer";
  }

  handleDragStart(evt) {
    this.props.panzoom.pause()
    this.setState({ dragging: true });
  }

  handleDragEnd(evt) {
    this.props.panzoom.resume()
    this.setState({ dragging: false });
  }

  onMouseMove(evt) {
    if (this.state.dragging) {
      let { x, y } = this.getCoords(evt.clientX, evt.clientY)
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
        onMouseDown={this.handleDragStart.bind(this)}
        onMouseUp={this.handleDragEnd.bind(this)}
        ref={this.text}>
        {this.props.children}
      </text>
    );
  }
}

export default DraggableText;