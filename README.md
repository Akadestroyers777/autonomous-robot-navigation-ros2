# Autonomous Robot Navigation and Dynamic Obstacle Avoidance Using ROS 2

A fully simulated autonomous mobile robot system built using **ROS 2 Humble, TurtleBot3 Burger, Gazebo, Nav2, AMCL, Cartographer, RViz2, rosbridge, and a custom web dashboard**.

The system allows a simulated robot to navigate between user-selected waypoints, detect obstacles using LiDAR, dynamically replan its path, and provide real-time navigation information through a web dashboard.

---

# Master Command

Start WSL Ubuntu:

```bash
wsl -d Ubuntu-22.04

Then run the complete project:

cd ~/autonomous_robot_ws
./run_project.sh

The automated launcher starts the complete ROS 2 system including:

Gazebo
TurtleBot3 Burger
AMCL
Nav2
RViz2
rosbridge
Web Dashboard
Custom Waypoint Navigator
Project Overview

This project implements a complete autonomous robot navigation system using ROS 2 Humble and TurtleBot3 Burger in a simulated environment.

The robot can:

Navigate autonomously between user-selected points
Use LiDAR for obstacle detection
Localize itself using AMCL
Use a saved map for navigation
Plan paths using Nav2
Use global and local planners
Use global and local costmaps
Detect dynamic obstacles
Avoid obstacles
Replan its path when obstacles are detected
Navigate through multiple waypoints sequentially
Display the navigation system in RViz2
Track mission progress
Track distance to the current waypoint
Publish mission information through ROS 2 topics
Provide real-time information through a web dashboard
Visualize LiDAR obstacle information using a dashboard radar
Start the complete system automatically using a launcher script

No physical robot hardware is required.

Project Objective

The main objective of this project is to create a simulated autonomous robot that can travel from a selected starting position to one or more destination points while detecting and avoiding obstacles.

The system demonstrates:

Robot simulation
Environment mapping
Robot localization
Autonomous navigation
Obstacle detection
Dynamic obstacle avoidance
Path replanning
Multi-waypoint navigation
Mission monitoring
Web-based visualization
Project Architecture
                         GAZEBO
                            |
                            v
                   TurtleBot3 Burger
                            |
                            v
                         LiDAR
                            |
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
                            v
                         Costmaps
                 +----------+----------+
                 |                     |
                 v                     v
          Global Costmap        Local Costmap
                 |                     |
                 +----------+----------+
                            |
                            v
                   Obstacle Avoidance
                            |
                            v
                        Replanning
                            |
                            v
                      TurtleBot3
Waypoint Navigation Architecture
RViz2
   |
   | Publish Point
   v
/clicked_point
   |
   v
Custom Waypoint Navigator
   |
   | Select Multiple Waypoints
   |
   | Press ENTER
   v
Nav2 Goals
   |
   +----> Waypoint 1
   |
   +----> Waypoint 2
   |
   +----> Waypoint 3
   |
   +----> Waypoint ...
   |
   v
MISSION COMPLETE
Web Dashboard Architecture
ROS 2
  |
  v
ROS 2 Topics
  |
  v
rosbridge
  |
  v
WebSocket
  |
  v
Web Dashboard

The dashboard receives real-time ROS 2 information through rosbridge.

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
WebSocket
Environment

The project was developed and tested using:

Operating System : Windows 11
Linux Environment: Ubuntu 22.04
Virtualization   : WSL2
ROS Version      : ROS 2 Humble
Robot            : TurtleBot3 Burger
Simulator        : Gazebo

The ROS 2 environment is loaded using:

source /opt/ros/humble/setup.bash

The TurtleBot3 model used by the project is:

export TURTLEBOT3_MODEL=burger
Mapping

The environment was mapped using Cartographer.

The saved map is included inside the project:

maps/
├── turtlebot3_map.pgm
└── turtlebot3_map.yaml
Map Details
Resolution:              0.05 m/pixel
Map Size:                124 × 120 pixels
Approximate Environment: 6.2 × 6.0 m
Origin:                  [-1.2, -2.61, 0]

The map YAML file contains:

image: turtlebot3_map.pgm
mode: trinary
resolution: 0.05
origin: [-1.2, -2.61, 0]
negate: 0
occupied_thresh: 0.65
free_thresh: 0.25
Mapping Process

Cartographer receives sensor and odometry information from the simulated robot and builds the environment map.

The mapping flow is:

Gazebo
   |
   v
TurtleBot3
   |
   +----> LiDAR
   |
   +----> Odometry
   |
   v
Cartographer
   |
   v
Occupancy Map
   |
   v
Saved Map

The saved map is later used by AMCL and Nav2.

Localization

The robot uses AMCL (Adaptive Monte Carlo Localization) to determine its position inside the saved map.

The localization pipeline is:

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

AMCL provides the robot's estimated position and orientation relative to the map.

Navigation

The project uses Nav2 for autonomous navigation.

Nav2 provides:

Global planning
Local planning
Global costmap
Local costmap
Obstacle avoidance
Path replanning
Navigation goal execution

The custom waypoint navigator sends navigation goals to Nav2.

Nav2 then calculates and executes the navigation path while considering obstacles detected by the robot sensors.

Nav2 Navigation Pipeline
Navigation Goal
       |
       v
Global Planner
       |
       v
Global Path
       |
       v
Local Planner
       |
       v
Local Costmap
       |
       v
Velocity Commands
       |
       v
TurtleBot3

When an obstacle is detected, the costmap is updated and Nav2 can generate a new local path.

Global Planner

The global planner calculates a path from the robot's current position to the navigation goal using the global map and global costmap.

Robot Position
      |
      v
Global Costmap
      |
      v
Global Planner
      |
      v
Global Path
      |
      v
Navigation Goal
Local Planner

The local planner controls the robot's movement while considering nearby obstacles.

Robot
  |
  v
LiDAR
  |
  v
Local Costmap
  |
  v
Local Planner
  |
  v
Safe Local Path
  |
  v
Robot Movement
Costmaps

The navigation system uses two major costmaps.

Global Costmap

The global costmap represents the larger navigation environment.

It is used primarily for global path planning.

Map
 |
 v
Global Costmap
 |
 v
Global Planner
 |
 v
Global Path
Local Costmap

The local costmap represents the nearby environment around the robot.

It is updated using sensor information such as LiDAR.

LiDAR
 |
 v
Local Costmap
 |
 v
Local Planner
 |
 v
Obstacle Avoidance
Interactive Waypoints

Waypoints are selected directly in RViz2 using the Publish Point tool.

The selected coordinates are received through:

/clicked_point

The workflow is:

RViz2
  |
  v
Publish Point
  |
  v
/clicked_point
  |
  v
Waypoint Navigator
  |
  v
Store Waypoints
  |
  v
Press ENTER
  |
  v
Send Goals to Nav2
  |
  v
Waypoint 1
  |
  v
Waypoint 2
  |
  v
Waypoint 3
  |
  v
...
  |
  v
MISSION COMPLETE

The robot visits each selected waypoint sequentially.

Custom Waypoint Navigator

The project contains a custom Python ROS 2 node:

src/autonomous_robot/autonomous_robot/waypoint_navigator.py

The waypoint navigator is responsible for:

Receiving RViz waypoints
Storing multiple waypoints
Waiting for user confirmation
Sending goals to Nav2
Navigating sequentially
Tracking completed waypoints
Tracking distance remaining
Publishing mission status
Handling successful navigation
Handling cancellation
Handling navigation failures
Mission States

The waypoint navigator publishes the following mission states:

READY
NAVIGATING
COMPLETE
CANCELED
FAILED
READY

The navigator is waiting for waypoint selection.

NAVIGATING

The robot is currently navigating through the selected waypoints.

COMPLETE

All selected waypoints have been successfully reached.

CANCELED

The current navigation mission was canceled.

FAILED

A navigation goal could not be successfully completed.

Multi-Waypoint Navigation

The system supports sequential navigation through multiple waypoints.

For example:

Point A
   |
   v
Point B
   |
   v
Point C
   |
   v
Point D

The robot does not need a separate navigation command for every point.

The waypoint navigator sends each goal to Nav2 sequentially.

Mission Progress

The system tracks the number of completed waypoints.

Example:

Waypoint 1 / 4
Waypoint 2 / 4
Waypoint 3 / 4
Waypoint 4 / 4
MISSION COMPLETE

Mission progress is published through:

/mission_progress
Distance Tracking

The system also tracks the remaining distance to the current waypoint.

The distance is published through:

/mission_distance

This information is displayed on the web dashboard.

Dynamic Obstacle Avoidance

A dynamic obstacle is introduced into Gazebo to test obstacle avoidance and navigation replanning.

Obstacle dimensions:

0.5 × 0.5 × 0.5 m

The obstacle is detected using simulated LiDAR.

The obstacle avoidance pipeline is:

Dynamic Obstacle
       |
       v
     LiDAR
       |
       v
     /scan
       |
       v
   Costmap Update
       |
       v
  Local Planner
       |
       v
   Replanning
       |
       v
Obstacle Avoidance
       |
       v
Robot continues to Goal

The robot was successfully tested navigating around a dynamically introduced obstacle.

Dynamic Obstacle Test

A temporary obstacle can be spawned in Gazebo using:

ros2 run gazebo_ros spawn_entity.py \
  -entity dynamic_obstacle \
  -file /tmp/obstacle.sdf \
  -x 2.5 -y 0.5 -z 0.25

The robot can then be given a waypoint that requires navigation around the obstacle.

The obstacle interacts with the navigation system through the LiDAR and costmaps.

LiDAR

The TurtleBot3 Burger uses a simulated LiDAR sensor.

The main LiDAR topic is:

/scan

LiDAR is used for:

Obstacle detection
Local costmap updates
Dynamic obstacle detection
Local navigation
Obstacle avoidance
Dashboard radar visualization
Obstacle Detection

The dashboard monitors the LiDAR data from:

/scan

The dashboard focuses on the forward LiDAR region for obstacle monitoring.

The system detects nearby obstacles and displays their direction and approximate distance in the dashboard radar.

ROS 2 Topics

Important ROS 2 topics used by the project are:

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

Provides simulated LiDAR data.

Used for:

Obstacle detection
Local costmap updates
Dynamic obstacle detection
Navigation
/odom

Provides robot odometry information.

Used by the navigation and localization system to track robot movement.

/tf

Provides dynamic coordinate frame transformations.

Used to maintain relationships between robot and navigation frames.

/tf_static

Provides static coordinate frame transformations.

/cmd_vel

Used to send velocity commands to the robot.

The navigation system ultimately generates movement commands for the TurtleBot3 through this interface.

/clicked_point

Receives points selected using RViz2's Publish Point tool.

These points are interpreted as navigation waypoints by the custom waypoint navigator.

/mission_status

Publishes the current mission state.

Possible states:

READY
NAVIGATING
COMPLETE
CANCELED
FAILED
/mission_progress

Publishes the number of completed waypoints.

Example:

1 / 4
2 / 4
3 / 4
4 / 4
/mission_distance

Publishes the remaining distance to the current navigation waypoint.

RViz2

RViz2 is used to visualize the complete navigation system.

RViz2 can display:

Saved map
Robot
LiDAR
AMCL particles
Robot pose
Global costmap
Local costmap
Global path
Local path
Selected points
Navigation information

RViz2 is also used to select navigation waypoints using Publish Point.

Coordinate Frames

The main TF relationship used by the navigation system is:

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

These coordinate frames allow ROS 2 to understand the relationship between:

Global map
Robot odometry
Robot footprint
Robot body
Web Dashboard

The project contains a real-time web dashboard.

Dashboard files:

dashboard/
├── index.html
├── style.css
└── script.js

The dashboard communicates with ROS 2 using rosbridge.

rosbridge

rosbridge provides a bridge between ROS 2 and web applications.

The communication architecture is:

ROS 2
  |
  v
ROS Topics
  |
  v
rosbridge
  |
  v
WebSocket
  |
  v
JavaScript
  |
  v
Web Dashboard

The WebSocket connection is:

ws://localhost:9090

rosbridge is launched using:

ros2 launch rosbridge_server rosbridge_websocket_launch.xml
Web Dashboard Features

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
Environment status
Costmap status
Replanning status
LiDAR radar visualization
Dashboard Mission Flow
RViz2
  |
  v
Waypoint Selection
  |
  v
ROS 2
  |
  v
Waypoint Navigator
  |
  v
Mission Topics
  |
  +------------------+
  |                  |
  v                  v
/mission_status   /mission_progress
  |                  |
  +--------+---------+
           |
           v
       rosbridge
           |
           v
      Web Dashboard
Dashboard Radar

The dashboard includes a LiDAR-based radar visualization.

The radar displays:

Detected obstacle direction
Approximate obstacle distance
Forward obstacle information
Dynamic obstacle activity

The radar is connected to the simulated LiDAR data received from:

/scan
Project Launcher

The project contains an automated launcher:

run_project.sh

The launcher initializes the project components in the required sequence.

The overall startup flow is:

ROS 2 Environment
       |
       v
Gazebo
       |
       v
TurtleBot3 Burger
       |
       v
AMCL
       |
       v
Nav2
       |
       v
RViz2
       |
       v
rosbridge
       |
       v
Web Dashboard
       |
       v
Waypoint Navigator

The launcher also manages runtime logs and project processes.

Manual Execution

If the automated launcher is not used, the project components can be started manually.

1. Start Gazebo
source /opt/ros/humble/setup.bash
export TURTLEBOT3_MODEL=burger

ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py
2. Start AMCL
source /opt/ros/humble/setup.bash
source ~/autonomous_robot_ws/install/setup.bash

ros2 launch nav2_bringup localization_launch.py \
map:=/home/saishrinivas07/autonomous_robot_ws/maps/turtlebot3_map.yaml \
use_sim_time:=True
3. Start Nav2
source /opt/ros/humble/setup.bash
source ~/autonomous_robot_ws/install/setup.bash

ros2 launch nav2_bringup navigation_launch.py \
map:=/home/saishrinivas07/autonomous_robot_ws/maps/turtlebot3_map.yaml \
use_sim_time:=True
4. Start RViz2
source /opt/ros/humble/setup.bash

ros2 run rviz2 rviz2 \
-d /opt/ros/humble/share/nav2_bringup/rviz/nav2_default_view.rviz \
--ros-args -p use_sim_time:=true
5. Start rosbridge
source /opt/ros/humble/setup.bash

ros2 launch rosbridge_server rosbridge_websocket_launch.xml
6. Start Waypoint Navigator
cd ~/autonomous_robot_ws

source /opt/ros/humble/setup.bash
source install/setup.bash

ros2 run autonomous_robot waypoint_navigator
Building the Workspace

If the workspace needs to be rebuilt:

cd ~/autonomous_robot_ws

colcon build --symlink-install

source install/setup.bash

Verify the custom package:

ros2 pkg executables autonomous_robot

Expected output:

autonomous_robot waypoint_navigator
Workspace

The ROS 2 workspace is located at:

~/autonomous_robot_ws

The workspace contains the ROS 2 package, map files, dashboard, launcher, and documentation.

ROS 2 Package

Package name:

autonomous_robot

The main custom node is:

waypoint_navigator

The executable can be started using:

ros2 run autonomous_robot waypoint_navigator
Package Structure
src/
└── autonomous_robot/
    │
    ├── autonomous_robot/
    │   ├── __init__.py
    │   ├── setup.py
    │   └── waypoint_navigator.py
    │
    ├── resource/
    │   └── autonomous_robot
    │
    ├── test/
    │   ├── test_flake8.py
    │   ├── test_pep257.py
    │   └── test_copyright.py
    │
    ├── package.xml
    ├── setup.cfg
    └── setup.py
Complete Navigation Flow
                    GAZEBO
                       |
                       v
                TurtleBot3 Burger
                       |
                       v
                     LiDAR
                       |
                       v
                    /scan
                       |
                       v
                     AMCL
                       |
                       v
                 Robot Localization
                       |
                       v
                     Nav2
                       |
              +--------+--------+
              |                 |
              v                 v
       Global Planner     Local Planner
              |                 |
              v                 v
       Global Costmap     Local Costmap
              |                 |
              +--------+--------+
                       |
                       v
              Obstacle Avoidance
                       |
                       v
                  Replanning
                       |
                       v
                 Robot Movement
Complete Waypoint Flow
RViz2
   |
   v
Publish Point
   |
   v
/clicked_point
   |
   v
Waypoint Navigator
   |
   v
Multiple Waypoints
   |
   v
Press ENTER
   |
   v
Nav2 Goals
   |
   v
Sequential Navigation
   |
   v
Mission Progress
   |
   v
MISSION COMPLETE
Complete Obstacle Avoidance Flow
Dynamic Obstacle
       |
       v
      LiDAR
       |
       v
     /scan
       |
       v
  Obstacle Detection
       |
       v
  Local Costmap Update
       |
       v
   Local Planner
       |
       v
     Replanning
       |
       v
  New Navigation Path
       |
       v
  Robot Avoids Obstacle
Complete Dashboard Flow
                  ROS 2
                    |
        +-----------+-----------+
        |           |           |
        v           v           v
      /scan     /mission_*    /clicked_point
        |           |           |
        +-----------+-----------+
                    |
                    v
                rosbridge
                    |
                    v
                WebSocket
                    |
                    v
              JavaScript
                    |
                    v
             Web Dashboard
GitHub Repository

The project is available on GitHub:

https://github.com/Akadestroyers777/autonomous-robot-navigation-ros2

Repository contains:

README.md
run_project.sh
dashboard/
maps/
src/
.gitignore
Git Workflow

After making changes to the project:

cd ~/autonomous_robot_ws

Check the changes:

git status

Stage the changes:

git add .

Commit the changes:

git commit -m "Describe your changes"

Push to GitHub:

git push

The repository uses SSH authentication.

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
│       │
│       ├── autonomous_robot/
│       │   ├── __init__.py
│       │   ├── setup.py
│       │   └── waypoint_navigator.py
│       │
│       ├── resource/
│       │   └── autonomous_robot
│       │
│       ├── test/
│       │   ├── test_copyright.py
│       │   ├── test_flake8.py
│       │   └── test_pep257.py
│       │
│       ├── package.xml
│       ├── setup.cfg
│       └── setup.py
│
├── .gitignore
├── README.md
└── run_project.sh
Important ROS 2 Components
Component	Role
Gazebo	Simulates the robot and environment
TurtleBot3 Burger	Simulated autonomous robot
LiDAR	Detects surrounding obstacles
Cartographer	Creates the environment map
AMCL	Localizes the robot on the saved map
Nav2	Performs autonomous navigation
Global Planner	Calculates the global navigation path
Local Planner	Handles local movement and obstacle avoidance
Global Costmap	Represents the global navigation environment
Local Costmap	Represents nearby obstacles
RViz2	Visualizes ROS 2 navigation data
Waypoint Navigator	Handles user-selected navigation points
rosbridge	Connects ROS 2 with the web dashboard
Web Dashboard	Displays real-time robot and mission information
Project Status

The project has been successfully implemented and tested with:

ROS 2 Humble
Ubuntu 22.04
WSL2
Gazebo
TurtleBot3 Burger
LiDAR
Cartographer Mapping
Saved Map
AMCL Localization
Nav2
Global Planning
Local Planning
Global Costmap
Local Costmap
Obstacle Avoidance
Dynamic Obstacle Detection
Nav2 Replanning
RViz2
Interactive Waypoints
Custom Waypoint Navigator
Multi-Waypoint Navigation
Mission Progress
Distance Tracking
ROS 2 Mission Topics
rosbridge
Web Dashboard
LiDAR Obstacle Detection
Dashboard Radar
Automated Project Launcher
GitHub Repository

The complete system operates entirely in simulation and does not require physical robot hardware.

Final System
                         AUTONOMOUS ROBOT
                                |
             +------------------+------------------+
             |                  |                  |
             v                  v                  v
           Gazebo             RViz2            Dashboard
             |                  |                  |
             v                  v                  v
        TurtleBot3        Waypoint Input       rosbridge
             |                  |                  |
             v                  v                  v
           LiDAR         /clicked_point       WebSocket
             |                  |                  |
             v                  v                  v
           /scan        Waypoint Navigator   JavaScript
             |                  |                  |
             v                  v                  v
          Costmaps ---------> Nav2 <-------- Mission Topics
                                |
                                v
                       Global + Local Planning
                                |
                                v
                         Obstacle Avoidance
                                |
                                v
                            Replanning
                                |
                                v
                       Autonomous Navigation
Author

Sai Shrinivas N

Vellore Institute of Technology

Project

Autonomous Robot Navigation and Dynamic Obstacle Avoidance Using ROS 2
