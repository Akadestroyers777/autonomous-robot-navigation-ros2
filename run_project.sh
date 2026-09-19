#!/bin/bash

# ============================================================
# Autonomous Robot Navigation Project Launcher
# ROS 2 Humble + TurtleBot3 Burger + Gazebo + Nav2 + RViz
# ============================================================


PROJECT_DIR="$HOME/autonomous_robot_ws"
MAP_FILE="$PROJECT_DIR/maps/turtlebot3_map.yaml"
LOG_DIR="$PROJECT_DIR/project_logs"

mkdir -p "$LOG_DIR"

source /opt/ros/humble/setup.bash
source "$PROJECT_DIR/install/setup.bash"

export TURTLEBOT3_MODEL=burger
export GAZEBO_PLUGIN_PATH=/opt/ros/humble/lib:$GAZEBO_PLUGIN_PATH

echo "=============================================="
echo " AUTONOMOUS ROBOT NAVIGATION PROJECT"
echo "=============================================="
echo ""

# ------------------------------------------------------------
# Cleanup function
# ------------------------------------------------------------

cleanup() {
    echo ""
    echo "Stopping project..."

    if [ -n "${WAYPOINT_PID:-}" ]; then
        kill "$WAYPOINT_PID" 2>/dev/null || true
    fi

    if [ -n "${ROSBRIDGE_PID:-}" ]; then
        kill "$ROSBRIDGE_PID" 2>/dev/null || true
    fi

    if [ -n "${RVIZ_PID:-}" ]; then
        kill "$RVIZ_PID" 2>/dev/null || true
    fi

    if [ -n "${NAV2_PID:-}" ]; then
        kill "$NAV2_PID" 2>/dev/null || true
    fi

    if [ -n "${AMCL_PID:-}" ]; then
        kill "$AMCL_PID" 2>/dev/null || true
    fi

    if [ -n "${GAZEBO_PID:-}" ]; then
        kill "$GAZEBO_PID" 2>/dev/null || true
    fi

    echo "Project stopped."
}

trap cleanup EXIT INT TERM

# ------------------------------------------------------------
# 1. Gazebo
# ------------------------------------------------------------

echo "[1/6] Starting Gazebo..."

ros2 launch turtlebot3_gazebo turtlebot3_world.launch.py \
    > "$LOG_DIR/gazebo.log" 2>&1 &

GAZEBO_PID=$!

echo "Waiting for Gazebo..."

for i in {1..30}; do
    if ros2 service list 2>/dev/null | grep -q "^/spawn_entity$"; then
        echo "Gazebo is ready."
        break
    fi

    if ! kill -0 "$GAZEBO_PID" 2>/dev/null; then
        echo "ERROR: Gazebo stopped unexpectedly."
        echo "Check: $LOG_DIR/gazebo.log"
        exit 1
    fi

    sleep 1
done

if ! ros2 service list 2>/dev/null | grep -q "^/spawn_entity$"; then
    echo "ERROR: Gazebo did not become ready."
    echo "Check: $LOG_DIR/gazebo.log"
    exit 1
fi

# ------------------------------------------------------------
# 2. AMCL Localization
# ------------------------------------------------------------

echo "[2/6] Starting AMCL localization..."

ros2 launch nav2_bringup localization_launch.py \
    map:="$MAP_FILE" \
    use_sim_time:=True \
    > "$LOG_DIR/amcl.log" 2>&1 &

AMCL_PID=$!

echo "Waiting for AMCL..."

for i in {1..30}; do
    if ros2 service list 2>/dev/null | grep -q "/amcl/get_state"; then
        echo "AMCL services available."
        break
    fi

    sleep 1
done

# ------------------------------------------------------------
# 3. Nav2
# ------------------------------------------------------------

echo "[3/6] Starting Nav2..."

ros2 launch nav2_bringup navigation_launch.py \
    map:="$MAP_FILE" \
    use_sim_time:=True \
    > "$LOG_DIR/nav2.log" 2>&1 &

NAV2_PID=$!

