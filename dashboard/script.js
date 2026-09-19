// ==========================================
// AUTONOMOUS ROBOT - LIVE ROS 2 DASHBOARD
// ==========================================

const ros = new ROSLIB.Ros({
    url: "ws://localhost:9090"
});


// ==========================================
// MISSION VARIABLES
// ==========================================

let waypoints = [];
let totalWaypoints = 0;
let completedWaypoints = 0;


// ==========================================
// LiDAR / RADAR VARIABLES
// ==========================================

let lidarMonitoring = false;

let radarInterval = null;
let radarCenterAngle = 0;
let radarSweepAngle = 0;
let radarSweepDirection = 1;


// ==========================================
// CONNECTION STATUS
// ==========================================

ros.on("connection", function () {

    console.log("Connected to ROS 2");

    updateRobotStatus(
        "CONNECTED",
        "Dashboard connected to ROS 2"
    );

});


ros.on("error", function (error) {

    console.error(
        "ROS connection error:",
        error
    );

    updateRobotStatus(
        "ERROR",
        "Unable to connect to ROS 2"
    );

});


ros.on("close", function () {

    console.log(
        "ROS connection closed"
    );

    updateRobotStatus(
        "OFFLINE",
        "ROS 2 connection closed"
    );

});


// ==========================================
// RVIZ CLICKED POINTS
// ==========================================

const clickedPointTopic = new ROSLIB.Topic({

    ros: ros,

    name: "/clicked_point",

    messageType:
        "geometry_msgs/PointStamped"

});


clickedPointTopic.subscribe(function (message) {

    const x =
        message.point.x;

    const y =
        message.point.y;


    // --------------------------------------
    // NEW WAYPOINT
    // --------------------------------------

    waypoints.push({
        x: x,
        y: y
    });


    totalWaypoints =
        waypoints.length;


    // --------------------------------------
    // ENABLE LiDAR MONITORING
    // --------------------------------------

    lidarMonitoring = true;


    console.log(
        "Waypoint selected:",
        x.toFixed(2),
        y.toFixed(2)
    );


    updateWaypointDisplay();

    updateProgressDisplay();

    updateCurrentWaypoint();

});


// ==========================================
// REAL MISSION STATUS
// ==========================================

const missionStatusTopic = new ROSLIB.Topic({

    ros: ros,

    name: "/mission_status",

    messageType: "std_msgs/String"

});


missionStatusTopic.subscribe(function (message) {

    const status =
        message.data;


    console.log(
        "Mission status:",
        status
    );


    const missionElement =
        document.getElementById(
            "missionStatus"
        );


    const navigationElement =
        document.getElementById(
            "navigationStatus"
        );


    // --------------------------------------
    // READY
    // --------------------------------------

    if (status === "READY") {

        if (missionElement) {

            missionElement.textContent =
                "READY";

        }

        if (navigationElement) {

            navigationElement.textContent =
                "READY";

        }

        updateCurrentWaypoint();

    }


    // --------------------------------------
    // NAVIGATING
    // --------------------------------------

    else if (status === "NAVIGATING") {

        // Make sure LiDAR is active
        // during an actual mission.

        lidarMonitoring = true;


        if (missionElement) {

            missionElement.textContent =
                "NAVIGATING";

        }

        if (navigationElement) {

            navigationElement.textContent =
                "NAVIGATING";

        }

        updateCurrentWaypoint();

    }


    // --------------------------------------
    // COMPLETE
    // --------------------------------------

    else if (status === "COMPLETE") {

        console.log(
            "Mission complete - resetting dashboard"
        );

        resetMissionDashboard();

    }


    // --------------------------------------
    // CANCELED
    // --------------------------------------

    else if (status === "CANCELED") {

        lidarMonitoring = false;

        stopRadar();

        updateObstacleStatus(false);


        if (missionElement) {

            missionElement.textContent =
                "CANCELED";

        }

        if (navigationElement) {

            navigationElement.textContent =
                "CANCELED";

        }

        updateCurrentWaypoint();

    }


    // --------------------------------------
    // FAILED
    // --------------------------------------

    else if (status === "FAILED") {

        lidarMonitoring = false;

        stopRadar();

        updateObstacleStatus(false);


        if (missionElement) {

            missionElement.textContent =
                "FAILED";

        }

        if (navigationElement) {

            navigationElement.textContent =
                "FAILED";

        }

        updateCurrentWaypoint();

    }

});


// ==========================================
// REAL MISSION PROGRESS
// ==========================================

const missionProgressTopic = new ROSLIB.Topic({

    ros: ros,

    name: "/mission_progress",

    messageType: "std_msgs/Int32"

});


missionProgressTopic.subscribe(function (message) {

    // Ignore old progress messages after
    // the dashboard has been reset.

    if (totalWaypoints === 0) {

        completedWaypoints = 0;

        updateProgressDisplay();

        updateCurrentWaypoint();

        updateWaypointDisplay();

        return;

    }


    completedWaypoints =
        message.data;


    // Never exceed selected waypoint count.

    if (
        completedWaypoints >
        totalWaypoints
    ) {

        completedWaypoints =
            totalWaypoints;

    }


    console.log(
        "Mission progress:",
        completedWaypoints
    );


    updateProgressDisplay();

    updateWaypointDisplay();

    updateCurrentWaypoint();

});


