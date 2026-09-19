# Autonomous Robot Navigation and Dynamic Obstacle Avoidance Using ROS 2

A fully simulated autonomous robot navigation system built using **ROS 2 Humble, TurtleBot3 Burger, Gazebo, Cartographer, AMCL, Nav2, RViz2, rosbridge, and a custom web dashboard**.

The robot can navigate through user-selected waypoints, use LiDAR to detect obstacles, avoid dynamic obstacles, replan its path using Nav2, and display real-time navigation information through a web dashboard.

The entire project runs in simulation using **WSL2 and Ubuntu 22.04**, so no physical robot hardware is required.

---

# Master Command

The complete project can be started automatically using the project launcher.

Start WSL Ubuntu:

```bash
wsl -d Ubuntu-22.04
```

Then run:

```bash
cd ~/autonomous_robot_ws
./run_project.sh
```

The automated launcher starts:

- Gazebo
- TurtleBot3 Burger
- AMCL
- Nav2
- RViz2
- rosbridge
- Web Dashboard
- Custom Waypoint Navigator

---

# Manual Step-by-Step Execution

If the automated launcher is not used, the complete system can be started manually.

The components should be started in the following order.

---

## Step 1 — Start Gazebo

Open a terminal and start Ubuntu:

```bash
wsl -d Ubuntu-22.04
```

Source ROS 2:

```bash
source /opt/ros/humble/setup.bash
```

Set the TurtleBot3 model:

```bash
export TURTLEBOT3_MODEL=burger
```

Start the TurtleBot3 Gazebo world:

```bash
ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py
```

Gazebo starts the simulated environment and TurtleBot3 Burger.

---

## Step 2 — Start AMCL

Open a new WSL terminal:

```bash
wsl -d Ubuntu-22.04
```

Source ROS 2 and the workspace:

```bash
source /opt/ros/humble/setup.bash
source ~/autonomous_robot_ws/install/setup.bash
```

Start AMCL using the saved map:

```bash
ros2 launch nav2_bringup localization_launch.py \
map:=/home/saishrinivas07/autonomous_robot_ws/maps/turtlebot3_map.yaml \
use_sim_time:=True
```

AMCL localizes the robot on the saved map.

---

## Step 3 — Start Nav2

Open another WSL terminal:

```bash
wsl -d Ubuntu-22.04
```

Source ROS 2 and the workspace:

```bash
source /opt/ros/humble/setup.bash
source ~/autonomous_robot_ws/install/setup.bash
```

Start Nav2:

```bash
ros2 launch nav2_bringup navigation_launch.py \
map:=/home/saishrinivas07/autonomous_robot_ws/maps/turtlebot3_map.yaml \
use_sim_time:=True
```

Nav2 provides:

- Global planning
- Local planning
- Global costmap
- Local costmap
- Obstacle avoidance
- Path replanning

---

## Step 4 — Start RViz2

Open another WSL terminal:

```bash
wsl -d Ubuntu-22.04
```

Source ROS 2:

```bash
source /opt/ros/humble/setup.bash
```

Start RViz2:

```bash
ros2 run rviz2 rviz2 \
-d /opt/ros/humble/share/nav2_bringup/rviz/nav2_default_view.rviz \
--ros-args -p use_sim_time:=true
```

RViz2 is used to visualize:

- Map
- Robot
- LiDAR
- AMCL particles
- Global costmap
- Local costmap
- Global path
- Local path
- Robot pose
- Navigation information
- Selected waypoints

RViz2 is also used to select navigation points using **Publish Point**.

---

## Step 5 — Start rosbridge

Open another WSL terminal:

```bash
wsl -d Ubuntu-22.04
```

Source ROS 2:

```bash
source /opt/ros/humble/setup.bash
```

Start rosbridge:

```bash
ros2 launch rosbridge_server rosbridge_websocket_launch.xml
```

rosbridge provides the connection between ROS 2 and the web dashboard.

The WebSocket runs at:

```text
ws://localhost:9090
```

---

## Step 6 — Start the Waypoint Navigator

Open another WSL terminal:

```bash
wsl -d Ubuntu-22.04
```

Go to the workspace:

```bash
cd ~/autonomous_robot_ws
```