echo "Waiting for Nav2 to become active..."

NAV2_READY=false

for i in {1..90}; do

    if ros2 action list 2>/dev/null | grep -q "/navigate_to_pose"; then
        NAV2_READY=true
        echo "Nav2 NavigateToPose action server is ready."
        break
    fi

    if ! kill -0 "$NAV2_PID" 2>/dev/null; then
        echo "ERROR: Nav2 stopped unexpectedly."
        echo "Check: $LOG_DIR/nav2.log"
        exit 1
    fi

    echo "  Waiting for Nav2... ($i/90)"
    sleep 1
done

if [ "$NAV2_READY" != true ]; then
    echo "ERROR: Nav2 did not become ready."
    echo ""
    echo "Last Nav2 log:"
    tail -30 "$LOG_DIR/nav2.log"
    exit 1
fi

# ------------------------------------------------------------
# 4. RViz
# ------------------------------------------------------------

echo "[4/6] Starting RViz..."

ros2 run rviz2 rviz2 \
    -d /opt/ros/humble/share/nav2_bringup/rviz/nav2_default_view.rviz \
    --ros-args -p use_sim_time:=true \
    > "$LOG_DIR/rviz.log" 2>&1 &

RVIZ_PID=$!

sleep 3

# ------------------------------------------------------------
# 5. Rosbridge
# ------------------------------------------------------------

echo "[5/6] Checking Rosbridge..."

ROSBRIDGE_EXISTING=false

if ros2 topic list 2>/dev/null | grep -q "^/rosapi"; then
    ROSBRIDGE_EXISTING=true
fi

if [ "$ROSBRIDGE_EXISTING" = true ]; then
    echo "Rosbridge is already running."
else
    echo "Starting Rosbridge..."

    ros2 launch rosbridge_server rosbridge_websocket_launch.xml \
        > "$LOG_DIR/rosbridge.log" 2>&1 &

    ROSBRIDGE_PID=$!

    sleep 5

    if grep -q "Address already in use" "$LOG_DIR/rosbridge.log" 2>/dev/null; then
        echo "Rosbridge port already occupied."
        echo "Using the existing Rosbridge server."
        kill "$ROSBRIDGE_PID" 2>/dev/null || true
        unset ROSBRIDGE_PID
    else
        echo "Rosbridge started."
    fi
fi

# ------------------------------------------------------------
# 6. Dashboard
# ------------------------------------------------------------

echo "[6/6] Opening dashboard..."

DASHBOARD_PATH="$PROJECT_DIR/dashboard/index.html"

if command -v cmd.exe >/dev/null 2>&1; then
    DASHBOARD_WIN_PATH=$(wslpath -w "$DASHBOARD_PATH")
    cmd.exe /C start "" "$DASHBOARD_WIN_PATH" >/dev/null 2>&1 || true
    echo "Dashboard opened in Windows."
else
    echo "Open manually:"
    echo "$DASHBOARD_PATH"
fi

# ------------------------------------------------------------
# System ready
# ------------------------------------------------------------

echo ""
echo "=============================================="
echo " ROS 2 SYSTEM READY"
echo "=============================================="
echo ""
echo "Gazebo       : READY"
echo "AMCL         : RUNNING"
echo "Nav2         : READY"
echo "RViz         : RUNNING"
echo "Rosbridge    : READY"
echo "Dashboard    : OPEN"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. In RViz, select '2D Pose Estimate'."
echo "2. Set the robot's initial position."
echo "3. Select 'Publish Point'."
echo "4. Click your desired waypoints."
echo "5. Return to this terminal."
echo "6. Press ENTER to start the mission."
echo ""
echo "=============================================="
echo ""

# ------------------------------------------------------------
# Waypoint Navigator
# ------------------------------------------------------------

ros2 run autonomous_robot waypoint_navigator

WAYPOINT_EXIT=$?

echo ""
echo "Waypoint navigator exited with code: $WAYPOINT_EXIT"

exit "$WAYPOINT_EXIT"
