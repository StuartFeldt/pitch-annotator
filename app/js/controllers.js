// global variables
var pitchControllers = angular.module('pitchControllers', []);
var pitchEventStack = [{
    count: {
        strikes: 0,
        balls: 0
    },
    inning: 1,
    outs: 0,
    pitchCount: 0,
    score: {
        home: 0,
        away: 0
    }
}];

/*
 * Game Record Controller
 */
pitchControllers.controller('GameRecordController', ['$scope', '$http', function($scope, $http) {

    // get available pitches
    $http.get('data/pitches.json').success(function(pitchData) {
        $scope.pitchTypes = pitchData;
    });

    // get available zones
    $http.get('data/placements.json').success(function(placementData) {
        $scope.placements = placementData;
    });

    // initialize pitchEvent to defaults
    var currentPitchEvent = 0;
    var pitchEvent = {
        count: {
            strikes: 0,
            balls: 0
        },
        inning: 1,
        outs: 0,
        pitchCount: 0,
        score: {
            home: 0,
            away: 0
        },
        batter: {
            handedness: 0,
            order: 0
        },
        pitch: {
            type: 0,
            speed: 0,
            placement: 0, // UA = 0, LI = 8
            outcome: 0 //1 = 1b, 2 = 2b, 3 = 3b, 4 = hr, s = strike, b = ball, 5 = in-play out
        },
    };

    // re-initialize the event stack in case we are coming back from recap
    pitchEventStack = [{
        count: {
            strikes: 0,
            balls: 0
        },
        inning: 1,
        outs: 0,
        pitchCount: 0,
        score: {
            home: 0,
            away: 0
        }
    }];

    // Set initial values
    $scope.count = pitchEvent.count;
    $scope.inning = pitchEvent.inning;
    $scope.outs = pitchEvent.outs;
    $scope.pitchCount = pitchEvent.pitchCount;
    $scope.score = pitchEvent.score;
    $scope.pitchSpeed = 85;
    $scope.avgSpeed = 0;
    $scope.eventLog = [];

    $scope.commitPitchEvent = function() {

        // generate event log
        $scope.lastEvent = "(" + $scope.pitchCount + ") ";
        $scope.lastEvent += $scope.count.balls + "-" + $scope.count.strikes + " " + $scope.pitchTypes[pitchEvent.pitch.type].name;
        $scope.lastEvent += " " + $scope.placements[pitchEvent.pitch.placement].name + " at " + $scope.pitchSpeed + " mph";
        $scope.lastEvent += " with " + $scope.outs + " out";
        $scope.eventLog.push($scope.lastEvent);

        // bump pitch count
        pitchEvent.pitchCount++;
        $scope.pitchTypes[pitchEvent.pitch.type].frequency.total++;
        pitchEvent.outs = $scope.outs;

        // update previous (non-referencing) object to the event stack
        pitchEventStack[currentPitchEvent] = {
            count: {
                strikes: pitchEvent.count.strikes,
                balls: pitchEvent.count.balls
            },
            inning: pitchEvent.inning,
            outs: pitchEvent.outs,
            pitchCount: pitchEvent.pitchCount,
            score: pitchEvent.score,
            batter: {
                handedness: pitchEvent.batter.handedness,
                order: pitchEvent.batter.order
            },
            pitch: {
                type: pitchEvent.pitch.type,
                speed: $scope.pitchSpeed,
                placement: pitchEvent.pitch.placement,
                outcome: pitchEvent.pitch.outcome
            }
        };

        //calculate current summary
        $scope.calculateSummary();

        // generate counts
        switch (pitchEvent.pitch.outcome) {
            case 's':
                $scope.addStrike();
                break;
            case 'fb':
                $scope.addFb();
                break;
            case 'b':
                $scope.addBall();
                break;
            case 1:
                $scope.resetCount();
                break;
            case 2:
                $scope.resetCount();
                break;
            case 3:
                $scope.resetCount();
                break;
            case 4:
                $scope.resetCount();
                break;
            case 5:
                $scope.addOut();
                break;
        }

        // apply the current event to view
        $scope.count = pitchEvent.count;
        $scope.inning = pitchEvent.inning;
        $scope.outs = pitchEvent.outs;
        $scope.pitchCount = pitchEvent.pitchCount;
        $scope.score = pitchEvent.score;


        // duplicate this event for the next event;
        pitchEventStack.push(pitchEventStack[currentPitchEvent]);

        // bump which pitch event we are on
        currentPitchEvent++;
    }

    // calculate short summary
    $scope.calculateSummary = function() {

        var totalSpeed = 0;
        $.each(pitchEventStack, function(k, v) {
            totalSpeed += parseInt(v.pitch.speed);
        });
        $scope.avgSpeed = Math.round(totalSpeed / pitchEventStack.length);
    }


    /*
     *  Game Event Helpers
     */
    $scope.addStrike = function() {
        pitchEvent.count.strikes++;
        if (pitchEvent.count.strikes == 3) {
            pitchEvent.count.strikes = 0;
            pitchEvent.count.balls = 0;
            $scope.addOut();
        }
    }
    $scope.addFb = function() {
        if (pitchEvent.count.strikes != 2) {
            $scope.addStrike();
        }
    }
    $scope.addBall = function() {
        pitchEvent.count.balls++;
        if (pitchEvent.count.balls == 4) {
            pitchEvent.count.strikes = 0;
            pitchEvent.count.balls = 0;
        }
    }
    $scope.addOut = function() {
        pitchEvent.outs++;
        if (pitchEvent.outs == 3) {
            pitchEvent.outs = 0;
            $scope.addInning();
        }
    }
    $scope.addInning = function() {
        pitchEvent.inning++;
    }
    $scope.addPitchType = function(type) {
        $scope.pitchType = type;
        pitchEvent.pitch.type = type;
    }
    $scope.addPitchOutcome = function(outcome) {
        pitchEvent.pitch.outcome = outcome;
    }
    $scope.resetCount = function() {
        pitchEvent.count.strikes = 0;
        pitchEvent.count.balls = 0;
    }
    $scope.addPitchPlacement = function(loc) {
        pitchEvent.pitch.placement = loc;
    }
    $scope.addBatterHandedness = function(hand) {
        pitchEvent.batter.handedness = hand;
    }
}]);