Source ROS 2:

```bash
source /opt/ros/humble/setup.bash
```

Source the workspace:

```bash
source install/setup.bash
```

Start the custom waypoint navigator:

```bash
ros2 run autonomous_robot waypoint_navigator
```

The waypoint navigator receives points selected in RViz2 through:

```text
/clicked_point
```

Select multiple points using **Publish Point** in RViz2.

After selecting the required points, press **ENTER** in the waypoint navigator terminal.

The robot will navigate through the selected points sequentially.

---

# Project Overview

This project implements a complete autonomous robot navigation system using **ROS 2 Humble** and **TurtleBot3 Burger**.

The robot can:

- Navigate autonomously between user-selected points
- Use LiDAR for obstacle detection
- Localize itself using AMCL
- Use a saved map for navigation
- Plan paths using Nav2
- Use global and local planners
- Use global and local costmaps
- Detect dynamic obstacles
- Avoid obstacles
- Replan its path when obstacles are detected
- Navigate through multiple waypoints sequentially
- Display the navigation system in RViz2
- Track mission progress
- Track distance to the current waypoint
- Publish mission information through ROS 2 topics
- Provide real-time information through a web dashboard
- Visualize LiDAR obstacle information using a dashboard radar
- Start the complete system automatically using a launcher script

---

# Project Objective

The main objective is to create a simulated autonomous robot that can travel from a selected starting position to one or more destination points while detecting and avoiding obstacles.

The system demonstrates:

1. Robot simulation
2. Environment mapping
3. Robot localization
4. Autonomous navigation
5. Obstacle detection
6. Dynamic obstacle avoidance
7. Path replanning
8. Multi-waypoint navigation
9. Mission monitoring
10. Web-based visualization

---

# Project Architecture

```text
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
```

---

# Waypoint Navigation Architecture

```text
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
```

---

# Web Dashboard Architecture

```text
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
```

---

# Technologies Used

- ROS 2 Humble
- Ubuntu 22.04
- WSL2
- Gazebo
- TurtleBot3 Burger
- LiDAR
- Cartographer
- AMCL
- Nav2
- RViz2
- Python
- HTML
- CSS
- JavaScript
- rosbridge
- WebSocket

---

# Mapping

The environment was mapped using **Cartographer**.

The saved map is included in the project:

```text
maps/
├── turtlebot3_map.pgm
└── turtlebot3_map.yaml
```

## Map Details

- **Resolution:** 0.05 m/pixel
- **Map Size:** 124 × 120 pixels
- **Approximate Environment Size:** 6.2 × 6.0 m
- **Origin:** `[-1.2, -2.61, 0]`

The map YAML file contains:

```yaml
image: turtlebot3_map.pgm
mode: trinary
resolution: 0.05
origin: [-1.2, -2.61, 0]
negate: 0
occupied_thresh: 0.65
free_thresh: 0.25
```

---

# Mapping Process

The mapping pipeline is:

```text
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
```

The saved map is later used by AMCL and Nav2.

---

# Localization

The robot uses **AMCL (Adaptive Monte Carlo Localization)** to determine its position inside the saved map.

```text
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
```

AMCL provides the robot's estimated position and orientation relative to the map.

---

# Navigation

The project uses **Nav2** for autonomous navigation.

Nav2 provides:

- Global planning
- Local planning
- Global costmap
- Local costmap
- Obstacle avoidance
- Path replanning
- Navigation goal execution

The custom waypoint navigator sends navigation goals to Nav2.

---

# Nav2 Navigation Pipeline

```text
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
```

---

# Global Planner

The global planner calculates a path from the robot's current position to the navigation goal using the global map and global costmap.

```text
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
```

---

# Local Planner

The local planner controls the robot's movement while considering nearby obstacles.

```text
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
```

---

# Costmaps

The navigation system uses two major costmaps.

## Global Costmap

The global costmap represents the larger navigation environment and is used primarily for global path planning.

```text
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
```

## Local Costmap

The local costmap represents the nearby environment around the robot and is updated using sensor information such as LiDAR.

```text
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
```

---

# Interactive Waypoints

Waypoints are selected directly in RViz2 using the **Publish Point** tool.

The selected coordinates are received through:

