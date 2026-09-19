# Autonomous Robot Navigation and Dynamic Obstacle Avoidance Using ROS 2

## Project Introduction

This project implements an autonomous mobile robot navigation system using **ROS 2**, **Gazebo**, **TurtleBot3 Burger**, **LiDAR**, **AMCL**, **Nav2**, and a custom **Waypoint Navigator**.

The robot can:

- Navigate from Point A to Point B
- Accept multiple waypoints through RViz
- Navigate through waypoints sequentially
- Detect obstacles using simulated LiDAR
- Avoid static and dynamic obstacles
- Replan its path when obstacles are encountered
- Display navigation and mission information through a web dashboard

---

# Requirements

Before running the project, make sure the system has:

- Windows 10/11
- WSL2
- Ubuntu 22.04
- ROS 2 Humble
- Gazebo
- TurtleBot3
- Nav2
- Cartographer
- rosbridge

---

# First-Time Setup

Clone the repository:

```bash
git clone https://github.com/Akadestroyers777/autonomous-robot-navigation-ros2.git
```

Rename it to the required workspace:

```bash
mv autonomous-robot-navigation-ros2 ~/autonomous_robot_ws
```

Enter the workspace:

```bash
cd ~/autonomous_robot_ws
```

Build the project:

```bash
source /opt/ros/humble/setup.bash
colcon build --symlink-install
source install/setup.bash
```

Make the launcher executable:

```bash
chmod +x run_project.sh
```

After the first-time setup, use the Master Command below to run the complete project.

---

# Master Command

Start WSL Ubuntu:

```powershell
wsl -d Ubuntu-22.04
```

Then run:

```bash
cd ~/autonomous_robot_ws
./run_project.sh
```

The launcher automatically starts:

- Gazebo
- TurtleBot3 Burger
- AMCL
- Nav2
- RViz2
- rosbridge
- Web Dashboard
- Waypoint Navigator

---

# Manual Step-by-Step Execution

If the automated launcher is not used, start the components manually in this order.

## 1. Gazebo

```bash
source /opt/ros/humble/setup.bash
export TURTLEBOT3_MODEL=burger

ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py
```

## 2. AMCL

```bash
source /opt/ros/humble/setup.bash
source ~/autonomous_robot_ws/install/setup.bash

ros2 launch nav2_bringup localization_launch.py \
map:=/home/saishrinivas07/autonomous_robot_ws/maps/turtlebot3_map.yaml \
use_sim_time:=True
```

## 3. Nav2

```bash
source /opt/ros/humble/setup.bash
source ~/autonomous_robot_ws/install/setup.bash

ros2 launch nav2_bringup navigation_launch.py \
map:=/home/saishrinivas07/autonomous_robot_ws/maps/turtlebot3_map.yaml \
use_sim_time:=True
```

## 4. RViz2

```bash
source /opt/ros/humble/setup.bash

ros2 run rviz2 rviz2 \
-d /opt/ros/humble/share/nav2_bringup/rviz/nav2_default_view.rviz \
--ros-args -p use_sim_time:=true
```

## 5. rosbridge

```bash
source /opt/ros/humble/setup.bash

ros2 launch rosbridge_server rosbridge_websocket_launch.xml
```

## 6. Waypoint Navigator

```bash
cd ~/autonomous_robot_ws
source /opt/ros/humble/setup.bash
source install/setup.bash

ros2 run autonomous_robot waypoint_navigator
```

Select waypoints in RViz2 using **Publish Point**, then press **ENTER** in the waypoint navigator terminal.

The robot will navigate through the selected waypoints sequentially.

---

# System Architecture

```text
Gazebo / TurtleBot3 Burger
          |
          v
      LiDAR /scan
          |
          v
 Cartographer Saved Map
          |
          v
    AMCL Localization
          |
          v
        Nav2
          |
          +----------------------+
          |                      |
          v                      v
   Global Planner          Local Planner
          |                      |
          |                Local Costmap
          |                      |
          +----------+-----------+
                     |
                     v
              Obstacle Avoidance
                     |
                     v
                TurtleBot3


RViz Publish Point
          |
          v
Custom Waypoint Navigator
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
```

---

# Technologies Used

- ROS 2 Humble
- Gazebo
- TurtleBot3 Burger
- Python
- Nav2
- AMCL
- Cartographer
- RViz2
- LiDAR
- rosbridge
- HTML
- CSS
- JavaScript
- ROSLIB.js
- WSL2
- Ubuntu 22.04

---

# Mapping

The environment was mapped using the simulated TurtleBot3 LiDAR and Cartographer.

The generated map is stored in:

```text
maps/
├── turtlebot3_map.pgm
└── turtlebot3_map.yaml
```

Map resolution:

```text
0.05 m/pixel
```

Map size:

```text
124 × 120 pixels
```

Approximate environment size:

```text
6.2 m × 6.0 m
```

---

# Localization

The saved map is used by **AMCL (Adaptive Monte Carlo Localization)**.

AMCL estimates the robot's position and orientation using:

- Saved map
- LiDAR `/scan`
- Odometry
- Robot pose

This provides the robot's current location for navigation.

---

# Navigation

Navigation is handled by **Nav2**.

Nav2 uses:

- Global costmap
- Local costmap
- Global planner
- Local controller
- Recovery behaviors
- Obstacle information

The global planner calculates a path toward the target.

The local planner follows the path while considering nearby obstacles.

---

# Waypoint Navigation

The custom Python node is called:

```text
waypoint_navigator
```

It subscribes to:

```text
/clicked_point
```

Waypoints are selected interactively in RViz using **Publish Point**.

