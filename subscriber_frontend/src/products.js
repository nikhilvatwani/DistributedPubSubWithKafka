import React, { Component} from 'react';
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import $ from 'jquery';
import Cookies from 'universal-cookie';
import { MDBCard, MDBCardBody, MDBCardTitle, MDBCardText, MDBBtn, MDBCardFooter, MDBCardHeader } from 'mdb-react-ui-kit';
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:9000";
const cookies = new Cookies();
var subToBrokerMap = new Map();

export default class Products extends Component {

    constructor(props) {
        super(props);
        //const [response, setResponse] = useState("");
        this.state = {
          products:[],
          items:[],
          topics:[]
        };
        const { router, params, location, routes } = this.props
        let userId = 1;
        switch(location.state.user){
            case "nikhil": userId = 1;
            break;
            case "kunal": userId = 2;
            break;
            case "amit": userId = 3;
            break;
        }

        cookies.set('userId', userId, { path: '/' });
        // subToBrokerMap.set("1","http://172.20.0.8:8080")
        // subToBrokerMap.set("2","http://172.20.0.7:8081")
        // subToBrokerMap.set("3","http://172.20.0.6:8082")
        subToBrokerMap.set("1","http://localhost:8080")
        subToBrokerMap.set("2","http://localhost:8081")
        subToBrokerMap.set("3","http://localhost:8082")
        this.Advertise()
        
      }
        

      componentDidMount() {
           const socket = socketIOClient(ENDPOINT);
           socket.emit("userOnline", cookies.get('userId'));
           socket.on("Node.To.Sub", res => {
                console.log("received data from socket="+res)
                const allProducts = JSON.parse(JSON.stringify(res));
                 console.log(allProducts)
                 for(let i=0; i<allProducts.data.length;i++){
                     var jsonString = JSON.parse(allProducts.data[i].message)
                     jsonString = JSON.stringify(jsonString)
                     jsonString = JSON.parse(JSON.parse(jsonString))
                     allProducts.data[i].message = jsonString
                 }
                 var map1 = new Map();
                 var temp = this.state.products;
                 allProducts.data.map((curr)=>{
                     if(map1.get(curr.id_topic)==null)
                         map1.set(curr.id_topic, []);
                     map1.set(curr.id_top, map1.get(curr.id_topic).push(curr.message))
                 })
                 map1.delete(undefined)
                 console.log("-----------MAP1---------------")
                 console.log(map1)

                 for(var ele of temp.keys()){
                    if(ele!=undefined && map1.get(ele)==undefined) map1.set(ele, temp.get(ele))
                 }
                 map1.delete(undefined)
                 console.log("-----------TEMP---------------")
                 console.log(map1)
                 this.setState({products: map1});
               });
       }

      Subscribe(subTopic){
        return $.post(subToBrokerMap.get(cookies.get('userId'))+'/broker/subscribe', {id_user: cookies.get('userId'), id_topic: subTopic})
        .then(function(data) {
          console.log(data)
          return data;
        });
      }
      Unsubscribe(unSubTopic){
        return $.post(subToBrokerMap.get(cookies.get('userId'))+'/broker/unsubscribe', {id_user: cookies.get('userId'), id_topic: unSubTopic})
        .then(function(data) {
          console.log(data)
          return data;
        });
      }

      Advertise(){
          return $.getJSON(subToBrokerMap.get(cookies.get('userId'))+'/broker/advertise')
          .then((res) => {
            const allTopics = JSON.parse(JSON.stringify(res));
            var finalTopics = [];
            allTopics.data.map((curr) => {
                finalTopics.push(curr.topic_name)
            })
            console.log(finalTopics);
            this.setState({topics: finalTopics});
          });
        }
     addToWishlist = (product_id) => {

        $.post("http://localhost:8081/wishlist/add/",
               {productId: product_id}
               //this.getTodos
        );
     }
    render(){
        return (
            <div class="top">
                <h3>Topics</h3>
                <Row xs={1} md={3} className="g-3">
                    {Array.from(this.state.topics).map((currTopic,idex) => (
                        <Col>
                            <h5>{currTopic.toUpperCase()}</h5>
                            <button type="button" class="btn btn-primary" onClick={() => this.Subscribe(currTopic)} >Subscribe</button>
                            <button type="button" class="btn btn-primary" style={{ marginLeft: '5%'}}onClick={() => this.Unsubscribe(currTopic)} >Unsubscribe</button>
                        </Col>
                     ))}
                </Row>
                <hr />
                <h3>Results</h3>
                <Row xs={1} md={3} className="g-3">
                 {Array.from(this.state.products.keys()).map((key,idex) => (
                    <Col>
                    <h4>{key}</h4>
                    <Row xs={1} md={1} className="g-1">
                      {Array.from(this.state.products.get(key)).map((_, idx) => (
                        <Col>
                            <MDBCard style={{ maxWidth: '22rem' }} className='h-100'>
                                  <MDBCardHeader className='text-dark'>{_.name}</MDBCardHeader>
                                  <MDBCardBody>
                                    <MDBCardText>
                                        <small className='text-muted'> {_.description}</small>
                                    </MDBCardText>
                                  </MDBCardBody>
                                  <MDBCardFooter>
                                    <MDBBtn>${_.price}</MDBBtn>
                                </MDBCardFooter>
                                </MDBCard>
                        </Col>
                      ))}
                    </Row>
                    </Col>
               ))}
               </Row>
            </div>

        );
    }
}