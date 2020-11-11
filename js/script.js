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
      }
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
        }
    }
  })