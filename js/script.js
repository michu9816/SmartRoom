var app = new Vue({
    el: '#app',
    data: {
      smallView: true,
      temperature: "-",
      humidity: "-",
      motionSensor: true,
      lightSensor: true,
      light: {
          turnOn: true,
          rainbow: false,
          auto: true,
          color: "#ffffff"
      },
      WebSocketLoaded: false
    },
    created: function(){
        setTimeout(function(){
            $("body").css({opacity:"1"});
        },500)
    },
    methods: {
        switchs: function(param){
            var vm = this;
            var command = "vm.light."+param+" = !vm.light."+param;
            eval(command);
            console.log(command);
        },
        unparseWebsocketMessage: function(message){
            var vm = this;
            console.log(message);
            var wsObject = JSON.parse(message);
            vm.temperature = wsObject.dhtSensor.temperature;
            vm.humidity = wsObject.dhtSensor.humidity;
            vm.lightSensor = wsObject.lightSensor;
            vm.motionSensor = wsObject.motionSensor;
        },
        sendRGB: function(color){
            var vm = this;
            if(!vm.light.turnOn)
                vm.light.turnOn = true;
            ws.send(vm.light.color);
        },
        switchLed: function(){
            var vm = this;
            if(vm.light.turnOn)
                ws.send("#000000");
            else
                ws.send(vm.light.color);
            vm.light.turnOn = !vm.light.turnOn; 
        }
    }
  })

  $(document).ready(function(){
      loadWebsocket();
  })

var ws = "";
  function loadWebsocket() {
      console.log("Łączenie z websocketem")
    if(app.WebSocketLoaded)
        return;            
    if ("WebSocket" in window) {
       // Let us open a web socket
       ws = new WebSocket("ws://192.168.2.80:81");
        
       ws.onopen = function() {
          app.WebSocketLoaded = true;
          // Web Socket is connected, send data using send()
          ws.send("Message to send");
       };
        
       ws.onmessage = function (evt) { 
          var received_msg = evt.data;
          app.unparseWebsocketMessage(received_msg);
       };
        
       ws.onclose = function() { 
         app.WebSocketLoaded = false;
          console.log("Closed connection");
       };
    }
 }

//  <html><head>
//      <script>var connection = new WebSocket('ws://'+location.hostname+':81/', ['arduino']);connection.onopen = function () {  connection.send('Connect ' + new Date()); }; connection.onerror = function (error) {    console.log('WebSocket Error ', error);};connection.onmessage = function (e) {  console.log('Server: ', e.data);};
//      function sendRGB() {  
//      var r = parseInt(document.getElementById('r').value).toString(16); 
//       var g = parseInt(document.getElementById('g').value).toString(16);  
//       var b = parseInt(document.getElementById('b').value).toString(16);  
//       if(r.length < 2) { r = '0' + r; }   if(g.length < 2) { g = '0' + g; }   
//       if(b.length < 2) { b = '0' + b; }   var rgb = '#'+r+g+b;  
//         console.log('RGB: ' + rgb); connection.send(rgb); }</script></head><body>LED Control:<br/><br/>R: <input id="r" type="range" min="0" max="255" step="1" oninput="sendRGB();" /><br/>G: <input id="g" type="range" min="0" max="255" step="1" oninput="sendRGB();" /><br/>B: <input id="b" type="range" min="0" max="255" step="1" oninput="sendRGB();" /><br/></body></html>