import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Products from "./products.js";


export default class Login extends Component {
    constructor(props){
        super(props);

        this.state = {
          username : ''
        }

        this.updateInput = this.updateInput.bind(this);
    }
    updateInput(event){
        this.setState({username : event.target.value})
    }

    render() {
        return (
        <div class="top">
        <div className="inner">
            <form action="/products.js">

                <h3>Log in</h3>

                <div className="form-group">
                    <label>Email</label>
                    <input type="email" onChange={this.updateInput} className="form-control" placeholder="Enter email" />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input type="password" className="form-control" placeholder="Enter password" />
                </div>

                <div className="form-group">
                    <div className="custom-control custom-checkbox">
                        <input type="checkbox" className="custom-control-input" id="customCheck1" />
                        <label className="custom-control-label" htmlFor="customCheck1">Remember me</label>
                    </div>
                </div>

                <button type="submit" ><Link className="btn btn-dark btn-lg btn-block" to={{pathname: "/products", state: { user : this.state.username}}}>Sign up</Link></button>
                <p className="forgot-password text-right">
                    Forgot <a href="#">password?</a>
                </p>
            </form>
          </div>
          </div>
        );
    }
}