// ==========================================
// REAL DISTANCE REMAINING
// ==========================================

const missionDistanceTopic = new ROSLIB.Topic({

    ros: ros,

    name: "/mission_distance",

    messageType: "std_msgs/Float32"

});


missionDistanceTopic.subscribe(function (message) {

    // Ignore old distance messages after
    // mission reset.

    if (totalWaypoints === 0) {

        const distanceElement =
            document.getElementById(
                "distanceRemaining"
            );


        if (distanceElement) {

            distanceElement.textContent =
                "—";

        }

        return;

    }


    const distance =
        message.data;


    const distanceElement =
        document.getElementById(
            "distanceRemaining"
        );


    if (distanceElement) {

        distanceElement.textContent =
            `${distance.toFixed(2)} m`;

    }

});


// ==========================================
// LiDAR
// ==========================================

const lidarTopic = new ROSLIB.Topic({

    ros: ros,

    name: "/scan",

    messageType:
        "sensor_msgs/LaserScan"

});


lidarTopic.subscribe(function (message) {

    // --------------------------------------
    // DO NOTHING WHEN LiDAR MONITORING
    // IS DISABLED
    // --------------------------------------

    if (!lidarMonitoring) {

        return;

    }


    const ranges =
        message.ranges;


    let minimumDistance =
        Infinity;


    let closestAngle =
        0;


    // --------------------------------------
    // FRONT ±30 DEGREES
    // --------------------------------------

    const frontAngle =
        30 * Math.PI / 180;


    for (
        let i = 0;
        i < ranges.length;
        i++
    ) {

        const angle =
            message.angle_min +
            i *
            message.angle_increment;


        if (
            Math.abs(angle) >
            frontAngle
        ) {

            continue;

        }


        const distance =
            ranges[i];


        if (
            Number.isFinite(distance) &&
            distance >= message.range_min &&
            distance <= message.range_max &&
            distance < minimumDistance
        ) {

            minimumDistance =
                distance;

            closestAngle =
                angle;

        }

    }


    // --------------------------------------
    // OBSTACLE DETECTION
    // --------------------------------------

    const obstacleDetected =
        Number.isFinite(
            minimumDistance
        ) &&
        minimumDistance < 0.55;


    updateObstacleStatus(
        obstacleDetected
    );


    // --------------------------------------
    // RADAR
    // --------------------------------------

    if (obstacleDetected) {

        radarCenterAngle =
            closestAngle *
            180 /
            Math.PI;


        startRadar(
            radarCenterAngle
        );

    }

    else {

        stopRadar();

    }

});


// ==========================================
// START RADAR
// ==========================================

function startRadar(
    centerAngle
) {

    const radarLine =
        document.querySelector(
            ".radar-line"
        );


    if (!radarLine) {

        return;

    }


    radarCenterAngle =
        centerAngle;


    // Prevent multiple intervals.

    if (
        radarInterval !== null
    ) {

        return;

    }


    radarSweepAngle =
        -15;


    radarSweepDirection =
        1;


    radarInterval =
        setInterval(function () {

            radarSweepAngle +=
                2 *
                radarSweepDirection;


            if (
                radarSweepAngle >= 15
            ) {

                radarSweepDirection =
                    -1;

            }


            if (
                radarSweepAngle <= -15
            ) {

                radarSweepDirection =
                    1;

            }


            const finalAngle =
                radarCenterAngle +
                radarSweepAngle;


            radarLine.style.animation =
                "none";


            radarLine.style.transform =
                `rotate(${finalAngle}deg)`;


        }, 80);

}


// ==========================================
// STOP RADAR
// ==========================================

function stopRadar() {

    const radarLine =
        document.querySelector(
            ".radar-line"
        );


    if (
        radarInterval !== null
    ) {

        clearInterval(
            radarInterval
        );

        radarInterval =
            null;

    }


    if (radarLine) {

        radarLine.style.animation =
            "none";

        radarLine.style.transform =
            "rotate(0deg)";

    }

}


// ==========================================
// CURRENT WAYPOINT
// ==========================================

function updateCurrentWaypoint() {

    const currentElement =
        document.getElementById(
            "currentWaypoint"
        );


    if (!currentElement) {

        return;

    }


    // --------------------------------------
    // NO WAYPOINTS
    // --------------------------------------

    if (totalWaypoints === 0) {

        currentElement.textContent =
            "—";

        return;

    }


    // --------------------------------------
    // ALL REACHED
    // --------------------------------------

    if (
        completedWaypoints >=
        totalWaypoints
    ) {

        currentElement.textContent =
            "—";

        return;

    }


    // --------------------------------------
    // CURRENT WAYPOINT
    // --------------------------------------

    currentElement.textContent =
        `${completedWaypoints + 1}`;

}


// ==========================================
// WAYPOINT DISPLAY
// ==========================================

