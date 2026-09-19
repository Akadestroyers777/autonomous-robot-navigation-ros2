# Autonomous Robot Navigation and Dynamic Obstacle Avoidance Using ROS 2

## Master Command

Start Ubuntu WSL:

```powershell
wsl -d Ubuntu-22.04

Then run the complete project with:

cd ~/autonomous_robot_ws
./run_project.sh

This automatically starts the complete ROS 2 project including Gazebo, AMCL, Nav2, RViz, rosbridge, dashboard, and the waypoint navigator.

Project Overview

This project implements a fully simulated autonomous robot using ROS 2 Humble and TurtleBot3 Burger.

The robot can:

Navigate autonomously between user-selected points
Use LiDAR for obstacle detection
Localize itself using AMCL
Plan paths using Nav2
Avoid dynamic obstacles
Replan its path when obstacles are detected
Navigate through multiple waypoints
Display the navigation system in RViz
Provide real-time information through a web dashboard

No physical robot hardware is required.

Project Architecture
                         GAZEBO
                            |
                    TurtleBot3 Burger
                            |
                          LiDAR
                          /scan
                            |
                            v
                         AMCL
                            |
                      Localization
                            |
                            v
                          NAV2
                 +----------+----------+
                 |                     |
                 v                     v
          Global Planner        Local Planner
                 |                     |
                 +----------+----------+
                            |
                         Costmaps
                            |
                            v
                   Obstacle Avoidance
                            |
                            v
                      TurtleBot3


RViz Publish Point
        |
        v
Waypoint Navigator
        |
        v
    Nav2 Goals


ROS 2
  |
  v
rosbridge
  |
  v
Web Dashboard
Technologies Used
ROS 2 Humble
Ubuntu 22.04
WSL2
Gazebo
TurtleBot3 Burger
LiDAR
Cartographer
AMCL
Nav2
RViz2
Python
HTML
CSS
JavaScript
rosbridge
Mapping

The environment was mapped using Cartographer.

The saved map is:

maps/
├── turtlebot3_map.pgm
└── turtlebot3_map.yaml

Map details:

Resolution: 0.05 m/pixel
Map size: 124 × 120 pixels
Approximate environment size: 6.2 × 6.0 m
Origin: [-1.2, -2.61, 0]
Localization

AMCL is used to localize the TurtleBot3 on the saved map.

Saved Map
    +
LiDAR
    +
Odometry
    |
    v
   AMCL
    |
    v
Robot Pose
Navigation

Nav2 handles autonomous navigation.

It provides:

Global planning
Local planning
Global costmap
Local costmap
Obstacle avoidance
Path replanning

The custom waypoint navigator sends goals to Nav2.

Nav2 is responsible for deciding how the robot travels to the goal and avoids obstacles.

Interactive Waypoints

Waypoints are selected directly in RViz using Publish Point.

The selected points are received through:

/clicked_point

Workflow:

RViz
  |
Publish Point
  |
/clicked_point
  |
Waypoint Navigator
  |
Select Multiple Waypoints
  |
Press ENTER
  |
Nav2
  |
Waypoint 1
  |
Waypoint 2
  |
Waypoint 3
  |
...
  |
MISSION COMPLETE

The robot visits the selected waypoints sequentially.

Dynamic Obstacle Avoidance

A dynamic obstacle is introduced into Gazebo to test obstacle avoidance.

Obstacle size:

0.5 × 0.5 × 0.5 m

Obstacle avoidance pipeline:

Dynamic Obstacle
       |
       v
     LiDAR
       |
       v
    /scan
       |
       v
   Costmap
       |
       v
 Local Planner
       |
       v
  Replanning
       |
       v
Robot avoids obstacle

The robot successfully detects obstacles using LiDAR and Nav2 updates the navigation behavior using the costmaps.

ROS 2 Topics

Important topics:

/scan
/odom
/tf
/tf_static
/cmd_vel
/clicked_point
/mission_status
/mission_progress
/mission_distance
/scan

Simulated LiDAR data.

/clicked_point

Waypoints selected from RViz.

/mission_status

Current mission state.

Possible states:

READY
NAVIGATING
COMPLETE
CANCELED
FAILED
/mission_progress

Number of completed waypoints.

/mission_distance

Distance remaining to the current waypoint.

RViz

RViz is used to visualize:

Saved map
Robot
LiDAR
AMCL particles
Global costmap
Local costmap
Global path
Local path
Robot pose
Selected waypoints

RViz is also used to select navigation waypoints using Publish Point.

Web Dashboard

The dashboard is located in:

dashboard/
├── index.html
├── style.css
└── script.js

It communicates with ROS 2 through rosbridge.

ROS 2
  |
rosbridge
  |
WebSocket
  |
Dashboard

WebSocket:

ws://localhost:9090

The dashboard displays:

ROS system status
Robot status
Navigation status
Localization status
Planner status
LiDAR status
Mission status
Mission progress
Current waypoint
Distance remaining
Selected waypoints
Obstacle detection
Replanning status
Radar visualization
Project Structure
autonomous_robot_ws/
│
├── dashboard/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── maps/
│   ├── turtlebot3_map.pgm
│   └── turtlebot3_map.yaml
│
├── src/
│   └── autonomous_robot/
│       ├── autonomous_robot/
│       │   ├── __init__.py
│       │   ├── setup.py
│       │   └── waypoint_navigator.py
│       │
│       ├── resource/
│       │   └── autonomous_robot
│       │
│       ├── test/
│       │   ├── test_flake8.py
│       │   ├── test_pep257.py
│       │   └── test_copyright.py
│       │
│       ├── package.xml
│       ├── setup.cfg
│       └── setup.py
│
├── .gitignore
├── README.md
└── run_project.sh
Manual Execution

If the automated launcher is not used, the components can be started manually.

1. Gazebo
source /opt/ros/humble/setup.bash
export TURTLEBOT3_MODEL=burger

ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py
2. AMCL
source /opt/ros/humble/setup.bash
source ~/autonomous_robot_ws/install/setup.bash

ros2 launch nav2_bringup localization_launch.py \
map:=/home/saishrinivas07/autonomous_robot_ws/maps/turtlebot3_map.yaml \
use_sim_time:=True
3. Nav2
source /opt/ros/humble/setup.bash
source ~/autonomous_robot_ws/install/setup.bash

ros2 launch nav2_bringup navigation_launch.py \
map:=/home/saishrinivas07/autonomous_robot_ws/maps/turtlebot3_map.yaml \
use_sim_time:=True
4. RViz
source /opt/ros/humble/setup.bash

ros2 run rviz2 rviz2 \
-d /opt/ros/humble/share/nav2_bringup/rviz/nav2_default_view.rviz \
--ros-args -p use_sim_time:=true
5. rosbridge
source /opt/ros/humble/setup.bash

ros2 launch rosbridge_server rosbridge_websocket_launch.xml
6. Waypoint Navigator
cd ~/autonomous_robot_ws
source /opt/ros/humble/setup.bash
source install/setup.bash

ros2 run autonomous_robot waypoint_navigator
Build

If the workspace needs to be rebuilt:

cd ~/autonomous_robot_ws
colcon build --symlink-install
source install/setup.bash

Verify the package:

ros2 pkg executables autonomous_robot

Expected:

autonomous_robot waypoint_navigator
Dynamic Obstacle Test

A temporary obstacle can be spawned in Gazebo using:

ros2 run gazebo_ros spawn_entity.py \
  -entity dynamic_obstacle \
  -file /tmp/obstacle.sdf \
  -x 2.5 -y 0.5 -z 0.25

The robot can then be given a waypoint that requires navigating around the obstacle.

Important Coordinate Frames
map
 |
 v
odom
 |
 v
base_footprint
 |
 v
base_link

These TF frames allow ROS 2 to understand the relationship between the map, robot, odometry, and robot body.

Complete Working Flow
Gazebo
   |
TurtleBot3 Burger
   |
LiDAR
   |
AMCL
   |
Localization
   |
Nav2
   |
Global + Local Planning
   |
Costmaps
   |
Obstacle Avoidance
   |
Robot Movement

Waypoint control:

RViz
   |
/clicked_point
   |
Waypoint Navigator
   |
Nav2 Goal
   |
Robot Navigation

Dashboard:

ROS 2
   |
rosbridge
   |
WebSocket
   |
Web Dashboard
Project Status

The project has been successfully implemented and tested with:

ROS 2 Humble
Gazebo
TurtleBot3 Burger
LiDAR
Cartographer mapping
Saved map
AMCL localization
Nav2
Global and local planning
Costmaps
RViz
Interactive waypoints
Custom waypoint navigator
Multi-waypoint navigation
Mission progress
Distance tracking
Dynamic obstacle avoidance
Nav2 replanning
ROS 2 mission topics
rosbridge
Web dashboard
LiDAR obstacle detection
Dashboard radar
Automated project launcher
Author

Sai Shrinivas N

Project

Autonomous Robot Navigation and Dynamic Obstacle Avoidance Using ROS 2
