/* main.js */
/* LINKED TO:  index.html */
/* DESCRIPTION:  the file containing all the js for the index page */
/* PROJECT NAME:  Monitise Chat Window */
/* PROJECT FOLDER:  Monitise */
/* OUTSIDE JAVASCRIPT/JQUERY CREDIT:  none */
/* AUTHOR:  Seth McDonald */
/* BUILD:  1.0 */
/* DATE LAST MODIFIED:  June 1, 2013 */


//////////////////////////////VARIABLES//////////////////////////////

var JQ = jQuery.noConflict();
var meUser;
var myConversation = new Conversation();
var myRoom = new Room();
var mySimulatedServer = new SimulatedServer();
var tempNewMessage = new Message();
var usersInRoomArr = new Array();


//////////////////////////////FUNCTIONS//////////////////////////////

//DESCRIPTION : initialize is the first function called when the dom is ready
function initialize(){

	bondage();
	
}




//DESCRIPTION : bondage is a storage area for all DOM elements that need to be bound or re-bound.  It should be called during initialization or whenever new elements are injected into the DOM and need to be bound.
function bondage(){

	//CLICK LISTENERS
	
	//send button
	JQ(".send_message_button").click(function() {
		
		
		if(localStorageSupported() != false){
        
			//get string from textarea
			var myUserInputStr = JQ("#compose_message_textbox").val();
			myUserInputStr = JQ.trim(myUserInputStr);
			
			//if the string is not empty
			if(myUserInputStr.length > 0){
			
				if(!meUser){//if meUser's name has not been set then...  
				
					meUser = new ThisUser();
					
					//alert("hello" + meUser.__proto__.userNameStr);
				
					//... input string should be a desired username for a new user and gets passed to enter room function
					enterRoom(myUserInputStr, clearMsgCompose);
				
				}else{//if meUser's name is set... 
				
					//...then the input string is passed as text of a new message
					meUser.sendNewMessage(myUserInputStr, clearMsgCompose);
					
				}
			}
		}
    });
	
	
	
	
	//EVENT LISTENERS
	
	//LOCALSTORAGE EVENTS
	window.addEventListener("storage", function(event) {
		
		
		
		//room has changed
		if(event.key === "mcw_room"){
		
			//value of new room is recieved from fake server
			myRoom = JSON.parse(mySimulatedServer.getRoomFromLocalStorage());
			
		}
		
		//new message has been "broadcast"
		if(event.key === "mcw_newMessage"){
					
			tempNewMessage = JSON.parse(event.newValue);
						
			var newFromServerMessage = new Message(tempNewMessage.msgBodyStr, tempNewMessage.msgSentTimeStr, tempNewMessage.senderStr);
			
			//alert("inside listener");
			
			myConversation.addNewMessage(newFromServerMessage);
			return;
			console.log("added message from listener");

		}
		
	});
	
	
	
	
	//DOM STYLING
	
	//username banner
	JQ('.username_banner').css('padding-bottom', '.3em');
	JQ('.username_banner').css('position', 'relative');
	//JQ('.username_banner').css('bottom', 0);



}





//DESCRIPTION : clearMsgCompose clears the message compose textarea of text
function clearMsgCompose(){
	JQ('#compose_message_textbox').val("");
}




//DESCRIPTION : enterRoom checks desired username against already in use before creating a new user and joining the chat room
//@param : username to test and assign
function enterRoom(tempUserNameStr, callback){
		
		//update meUser's name 
		meUser.__proto__.setUserName(tempUserNameStr);
		
		//meUser joins chat room
		myRoom.registerNewUser(meUser);
		
		
		//update the UI
		//normalize the chat box
		JQ('.conversation_box_wrapper').html('<div class="spacer_10_percent"></div><div class="conversation_box"><div id="message_display_wrapper_0" class="message_display_wrapper">&nbsp;</div>');
		
		
		//load the username onto the title banner 
		JQ('.username_banner_container').html('<span class="username_banner">' + meUser.__proto__.getUserName() + '</span>');
		//bondage();
		
		
		//update the conversation object which updates the UI a second time
		mySimulatedServer.generateUserEntranceMessage(meUser.__proto__.getUserName());

	//}
	
	callback();
	
}