function updateWaypointDisplay() {

    const list =
        document.getElementById(
            "waypointList"
        );


    if (!list) {

        return;

    }


    // --------------------------------------
    // EMPTY
    // --------------------------------------

    if (
        waypoints.length === 0
    ) {

        list.innerHTML = `
            <div class="empty-state">
                No waypoints selected
            </div>
        `;

        return;

    }


    list.innerHTML = "";


    // --------------------------------------
    // DISPLAY WAYPOINTS
    // --------------------------------------

    waypoints.forEach(
        function (point, index) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "waypoint-item";


            let status =
                "PENDING";


            if (
                index <
                completedWaypoints
            ) {

                status =
                    "REACHED";

            }

            else if (
                index ===
                completedWaypoints
            ) {

                status =
                    "CURRENT";

            }


            item.innerHTML = `

                <span>
                    Point ${index + 1}
                </span>

                <span>
                    (${point.x.toFixed(2)},
                     ${point.y.toFixed(2)})
                </span>

                <strong>
                    ${status}
                </strong>

            `;


            list.appendChild(
                item
            );

        }
    );

}


// ==========================================
// PROGRESS DISPLAY
// ==========================================

function updateProgressDisplay() {

    const progressText =
        document.getElementById(
            "progressText"
        );


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    if (progressText) {

        progressText.textContent =
            `${completedWaypoints} / ${totalWaypoints}`;

    }


    if (progressFill) {

        let percentage =
            0;


        if (
            totalWaypoints > 0
        ) {

            percentage =
                (
                    completedWaypoints /
                    totalWaypoints
                ) * 100;

        }


        progressFill.style.width =
            `${percentage}%`;

    }

}


// ==========================================
// RESET AFTER MISSION
// ==========================================

function resetMissionDashboard() {

    console.log(
        "Resetting dashboard after mission..."
    );


    // --------------------------------------
    // STOP LiDAR MONITORING
    // --------------------------------------

    lidarMonitoring =
        false;


    // --------------------------------------
    // STOP RADAR
    // --------------------------------------

    stopRadar();


    // --------------------------------------
    // FORCE OBSTACLE DISPLAY TO CLEAR
    // --------------------------------------

    updateObstacleStatus(
        false
    );


    // --------------------------------------
    // CLEAR MISSION DATA
    // --------------------------------------

    waypoints = [];

    totalWaypoints = 0;

    completedWaypoints = 0;


    // --------------------------------------
    // MISSION STATUS
    // --------------------------------------

    const missionElement =
        document.getElementById(
            "missionStatus"
        );


    const navigationElement =
        document.getElementById(
            "navigationStatus"
        );


    if (missionElement) {

        missionElement.textContent =
            "READY";

    }


    if (navigationElement) {

        navigationElement.textContent =
            "READY";

    }


    // --------------------------------------
    // DISTANCE
    // --------------------------------------

    const distanceElement =
        document.getElementById(
            "distanceRemaining"
        );


    if (distanceElement) {

        distanceElement.textContent =
            "—";

    }


    // --------------------------------------
    // PROGRESS
    // --------------------------------------

    updateProgressDisplay();


    // --------------------------------------
    // CURRENT WAYPOINT
    // --------------------------------------

    updateCurrentWaypoint();


    // --------------------------------------
    // WAYPOINT LIST
    // --------------------------------------

    updateWaypointDisplay();


    console.log(
        "Dashboard reset - ready for new mission"
    );

}


// ==========================================
// ROBOT STATUS
// ==========================================

function updateRobotStatus(
    state,
    description
) {

    const stateElement =
        document.getElementById(
            "robotState"
        );


    const descriptionElement =
        document.getElementById(
            "robotDescription"
        );


    if (stateElement) {

        stateElement.textContent =
            state;

    }


    if (descriptionElement) {

        descriptionElement.textContent =
            description;

    }

}


// ==========================================
// OBSTACLE STATUS
// ==========================================

function updateObstacleStatus(
    detected
) {

    const badge =
        document.getElementById(
            "obstacleBadge"
        );


    const environment =
        document.getElementById(
            "environmentStatus"
        );


    const replanning =
        document.getElementById(
            "replanningStatus"
        );


    const costmap =
        document.getElementById(
            "costmapStatus"
        );


    if (detected) {

        if (badge) {

            badge.textContent =
                "OBSTACLE DETECTED";

        }


        if (environment) {

            environment.textContent =
                "OBSTACLE";

        }


        if (replanning) {

            replanning.textContent =
                "REPLANNING";

        }


        if (costmap) {

            costmap.textContent =
                "UPDATED";

        }

    }

    else {

        if (badge) {

            badge.textContent =
                "CLEAR";

        }


        if (environment) {

            environment.textContent =
                "CLEAR";

        }


        if (replanning) {

            replanning.textContent =
                "STANDBY";

        }


        if (costmap) {

            costmap.textContent =
                "UPDATED";

        }

    }

}


// ==========================================
// INITIAL STATE
// ==========================================

updateRobotStatus(
    "CONNECTING",
    "Connecting to ROS 2..."
);


updateObstacleStatus(
    false
);


updateWaypointDisplay();

updateProgressDisplay();

updateCurrentWaypoint();