/*
 * Game Recap Controller
 */
pitchControllers.controller('GameRecapController', ['$scope', '$http', function($scope, $http) {

    // Shave last element from event stack, since it is a dup of last event
    pitchEventStack.pop();

    // Get the current event stack, set Math so we can do math in views
    $scope.pitchEventStack = pitchEventStack;
    $scope.Math = window.Math;
    $scope.totalPitches = $scope.pitchEventStack[$scope.pitchEventStack.length - 1].pitchCount;
    $scope.outcome = [];

    // Set results filter to -1 for all properties (any)
    $scope.resultsFilter = {
        "balls": -1,
        "strikes": -1,
        "outs": -1,
        "batter": -1
    };

    // get json data of all pitches and zone values
    $http.get('data/pitches.json').success(function(pitchData) {
        $http.get('data/placements.json').success(function(placementData) {

            // save to recap scope
            $scope.pitchTypes = pitchData;
            $scope.placements = placementData;

            // count pitch frequencies 
            $.each($scope.pitchEventStack, function(k, v) {
                $scope.placements[v.pitch.placement].frequency.total++;
                $scope.pitchTypes[v.pitch.type].frequency.total++;
                $scope.pitchTypes[v.pitch.type].avgSpeed += parseInt(v.pitch.speed);

                // goofy ternarys for if key does not exist
                $scope.pitchTypes[v.pitch.type].outcome[v.pitch.outcome] = $scope.pitchTypes[v.pitch.type].outcome[v.pitch.outcome] == undefined ? 1 : $scope.pitchTypes[v.pitch.type].outcome[v.pitch.outcome] += 1;
                $scope.outcome[v.pitch.outcome] = $scope.outcome[v.pitch.outcome] == undefined ? 1 : $scope.outcome[v.pitch.outcome] += 1;
                $scope.pitchTypes[v.pitch.type].topSpeed = v.pitch.speed > $scope.pitchTypes[v.pitch.type].topSpeed ? v.pitch.speed : $scope.pitchTypes[v.pitch.type].topSpeed;
            });

            $.each($scope.pitchTypes, function(k, v) {
                v.avgSpeed = v.avgSpeed / v.frequency.total;
            });

            $scope.calculateZoneStyles();
        });
    });

    // add filter
    $scope.addFilter = function(type, num) {
        switch (type) {
            case 'strikes':
                $scope.resultsFilter.strikes = num;
                break;
            case 'balls':
                $scope.resultsFilter.balls = num;
                break;
            case 'outs':
                $scope.resultsFilter.outs = num;
                break;
            case 'batter':
                $scope.resultsFilter.batter = num;
                break;
        }

        // apply the filter
        $scope.applyFilter($scope.resultsFilter.balls, $scope.resultsFilter.strikes, $scope.resultsFilter.outs, $scope.resultsFilter.batter);
    }


    $scope.applyFilter = function(balls, strikes, outs, batter) {

        // clear any previous counts
        $scope.clearTotals();

        // count up totals, filtering appropriately
        // if we have -1, we will just do parseInt(val, 10),
        // to result in true
        $.each($scope.pitchEventStack, function(k, v) {
            if (
                v.count.balls == (balls == -1 ? v.count.balls : balls) &&
                v.count.strikes == (strikes == -1 ? v.count.strikes : strikes) &&
                v.batter.handedness == (batter == -1 ? v.batter.handedness : batter) &&
                v.outs == (outs == -1 ? v.outs : outs)) {
                $scope.placements[v.pitch.placement].frequency.total++;
                $scope.pitchTypes[v.pitch.type].frequency.total++;
                $scope.pitchTypes[v.pitch.type].avgSpeed += parseInt(v.pitch.speed);

                // goofy ternarys for if key does not exist
                $scope.pitchTypes[v.pitch.type].outcome[v.pitch.outcome] = $scope.pitchTypes[v.pitch.type].outcome[v.pitch.outcome] == undefined ? 1 : $scope.pitchTypes[v.pitch.type].outcome[v.pitch.outcome] += 1;
                $scope.outcome[v.pitch.outcome] = $scope.outcome[v.pitch.outcome] == undefined ? 1 : $scope.outcome[v.pitch.outcome] += 1;
                $scope.pitchTypes[v.pitch.type].topSpeed = v.pitch.speed > $scope.pitchTypes[v.pitch.type].topSpeed ? v.pitch.speed : $scope.pitchTypes[v.pitch.type].topSpeed;
                $scope.totalPitches++;
            }
        });

        $.each($scope.pitchTypes, function(k, v) {
            v.avgSpeed = v.avgSpeed / v.frequency.total;
        });

        $scope.calculateZoneStyles();
    }

    // clear totals
    $scope.clearTotals = function() {
        $.each($scope.placements, function(k, v) {
            v.frequency.total = 0;
        });
        $.each($scope.pitchTypes, function(k, v) {
            v.frequency.total = 0;
            v.avgSpeed = 0;
            v.topSpeed = 0;
            v.outcome = [];
        });
        $scope.outcome = [];
        $scope.totalPitches = 0;
    }

    // generate styles for zones
    $scope.calculateZoneStyles = function() {
        $.each($scope.placements, function(k, v) {
            var color = 255 - (v.frequency.total / $scope.totalPitches * 255).toFixed(0);
            v.zoneStyle = "rgb(" + color + ", " + color + ", " + color + ")"
        });
    }

}]);

// helper controller - randomize data for testing purposes
pitchControllers.controller('RandomController', ['$scope', function($scope) {
    for (i = 0; i < 121; i++) {
        var outcome = random(1, 8);

        switch (outcome) {
            case 6:
                outcome = 's'
                break;
            case 7:
                outcome = 'fb'
                break;
            case 8:
                outcome = 'b'
                break;
        }

        pitchEventStack.push({
            count: {
                strikes: random(0, 2),
                balls: random(0, 3)
            },
            inning: random(1, 9),
            outs: random(0, 2),
            pitchCount: i,
            score: {
                home: 0,
                away: 0
            },
            batter: {
                handedness: random(0, 1),
                order: random(1, 9)
            },
            pitch: {
                type: random(0, 4),
                speed: random(50, 105),
                placement: random(0, 8),
                outcome: outcome
            }
        });
    }

    $scope.pitchEventStack = pitchEventStack;

    function random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;;
    }
}]);