```text
/clicked_point
```

Workflow:

```text
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
MISSION COMPLETE
```

---

# Custom Waypoint Navigator

The custom Python node is located at:

```text
src/autonomous_robot/autonomous_robot/waypoint_navigator.py
```

It is responsible for:

- Receiving RViz waypoints
- Storing multiple waypoints
- Waiting for user confirmation
- Sending goals to Nav2
- Navigating sequentially
- Tracking completed waypoints
- Tracking distance remaining
- Publishing mission status
- Handling successful navigation
- Handling cancellation
- Handling navigation failures

---

# Mission States

The waypoint navigator uses the following states:

```text
READY
NAVIGATING
COMPLETE
CANCELED
FAILED
```

### READY

Waiting for waypoint selection.

### NAVIGATING

The robot is navigating through the selected waypoints.

### COMPLETE

All selected waypoints have been reached.

### CANCELED

The current navigation mission has been canceled.

### FAILED

A navigation goal could not be completed successfully.

---

# Multi-Waypoint Navigation

The system supports sequential navigation through multiple waypoints.

Example:

```text
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
```

The waypoint navigator sends each goal to Nav2 sequentially.

---

# Mission Progress

The system tracks completed waypoints.

Example:

```text
Waypoint 1 / 4
Waypoint 2 / 4
Waypoint 3 / 4
Waypoint 4 / 4
MISSION COMPLETE
```

Published through:

```text
/mission_progress
```

---

# Distance Tracking

The system tracks the remaining distance to the current waypoint.

Published through:

```text
/mission_distance
```

This information is also displayed on the web dashboard.

---

# Dynamic Obstacle Avoidance

A dynamic obstacle is introduced into Gazebo to test obstacle avoidance and path replanning.

Obstacle dimensions:

```text
0.5 × 0.5 × 0.5 m
```

The obstacle is detected using simulated LiDAR.

```text
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
```

The robot was successfully tested navigating around a dynamically introduced obstacle.

---

# Dynamic Obstacle Test

A temporary obstacle can be spawned in Gazebo using:

```bash
ros2 run gazebo_ros spawn_entity.py \
  -entity dynamic_obstacle \
  -file /tmp/obstacle.sdf \
  -x 2.5 -y 0.5 -z 0.25
```

The robot can then be given a waypoint that requires navigation around the obstacle.

---

# LiDAR

The TurtleBot3 Burger uses a simulated LiDAR sensor.

Main topic:

```text
/scan
```

LiDAR is used for:

- Obstacle detection
- Local costmap updates
- Dynamic obstacle detection
- Local navigation
- Obstacle avoidance
- Dashboard radar visualization

---

# ROS 2 Topics

Important ROS 2 topics used by the project are:

```text
/scan
/odom
/tf
/tf_static
/cmd_vel
/clicked_point
/mission_status
/mission_progress
/mission_distance
```

## `/scan`

Provides simulated LiDAR data.

Used for obstacle detection and navigation.

## `/odom`

Provides robot odometry information.

## `/tf`

Provides dynamic coordinate frame transformations.

## `/tf_static`

Provides static coordinate frame transformations.

## `/cmd_vel`

Used to send velocity commands to the robot.

## `/clicked_point`

Receives points selected using RViz2 Publish Point.

## `/mission_status`

Publishes the current mission state.

Possible states:

```text
READY
NAVIGATING
COMPLETE
CANCELED
FAILED
```

## `/mission_progress`

Publishes the number of completed waypoints.

## `/mission_distance`

Publishes the remaining distance to the current waypoint.

---

# RViz2

RViz2 is used to visualize:

- Saved map
- Robot
- LiDAR
- AMCL particles
- Robot pose
- Global costmap
- Local costmap
- Global path
- Local path
- Selected waypoints
- Navigation information

RViz2 is also used to select waypoints using **Publish Point**.

---

# Coordinate Frames

The main TF relationship is:

```text
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
```

These frames represent the relationship between the map, odometry, robot footprint, and robot body.

---

# Web Dashboard

The project includes a real-time web dashboard.

Dashboard files:

```text
dashboard/
├── index.html
├── style.css
└── script.js
```

The dashboard communicates with ROS 2 through **rosbridge**.

---

