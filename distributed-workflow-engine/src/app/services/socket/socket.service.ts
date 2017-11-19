import { Http } from '@angular/http'; 
import { Injectable, OnInit } from '@angular/core'; 
import { StompService } from 'ng2-stomp-service'; 
import { SocketMessage } from '../../model/socket-message'; 
import { Observable } from 'rxjs/Rx';
import { Subject }    from 'rxjs/Subject'; 
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
@Injectable()
export class SocketService implements OnInit{
  public username: String;

  stompClient:any;
  socketMessageSource = new Subject<String>();
  socketUrl = 'http://localhost:9000/gs-guide-websocket'; 
  socket: any;
  messageSubscription:any;
  socketMessage: String = "Default";
  socketMessages = this.socketMessageSource.asObservable();
  numberSubscription:any; 
  socketNumber:number;
  nameSubscription : any; 
  taskNames : Array<String> = [];
  socketNameSource = new Subject<String>();
  socketNames = this.socketNameSource.asObservable();

  socketConsoleSubscription : any; 
  
  socketConsoleMap : Map<String,Array<String>> = new Map();
  
  ngOnInit(){
    // console.log(this.username);
  }
 constructor(
    private http:Http,
    private stomp: StompService,) {   
      
    this.connect();
  } 
connect(){
  this.stomp.configure({
    host: this.socketUrl,
    debug: true,
    queue: {'init': false}
  });
  this.stomp.startConnect().then(() => {
    this.stomp.done('init');  
    if(localStorage.getItem('Email')) this.subscribe();
  });
}
subscribe(){

  this.username= localStorage.getItem("Email");
  if(this.messageSubscription != null){
        this.messageSubscription.unsubscribe();
        console.log("message unsubscribed");
  }
  
     this.messageSubscription = this.stomp.subscribe('/response/'+this.username,(response) => {
        let temp : String = response.output;
        console.log("OUTPUT: ",response.output);
        this.socketMessageSource.next(temp);
        console.log(temp);
      }); 
      if(this.numberSubscription != null)
      this.numberSubscription.unsubscribe();
  
   this.numberSubscription = this.stomp.subscribe('/number',(response) => {
      let temp : String = response;
      this.socketNumber = response;
      console.log("TOTAL NUMBER OF TASKS", temp); 
    }); 
    if(this.nameSubscription != null){
      this.nameSubscription.unsubscribe();
      console.log("Name subscription unsubscribed");
    }
 this.nameSubscription = this.stomp.subscribe('/name/'+this.username,(response) => {
    let temp : String = response.taskName; 
    console.log("RECEIEVED TASKNAME: " , temp); 
    this.socketNameSource.next(temp); 
  }); 

  if(this.socketConsoleSubscription != null){
    this.socketConsoleSubscription.unsubscribe();
    console.log("Console subscription unsubscribed");
  }
  console.log('/console/'+this.username);
  this.socketConsoleSubscription = this.stomp.subscribe('/console/'+this.username,(response) => {
    let temp : String = response.taskName; 
    console.log("RECEIEVED Console TASKNAME: " , temp); 
    if(this.socketConsoleMap.get(response.taskName)){
      this.socketConsoleMap.get(response.taskName).push(response.console);
      console.log("consolemap: ",this.socketConsoleMap.get(response.taskName));
    }else{
      this.socketConsoleMap.set(response.taskName, []);
      this.socketConsoleMap.get(response.taskName).push(response.console);
    } 
    console.log("console output: ",this.socketConsoleMap); 
  }); 
}
 
 sendMessage(message: string) {
    let socketMessage = new SocketMessage(message);
    console.log(message);
    this.stomp.send('/app/topic/messages',{"message":message}); 
  }
 disconnect(){
    this.stomp.send('/app/topic/messages',{"message":"logout notification"});
    this.stomp.disconnect().then(() => {
      console.log( 'Connection closed' )
    });
  }
  showUsername(){
    console.log(this.username);
  }
}