The selected points are stored by the waypoint navigator.

After pressing **ENTER**, the node sends the waypoints to Nav2 sequentially.

Example:

```text
Point A
   ↓
Point B
   ↓
Point C
   ↓
Point D
```

The next waypoint is sent only after the previous waypoint is successfully reached.

---

# Navigation Logic

The navigation process is:

```text
RViz Publish Point
        ↓
Waypoint Navigator
        ↓
Store waypoint
        ↓
Press ENTER
        ↓
Send Nav2 Goal
        ↓
AMCL provides robot pose
        ↓
Nav2 Global Planner
        ↓
Global Costmap
        ↓
Local Planner
        ↓
Local Costmap
        ↓
LiDAR obstacle information
        ↓
Robot moves
        ↓
Waypoint reached
        ↓
Send next waypoint
```

The custom waypoint navigator manages waypoint selection and mission sequencing.

The actual path planning and obstacle avoidance are handled by Nav2.

---

# Dynamic Obstacle Avoidance

Dynamic obstacles can be introduced into the Gazebo environment.

Example obstacle:

```text
dynamic_obstacle
```

The obstacle is detected using the robot's simulated LiDAR.

LiDAR publishes data on:

```text
/scan
```

The obstacle information updates the local costmap.

Nav2 then modifies the local navigation behavior and replans around the obstacle when required.

The robot can therefore continue toward the selected waypoint without requiring a new waypoint from the user.

---

# Dynamic Obstacle Test

Example dynamic obstacle:

```bash
ros2 run gazebo_ros spawn_entity.py \
  -entity dynamic_obstacle \
  -file /tmp/obstacle.sdf \
  -x 2.5 -y 0.5 -z 0.25
```

Obstacle dimensions:

```text
0.5 m × 0.5 m × 0.5 m
```

The robot detects the obstacle using LiDAR and Nav2 handles the navigation around it.

---

# ROS Topics

Important ROS 2 topics used by the project:

| Topic | Purpose |
|---|---|
| `/scan` | LiDAR data |
| `/odom` | Robot odometry |
| `/clicked_point` | RViz waypoint input |
| `/mission_status` | Mission state |
| `/mission_progress` | Waypoint progress |
| `/mission_distance` | Remaining mission distance |

Mission status examples:

```text
READY
NAVIGATING
COMPLETE
CANCELED
FAILED
```

---

# RViz2

RViz2 is used for visualization and waypoint selection.

The visualization includes:

- Robot position
- Map
- LiDAR
- Global costmap
- Local costmap
- Global path
- Local path
- Navigation information

Waypoints can be selected using:

```text
Publish Point
```

---

# Web Dashboard

The project includes a web dashboard connected to ROS 2 using **rosbridge**.

Dashboard location:

```text
dashboard/
├── index.html
├── style.css
└── script.js
```

The dashboard connects to:

```text
ws://localhost:9090
```

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
- Remaining distance
- Selected waypoints
- Obstacle detection
- Environment status
- Costmap status
- Replanning status
- LiDAR radar visualization

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
│       ├── autonomous_robot/
│       │   └── waypoint_navigator.py
│       │
│       ├── resource/
│       ├── test/
│       ├── package.xml
│       ├── setup.py
│       └── setup.cfg
│
├── .gitignore
├── README.md
└── run_project.sh
```

Generated ROS 2 directories such as `build/`, `install/`, and `log/` are not included in the repository.

---

# Automated Launcher

The project includes:

```text
run_project.sh
```

The launcher automatically handles the main startup sequence.

It starts:

```text
Gazebo
   ↓
AMCL
   ↓
Nav2
   ↓
RViz2
   ↓
rosbridge
   ↓
Dashboard
   ↓
Waypoint Navigator
```

Runtime logs are stored separately in:

```text
project_logs/
```

---

# Build

If the source code is modified, rebuild the workspace:

```bash
cd ~/autonomous_robot_ws

source /opt/ros/humble/setup.bash

colcon build --symlink-install

source install/setup.bash
```

---

# Complete Project Flow

```text
1. Start WSL Ubuntu
        ↓
2. Run run_project.sh
        ↓
3. Gazebo starts
        ↓
4. TurtleBot3 Burger starts
        ↓
5. AMCL starts
        ↓
6. Nav2 starts
        ↓
7. RViz2 starts
        ↓
8. rosbridge starts
        ↓
9. Web dashboard connects
        ↓
10. User selects waypoints in RViz
        ↓
11. User presses ENTER
        ↓
12. Waypoint Navigator sends goals
        ↓
13. AMCL provides robot localization
        ↓
14. Nav2 plans the route
        ↓
15. LiDAR detects obstacles
        ↓
16. Costmaps are updated
        ↓
17. Nav2 avoids/replans around obstacles
        ↓
18. Robot reaches each waypoint
        ↓
19. Final waypoint reached
        ↓
20. MISSION COMPLETE
```

---

# Project Status

The following components have been implemented and tested:

- ROS 2 Humble
- Gazebo simulation
- TurtleBot3 Burger
- Simulated LiDAR
- Cartographer mapping
- Saved map
- AMCL localization
- Nav2 navigation
- Global planning
- Local planning
- Global and local costmaps
- Interactive RViz waypoints
- Custom Python waypoint navigator
- Sequential waypoint navigation
- Mission progress tracking
- Mission distance tracking
- Dynamic obstacle detection
- Dynamic obstacle avoidance
- Replanning
- rosbridge
- Web dashboard
- Automated project launcher
- GitHub repository

---

# Author

**N SAISHRINIVAS**

Vellore Institute of Technology

AI & Robotics
```
