import consumer from "./consumer"

const roomChannel = consumer.subscriptions.create("RoomChannel", {
  
  connected() {
    // Called when the subscription is ready for use on the server
  },

  call(recipient_id){
    return this.perform('call', {
       recipient_id: recipient_id
    })
  },

  answer( session_id, sender_id ) {
    return this.perform('answer', {
       session_id, sender_id
    })
  },

  disconnected() {
    // Called when the subscription has been terminated by the server
  },

  received(data) {
    // Called when there's incoming data on the websocket for this channel
    if ( data['step'] === "receiving the call") {
      console.log("Received")
      let sender_id = data['sender_id']
      let sender_username = data['sender_username']
      let session_id = data['session_id']
      document.getElementById('sender_name').innerHTML = sender_username
      document.getElementById('session_id').innerHTML = session_id
      document.getElementById('sender_id').innerHTML = sender_id
      document.getElementById('receiver-notif').classList.toggle('d-none')
   }
  

  if ( data['step'] === "Broadcasting session to the recipient") {
    // Initialize the session
    const session = OT.initSession(data['apikey'], data['session_id']);
    let publisherProperties = {insertMode: 'append', width: '100%', height: '100%'}
    // Initialize the publisher for the recipient
    // the "publisher" we pass in the initPublisher method is a div in which our video replaces
    let publisher = OT.initPublisher('publisher', publisherProperties, error => {
       if (error) {
          console.log(`Couldn't initialize the publisher: ${error}`);
       } else {
          console.log("Receiver publisher initialized.");
       }
    });
    document.getElementById('session').classList.toggle('d-none')
    // When a new stream is created in the session, the Session object dispatches a streamCreated event,
    // When the client detects a stream, we want it to subscribe to that stream.
    session.on('streamCreated', function(event) {
       let subscriberProperties = {insertMode: 'append', width: '100%', height: '100%'};
       session.subscribe(event.stream, 'subscriber', subscriberProperties, error => {
          if (error) console.log(`Couldn't subscribe to the stream: ${error}`);
          else console.log("Receiver subscribed to the sender's stream");
       });
    });
    // connectionCreated and connectionDestroyed events dispatched by the Session object.
    //The Session object dispatches a connectionCreated event when a client (including your own)
    //connects to a Session. It also dispatches a connectionCreated event for every client in the
    //session when you first connect.
    session.on({
       connectionCreated: function (event) {
          if (event.connection.connectionId !=  session.connection.connectionId) {
             console.log(`Another client connected.`);
          }
       },
       connectionDestroyed: function   connectionDestroyedHandler(event) {
          // When user A hangs up, we end User B's connection to the session and we hide his session window.
          console.log(`A client disconnected.`);
          session.disconnect();
         document.getElementById('session').classList.toggle('d-none')
      }
    });
    // Connect to the session
    // If the connection is successful, publish an audio-video stream.
    session.connect(data['token'], function(error) {
       if (error) {
          console.log("Error connecting to the session:", error.name, error.message);
       } else {
          console.log("Connected to the session.");
          session.publish(publisher, function(error) {
             if (error) {
                console.log(`couldn't publish to the session: ${error}`);
             } else {
                console.log("The receiver is publishing a stream");
             }
           });
       }
    });
    // Whenever Alex clicks on the stopSessionBtn(the red camera icon on the session modal), we end his connection to the session and we hide his session modal.
    const stopSessionBtn = document.getElementById("disconnect");
    stopSessionBtn.addEventListener('click', (event)=> {
       event.preventDefault();
       console.log("stop-session btn clicked");
       session.disconnect();
       document.getElementById('session').classList.toggle('d-none')
    });
 }
 if (data['step'] === 'Broadcasting session to the sender') {
    console.log('Broadcasting the session to the sender');
    // Initialize the session
    const session = OT.initSession(data['apikey'], data['session_id']);
    console.log(session);
    // Hide the seder-notif
    document.getElementById('sender-notif').classList.toggle('d-none')
    // Initialize the publisher for the sender
    var publisherProperties = {insertMode: "append", width: '100%', height: '100%'};
    const publisher = OT.initPublisher('publisher', publisherProperties, function (error) {
       if (error) {
          console.log(`Couldn't initialize the publisher: ${error}`);
       } else {
          console.log("Sender publisher initialized.");
       }
    });
    document.getElementById('session').classList.toggle('d-none')
    // Detect when new streams are created and subscribe to them.
    session.on("streamCreated", function (event) {
       console.log("New stream in the session");
       var subscriberProperties = {insertMode: 'append', width: '100%', height: '100%'};
       const subscriber = session.subscribe(event.stream, 'subscriber',    subscriberProperties, function(error) {
          if (error) {
             console.log(`Couldn't subscribe to the stream: ${error}`);
          } else {
            console.log("Sender subscribed to the receiver's stream");
          }
       });
    });
    session.on({
       connectionCreated: function (event) {
          if (event.connection.connectionId !=   session.connection.connectionId) {
             console.log(`Another client connected.`);
          }
       },
       connectionDestroyed: function connectionDestroyedHandler(event) {
          // When Alex hangs up, we end David's connection to the session and we hide his session window.
          session.disconnect();
          document.getElementById('session').classList.toggle('d-none')
       }
    });
    // Connect to the session
    // If the connection is successful, publish an audio-video stream.
    session.connect(data['token'], function(error) {
       if (error) {
          console.log("Error connecting to the session:", error.name, error.message);
       } else {
          console.log("Connected to the session.");
          session.publish(publisher, function(error) {
             if (error) {
                console.log(`couldn't publish to the session: ${error}`);
             } else {
                console.log("The sender is publishing a stream");
             }
          });
       }
    });
    // Whenever userA clicks on the Hang up Button we end his connection to the session
    // and we hide his session partial.
    const stopSessionBtn = document.getElementById("disconnect");
    stopSessionBtn.addEventListener('click', (event)=> {
       event.preventDefault();
       console.log("stop-ssesion btn clicked");
       session.disconnect();
       document.getElementById('session').classList.toggle('d-none')
    });
 }
}
});

export default roomChannel