# rosbridge

rosbridge connects ROS 2 with the web application.

```text
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
```

WebSocket:

```text
ws://localhost:9090
```

Start rosbridge manually using:

```bash
ros2 launch rosbridge_server rosbridge_websocket_launch.xml
```

---

# Web Dashboard Features

The dashboard displays:

- ROS system status
- Robot status
- Navigation status
- Localization status
- Planner status
- LiDAR status
- Mission status
- Mission progress
- Current waypoint
- Distance remaining
- Selected waypoints
- Obstacle detection
- Environment status
- Costmap status
- Replanning status
- LiDAR radar visualization

---

# Dashboard Radar

The dashboard includes a LiDAR-based radar visualization.

It displays:

- Detected obstacle direction
- Approximate obstacle distance
- Forward obstacle information
- Dynamic obstacle activity

The radar receives data from:

```text
/scan
```

---

# Automated Project Launcher

The project contains:

```text
run_project.sh
```

The launcher starts and manages the project components in sequence:

```text
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
```

The launcher also manages runtime logs and project processes.

---

# Building the Workspace

If the workspace needs to be rebuilt:

```bash
cd ~/autonomous_robot_ws
colcon build --symlink-install
source install/setup.bash
```

Verify the custom executable:

```bash
ros2 pkg executables autonomous_robot
```

Expected:

```text
autonomous_robot waypoint_navigator
```

---

# ROS 2 Package

Package name:

```text
autonomous_robot
```

Main executable:

```text
waypoint_navigator
```

Run it using:

```bash
ros2 run autonomous_robot waypoint_navigator
```

---

# Package Structure

```text
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
```

---

# Complete Navigation Flow

```text
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
```

---

# Complete Waypoint Flow

```text
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
```

---

# Complete Obstacle Avoidance Flow

```text
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
```

---

# Complete Dashboard Flow

```text
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
```

---

# Project Structure

```text
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
```

---

# Important ROS 2 Components

| Component | Role |
|---|---|
| Gazebo | Simulates the robot and environment |
| TurtleBot3 Burger | Simulated autonomous robot |
| LiDAR | Detects surrounding obstacles |
| Cartographer | Creates the environment map |
| AMCL | Localizes the robot on the saved map |
| Nav2 | Performs autonomous navigation |
| Global Planner | Calculates the global navigation path |
| Local Planner | Handles local movement and obstacle avoidance |
| Global Costmap | Represents the global navigation environment |
| Local Costmap | Represents nearby obstacles |
| RViz2 | Visualizes ROS 2 navigation data |
| Waypoint Navigator | Handles user-selected navigation points |
| rosbridge | Connects ROS 2 with the web dashboard |
| Web Dashboard | Displays real-time robot and mission information |

---

# Project Status

The project has been successfully implemented and tested with:

- ROS 2 Humble
- Ubuntu 22.04
- WSL2
- Gazebo
- TurtleBot3 Burger
- LiDAR
- Cartographer Mapping
- Saved Map
- AMCL Localization
- Nav2
- Global Planning
- Local Planning
- Global Costmap
- Local Costmap
- Obstacle Avoidance
- Dynamic Obstacle Detection
- Nav2 Replanning
- RViz2
- Interactive Waypoints
- Custom Waypoint Navigator
- Multi-Waypoint Navigation
- Mission Progress
- Distance Tracking
- ROS 2 Mission Topics
- rosbridge
- Web Dashboard
- LiDAR Obstacle Detection
- Dashboard Radar
- Automated Project Launcher

The complete system operates entirely in simulation and does not require physical robot hardware.

---

# GitHub Repository

The project is available on GitHub:

**https://github.com/Akadestroyers777/autonomous-robot-navigation-ros2**

---

# Git Workflow

After making changes:

```bash
cd ~/autonomous_robot_ws
```

Check the changes:

```bash
git status
```

Stage the changes:

```bash
git add .
```

Commit:

```bash
git commit -m "Describe your changes"
```

Push:

```bash
git push
```

The repository uses SSH authentication.

---

# Author

**Sai Shrinivas N**

**Vellore Institute of Technology**

### Project

**Autonomous Robot Navigation and Dynamic Obstacle Avoidance Using ROS 2**
