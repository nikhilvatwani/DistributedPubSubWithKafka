import React, { Component } from "react";
import StompClient from "react-stomp-client";

class MyComponent extends Component {
  constructor(props) {
    this.state = {
      latestMessage: null
    };

    this.handleMessage = this.handleMessage.bind(this);
  }

  handleMessage(stompMessage) {
    this.setState({
      latestMessage: stompMessage
    });
  }

  render() {
    const { latestMessage } = this.state;
    return (
      <StompClient
        endpoint="ws://localhost:8888/websocket"
        topic="my-topic"
        onMessage={this.handleMessage}
      >
        <div>
          {latestMessage
            ? `Latest message received: ${latestMessage}`
            : "No message received yet"}
        </div>
      </StompClient>
    );
  }
}