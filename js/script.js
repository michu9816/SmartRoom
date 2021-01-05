var app = new Vue({
    el: '#app',
    data: {
      smallView: true,
      temperature: "-",
      humidity: "-",
      motionSensor: true,
      lightSensor: true,
      light: {
          settings: false,
          turnOn: true,
          checkLightAuto: false,
          rainbow: false,
          auto: true,
          color: "#ffffff",
          scheduledDays: [0,1,1,1,1,1,0],
          scheduleOnTime: "06:25",
          scheduleOffTime: "06:45"
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
            vm.light.turnOn = wsObject.light.turnOn;
            vm.light.auto = wsObject.light.autoMode;
            vm.light.checkLightAuto = wsObject.light.checkLightAuto;
            var color = "#";
            color += (parseInt(wsObject.light.color.split(",")[0]) < 16 ? "0" : "") + parseInt(wsObject.light.color.split(",")[0]).toString(16);
            color += (parseInt(wsObject.light.color.split(",")[1]) < 16 ? "0" : "") + parseInt(wsObject.light.color.split(",")[1]).toString(16);
            color += (parseInt(wsObject.light.color.split(",")[2]) < 16 ? "0" : "") + parseInt(wsObject.light.color.split(",")[2]).toString(16);
            vm.light.color = color;
            vm.light.scheduledDays = wsObject.light.scheduledDays;
            var scheduleOnTime = wsObject.light.turnOnTime.split(":")[0] < 10 ? "0" + wsObject.light.turnOnTime.split(":")[0] : wsObject.light.turnOnTime.split(":")[0];
            scheduleOnTime += ":";
            scheduleOnTime += wsObject.light.turnOnTime.split(":")[1] < 10 ? "0" + wsObject.light.turnOnTime.split(":")[1] : wsObject.light.turnOnTime.split(":")[1];
            vm.light.scheduleOnTime = scheduleOnTime;
            var scheduleOffTime = wsObject.light.turnOffTime.split(":")[0] < 10 ? "0" + wsObject.light.turnOffTime.split(":")[0] : wsObject.light.turnOffTime.split(":")[0];
            scheduleOffTime += ":";
            scheduleOffTime += wsObject.light.turnOffTime.split(":")[1] < 10 ? "0" + wsObject.light.turnOffTime.split(":")[1] : wsObject.light.turnOffTime.split(":")[1];
            vm.light.scheduleOffTime = scheduleOffTime;
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
                ws.send("o");
            else
                ws.send('i');
        },
        switchAuto: function(){
            var vm = this;
            vm.light.auto = !vm.light.auto;
            ws.send("a");
        },
        switchCheckLightAuto: function(){
            var vm = this;
            vm.light.checkLightAuto = !vm.light.checkLightAuto;
            ws.send("b");
        },
        saveSettings: function(){
            var vm = this;
            var settings={
                turnOnHour:parseInt(vm.light.scheduleOnTime.split(":")[0]),
                turnOnMinute:parseInt(vm.light.scheduleOnTime.split(":")[1]),
                turnOffHour:parseInt(vm.light.scheduleOffTime.split(":")[0]),
                turnOffMinute:parseInt(vm.light.scheduleOffTime.split(":")[1]),
                scheduled:vm.light.scheduledDays
            }
            console.log(JSON.stringify(settings));
            ws.send(JSON.stringify(settings));
        }
    }
  })

  $(document).ready(function(){
      loadWebsocket();
  })

var ws = "";
  function loadWebsocket() {
      try{
          ws.close();
      }catch(e){
          // nic nie rób
      }
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