//DESCRIPTION : localStorageSupported detects whether or not a global local storage variable is present 
function localStorageSupported(){

	try {
  		return "localStorage" in window && window["localStorage"] !== null;
 	} catch (e) {
		alert("The simulated server is powered by the Web Storage API. Please view this page in a supporting browser such as Chrome or Firefox.");
  		return false;
 	}

}








////////////////////JAVASCRIPT CLASSES////////////////////
////////////////////JAVASCRIPT CLASSES////////////////////

/////CONVERSATION CLASS/////
function Conversation(){
	
	var messagesArr = new Array();
	var messageCountInt = 0;
	
	this.messagesArr = messagesArr;	
	this.messageCountInt = messageCountInt;
	
	this.addNewMessage;
	
}
	
	
	//METHODS
	
	//DESCRIPTION : addNewMessage appends a new message to the back of the messages array
	//@param : a message object
	Conversation.prototype.addNewMessage = function(newMessage){
			
			this.messagesArr.push(newMessage);
			
			//generate the message html for injection onto the DOM
			var newMessageHtml = newMessage.generateMessageHtml();
			
			//generate the id of the last message html 			
			var messagesWrapperIdStr = '#message_display_wrapper_' + (myConversation.messageCountInt - 1);
			
			//inject the new message html onto the DOM at the bottom of the chat box
			JQ(messagesWrapperIdStr).after(newMessageHtml);
			
			//set scrollbar to the bottom 
			JQ('.conversation_box').scrollTop(1000000);
		
	}







/////MESSAGE CLASS/////
function Message(thisMsgBodyStr, thisMsgSentTimeStr, thisSenderStr){
	
	var msgBodyStr;
	var msgSentTimeStr;
	var senderStr;
		
	this.msgBodyStr = thisMsgBodyStr;	
	this.msgSentTimeStr = thisMsgSentTimeStr;	
	this.senderStr = thisSenderStr;	
	
	this.generateMessageHtml;

}


	//GETTERS & SETTERS
	
	//get message body
	Message.prototype.getMsgBody = function(){
		return this.msgBodyStr;	
	}
	
	//get message sent time
	Message.prototype.getMsgTime = function(){
		return this.msgSentTimeStr;	
	}
	
	//get message sender
	Message.prototype.getSender = function(){
		return this.senderStr;	
	}
	
	//set message body
	Message.prototype.setMsgBody = function(toBeSetMsgBodyStr){
		this.msgBodyStr = toBeSetMsgBodyStr;	
	}
	
	//set message sent time
	Message.prototype.setMsgTime = function(toBeSetMsgTimeStr){
		this.msgSentTimeStr = toBeSetMsgTimeStr;	
	}
	
	//set message sender
	Message.prototype.setSender = function(toBeSetSenderStr){
		this.senderStr = toBeSetSenderStr;	
	}
	
	
	//METHODS

	//DESCRIPTION : generateMessageHtml generates the html for a message
	//@return : messages html as a string
	Message.prototype.generateMessageHtml = function(){

			myConversation.messageCountInt += 1;
			var messagesWrapperIdStr = 'message_display_wrapper_' + myConversation.messageCountInt;
			
			var messageHtml = '<div id="' + messagesWrapperIdStr + '" class="message_display_wrapper"><div class="message_sender_container">' + this.senderStr + ' :</div><div class="message_body_container">' + this.msgBodyStr + '</div><div class="message_time_container">' + this.msgSentTimeStr + '</div></div>'; 
			
			return messageHtml;
						
	};






/////ROOM CLASS/////
function Room(){
	
	var usersArr = new Array();
	
	this.usersArr = usersArr;
	this.registerNewUser;
	
}
	
	//METHODS	
	
	//DESCRIPTION : registerNewUser registers a new user in the chat
	//@param : the new user object 
	Room.prototype.registerNewUser = 
		
			function(toBeRegisteredUser){
		
			//append the new user to the users array
			this.usersArr.push(toBeRegisteredUser);
		
			//send the room the fake server
			mySimulatedServer.setRoomToLocalStorage(this);
		
	}








