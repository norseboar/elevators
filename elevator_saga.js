
{
    floorsWaiting: [],
    printDestQueue: function(elevator){
        var q = '';
        for(var i = 0; i < elevator.destinationQueue.length; i++){
            q = q.concat(elevator.destinationQueue[i] + ' ');
        }
        console.log(q);
    },

    assignElevator: function(floorNum, elevators) {
      var lowest = 1;
      var elChoice = 0;
      for (var i = 0; i < elevators.length; i++) {
        if (elevators[i].loadFactor() < lowest) {
          lowest = elevators[i].loadFactor();
          elChoice = i;
        }
      }
      elevators[elChoice].goToFloor(floorNum);
      console.log("Queue for " + elChoice + ":");
      this.printDestQueue(elevators[elChoice]);
    },

    floorInit: function(floors, elevators, floorNum){
      var that = this;
      this.floorsWaiting[floorNum] = "none";
      floors[floorNum].on("up_button_pressed", function () {
          console.log('in up_pressed handler ' + floors[floorNum].floorNum());
          // that.assignElevator(floorNum, elevators);
          if(that.floorsWaiting[floorNum] === "none" ||
            that.floorsWaiting[floorNum] === "up"){
            that.floorsWaiting[floorNum] = "up";
          }
          else {
            that.floorsWaiting[floorNum] = "both";
          }
      });
      floors[floorNum].on("down_button_pressed", function () {
         console.log('in down_pressed handler ' + floors[floorNum].floorNum());
         that.floorsWaiting[floorNum] = true;
        //  that.assignElevator(floorNum, elevators);
        if(that.floorsWaiting[floorNum] === "none" ||
          that.floorsWaiting[floorNum] === "down"){
          that.floorsWaiting[floorNum] = "down";
        }
        else {
          that.floorsWaiting[floorNum] = "both";
        }
      });
    },

    elevatorInit: function(elevator, floors){
      var that = this;

      // go to top floor to start
      elevator.goToFloor(floors.length - 1);
      elevator.goingDownIndicator(false); //covering initiation case for elevators; otherwise the direction isn't checked till the first stop
      elevator.on("idle", function() {
      });
      elevator.on("floor_button_pressed", function(floorNum) {
        console.log('in floor_pressed handler going to ' + floorNum);
        elevator.goToFloor(floorNum);
        that.printDestQueue(elevator);
      });
      elevator.on("stopped_at_floor", function(floorNum) {
        console.log("stopped at floor " + floorNum);

        // Delete this floor from an elevator's destination queue
        for (var i = 0; i < elevator.destinationQueue.length; i++) {
          if (elevator.destinationQueue[i] === floorNum) {
              elevator.destinationQueue.splice(i, 1);
          }
        }
        elevator.checkDestinationQueue();

        // Set goingUp and goingDown indicators. Also, set floorsWaiting to the
        // proper value
        var fw = that.floorsWaiting[floorNum];
        if (elevator.destinationQueue.length === 0) {
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(true);
          // With both indicators set, all people on this floor will have
          // boarded
          that.floorsWaiting[floorNum] = "none";
        }
        else if (elevator.destinationQueue[0] > elevator.currentFloor()) {
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(false);
          if(fw === "both"){
            that.floorsWaiting[floorNum] = "down";
          }
          if(fw === "up") {
            that.floorsWaiting[floorNum] = "none";
          }
        }
        else {
          elevator.goingDownIndicator(true);
          elevator.goingUpIndicator(false);
          if(fw === "both"){
            that.floorsWaiting[floorNum] = "up";
          }
          if(fw === "down"){
            that.floorsWaiting[floorNum] = "none";
          }
        }

        // Paddle between 0 and 8
        if(floorNum === 0){
          elevator.goToFloor(floors.length - 1);
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(false);
        }
        if(floorNum === floors.length - 1){
          elevator.goToFloor(0);
          elevator.goingUpIndicator(false);
          elevator.goingDownIndicator(true);
        }
      });
      elevator.on("passing_floor", function(floorNum, direction) {
          if (elevator.loadFactor >= 1.0) {
              return;
          }
          var pressed = false;
          for (var i = 0; i < elevator.destinationQueue.length; i++) {
              if (elevator.destinationQueue[i] === floorNum) {
                  pressed = true;
                  elevator.destinationQueue.splice(i, 1);
              }
          }
          elevator.checkDestinationQueue();

          if (pressed || that.floorsWaiting[floorNum] === direction ||
            that.floorsWaiting[floorNum] === "both") {
              elevator.goToFloor(floorNum, true);
            }
      });
    },

    init: function(elevators, floors) {
        var that = this;
        for(var i = 0; i < floors.length; i++){
            this.floorInit(floors, elevators, i);
        }
        for(i = 0; i < elevators.length; i++){
            this.elevatorInit(elevators[i], floors);
        }

    },

    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