/////SIMULATED_SERVER CLASS/////
function SimulatedServer(){
	
	this.getServerTime;
	
}


	//METHODS
	
	//DESCRIPTION : getRoomFromLocalStorage gets the room object from local storage
	SimulatedServer.prototype.getRoomFromLocalStorage = function(){
				
		if(!localStorage.mcw_room){
			
			myRoom = new Room();
			localStorage.mcw_room = JSON.stringify(myRoom);
			
		}
		
		return localStorage.mcw_room;
		
	}
	
	
	//DESCRIPTION : getNewMessageBroadcastFromLocalStorage retrieves a message stored in local storage
	//@return : new message object in JSON format
	SimulatedServer.prototype.getNewMessageBroadcastFromLocalStorage = function(){
		
		console.log(JSON.parse(localStorage.mcw_newMessage));
		
		return localStorage.mcw_newMessage;
		
	}
	
	
	//DESCRIPTION : setRoomToLocalStorage sets the room object to local storage
	//@param : the room to set
	SimulatedServer.prototype.setRoomToLocalStorage = function(toSetToLocalStorageRoom){
	
		localStorage.mcw_room = JSON.stringify(toSetToLocalStorageRoom);
		
	}
	
	
	//DESCRIPTION : generateUserEntranceMessage generates a user entrance announcement message object
	//@param : new user's name 
	//@return : an user entrance announcement message object 
	SimulatedServer.prototype.generateUserEntranceMessage = function(toAnnounceUserNameStr){
		
		var userEntranceMsgBodyStr = toAnnounceUserNameStr + ' has just entered the chat room!';
		var userEntranceMessage = new Message(userEntranceMsgBodyStr, mySimulatedServer.getServerTime(), "SERVER");
		
		this.updateNewMessageLocalStorage(userEntranceMessage);
		//myConversation.addNewMessage(userEntranceMessage);
		console.log("added message from server.generateUserEntranceMessage");


	}


	//DESCRIPTION : getServerTime gets the time from the fake server
	//@return : the server time as a string 
	SimulatedServer.prototype.getServerTime = function(){
	
		var serverDate = new Date();
		var hours = serverDate.getHours();
		var minutes = serverDate.getMinutes();
		var ampm = hours >= 12 ? 'pm' : 'am';
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? '0'+minutes : minutes;
		var strTime = hours + ':' + minutes + ' ' + ampm;
		return strTime;

	}
	
	
	//DESCRIPTION : receiveUserMessage accepts a message from a user to broadcast 
	//@param : a message object 
	SimulatedServer.prototype.receiveUserMessage = function(toBeRoutedUserMessage){
		
		var serverTimeStr = this.getServerTime();
		
		toBeRoutedUserMessage.setMsgTime(serverTimeStr);
		myConversation.addNewMessage(toBeRoutedUserMessage);
		console.log("added message from server.receiveUserMessage");

		this.updateNewMessageLocalStorage(toBeRoutedUserMessage);
		
	}
	
	
	//DESCRIPTION : updateNewMessageLocalStorage saves a new message to the new message local storage
	//@param : a message object
	SimulatedServer.prototype.updateNewMessageLocalStorage = function(toBeSavedToLocalStorageMessage){
		
		localStorage.mcw_newMessage = JSON.stringify(toBeSavedToLocalStorageMessage);
		
	}
	







/////USER CLASS/////
function User(){
	
	var userNameStr = "";
	
	this.userNameStr = userNameStr;	
	this.setUserName;

}


	//GETTERS & SETTERS
	
	//get username
	User.prototype.getUserName = function(){
		return this.userNameStr;	
	}
	
	//set username
	User.prototype.setUserName = function(toBeSetUsernameStr){
		this.userNameStr = toBeSetUsernameStr;	
	}
	
	
	
	
	
	
/////THISUSER SUB-CLASS/////
function ThisUser(){
	
	var tempTimeStr = "";
	
	this.sendNewMessage = function(myInputMsgBodyStr, callback){
		
		var newToSendMessage = new Message(myInputMsgBodyStr, tempTimeStr, this.userNameStr);
		//myConversation.addNewMessage(newToSendMessage);
		console.log("added from ThisUser.sendNewMessage");
		mySimulatedServer.receiveUserMessage(newToSendMessage);		
		
		callback();
	}
		
}
ThisUser.prototype = new User();


	
	


/////////////////////////////////MAIN////////////////////////////////
JQ(document.window).ready(function(){
	initialize();
});

