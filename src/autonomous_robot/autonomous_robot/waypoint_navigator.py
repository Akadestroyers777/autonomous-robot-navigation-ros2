#!/usr/bin/env python3

import threading

import rclpy
from rclpy.node import Node

from geometry_msgs.msg import PointStamped, PoseStamped
from std_msgs.msg import String, Int32, Float32

from nav2_simple_commander.robot_navigator import BasicNavigator


class InteractiveWaypointNavigator(Node):

    def __init__(self):

        super().__init__(
            'interactive_waypoint_navigator'
        )

        self.navigator = BasicNavigator()

        self.waypoints = []

        self.start_requested = False
        self.started = False

        # ======================================
        # RVIZ CLICKED POINTS
        # ======================================

        self.point_subscription = self.create_subscription(
            PointStamped,
            '/clicked_point',
            self.point_callback,
            10
        )

        # ======================================
        # DASHBOARD TOPICS
        # ======================================

        self.status_publisher = self.create_publisher(
            String,
            '/mission_status',
            10
        )

        self.progress_publisher = self.create_publisher(
            Int32,
            '/mission_progress',
            10
        )

        self.distance_publisher = self.create_publisher(
            Float32,
            '/mission_distance',
            10
        )

        # Initial dashboard state

        self.publish_status("READY")
        self.publish_progress(0)
        self.publish_distance(0.0)

        # ======================================
        # STARTUP MESSAGE
        # ======================================

        self.get_logger().info('')
        self.get_logger().info(
            '=========================================='
        )
        self.get_logger().info(
            '   INTERACTIVE AUTONOMOUS NAVIGATION'
        )
        self.get_logger().info(
            '=========================================='
        )
        self.get_logger().info('')
        self.get_logger().info(
            'Select waypoints using "Publish Point" in RViz.'
        )
        self.get_logger().info(
            'Click as many points as required.'
        )
        self.get_logger().info(
            'Press ENTER in this terminal when finished.'
        )
        self.get_logger().info('')

    # ==========================================
    # DASHBOARD STATUS
    # ==========================================

    def publish_status(self, status):

        msg = String()
        msg.data = status

        self.status_publisher.publish(msg)

    # ==========================================
    # DASHBOARD PROGRESS
    # ==========================================

    def publish_progress(self, value):

        msg = Int32()
        msg.data = value

        self.progress_publisher.publish(msg)

    # ==========================================
    # DASHBOARD DISTANCE
    # ==========================================

    def publish_distance(self, value):

        msg = Float32()
        msg.data = float(value)

        self.distance_publisher.publish(msg)

    # ==========================================
    # RVIZ POINT CALLBACK
    # ==========================================

    def point_callback(self, msg):

        if self.started:
            return

        x = msg.point.x
        y = msg.point.y

        self.waypoints.append(
            (x, y)
        )

        number = len(self.waypoints)

        self.get_logger().info(
            f'Point {number} selected: '
            f'x={x:.3f}, y={y:.3f}'
        )

    # ==========================================
    # CREATE NAVIGATION POSE
    # ==========================================

    def create_pose(self, x, y):

        pose = PoseStamped()

        pose.header.frame_id = 'map'

        pose.header.stamp = (
            self.navigator
            .get_clock()
            .now()
            .to_msg()
        )

        pose.pose.position.x = x
        pose.pose.position.y = y
        pose.pose.position.z = 0.0

        pose.pose.orientation.x = 0.0
        pose.pose.orientation.y = 0.0
        pose.pose.orientation.z = 0.0
        pose.pose.orientation.w = 1.0

        return pose

    # ==========================================
    # EXECUTE MISSION
    # ==========================================

    def execute_mission(self):

        if len(self.waypoints) == 0:

            self.get_logger().error(
                'No waypoints were selected.'
            )

            self.publish_status(
                "NO WAYPOINTS"
            )

            return

        self.started = True

        total_waypoints = len(
            self.waypoints
        )

        self.get_logger().info('')
        self.get_logger().info(
            '=========================================='
        )
        self.get_logger().info(
            f'{total_waypoints} WAYPOINTS SELECTED'
        )
        self.get_logger().info(
            '=========================================='
        )

        for i, (x, y) in enumerate(
            self.waypoints,
            start=1
        ):

            self.get_logger().info(
                f'Point {i}: '
                f'x={x:.3f}, y={y:.3f}'
            )

        # ======================================
        # MISSION START
        # ======================================

        self.publish_status(
            "NAVIGATING"
        )

        self.publish_progress(0)

        self.get_logger().info('')
        self.get_logger().info(
            'Nav2 is ACTIVE!'
        )
        self.get_logger().info('')
        self.get_logger().info(
            '=========================================='
        )
        self.get_logger().info(
            '       STARTING AUTONOMOUS MISSION'
        )
        self.get_logger().info(
            '=========================================='
        )

        mission_success = True

        # ======================================
        # NAVIGATE THROUGH WAYPOINTS
        # ======================================

        for i, (x, y) in enumerate(
            self.waypoints,
            start=1
        ):

            goal = self.create_pose(
                x,
                y
            )

            self.get_logger().info('')
            self.get_logger().info(
                '------------------------------------------'
            )
            self.get_logger().info(
                f'Navigating to Point {i}'
            )
            self.get_logger().info(
                f'Target: x={x:.3f}, y={y:.3f}'
            )
            self.get_logger().info(
                '------------------------------------------'
            )

            self.navigator.goToPose(
                goal
            )

            while not self.navigator.isTaskComplete():

                feedback = (
                    self.navigator.getFeedback()
                )

                if feedback is not None:

                    distance = (
                        feedback.distance_remaining
                    )

                    self.publish_distance(
                        distance
                    )

                    self.get_logger().info(
                        f'Point {i} | '
                        f'Distance remaining: '
                        f'{distance:.2f} m'
                    )

            result = str(
                self.navigator.getResult()
            )

            # ==================================
            # SUCCESS
            # ==================================

            if 'SUCCEEDED' in result:

                self.get_logger().info(
                    f'✓ Point {i} reached successfully!'
                )

                self.publish_progress(i)

                self.publish_distance(
                    0.0
                )

            # ==================================
            # CANCELED
            # ==================================

            elif 'CANCELED' in result:

                self.get_logger().error(
                    f'✗ Navigation to Point {i} '
                    f'was canceled.'
                )

                self.publish_status(
                    "CANCELED"
                )

                mission_success = False

                break

            # ==================================
            # FAILED
            # ==================================

            else:

                self.get_logger().error(
                    f'✗ Navigation to Point {i} '
                    f'failed.'
                )

                self.publish_status(
                    "FAILED"
                )

                mission_success = False

                break

        # ======================================
        # FINAL MISSION RESULT
        # ======================================

        if mission_success:

            self.publish_progress(
                total_waypoints
            )

            self.publish_distance(
                0.0
            )

            self.publish_status(
                "COMPLETE"
            )

            self.get_logger().info('')
            self.get_logger().info(
                '=========================================='
            )
            self.get_logger().info(
                '          MISSION COMPLETE'
            )
            self.get_logger().info(
                '=========================================='
            )
            self.get_logger().info('')

        else:

            self.get_logger().info('')
            self.get_logger().info(
                '=========================================='
            )
            self.get_logger().info(
                '          MISSION STOPPED'
            )
            self.get_logger().info(
                '=========================================='
            )
            self.get_logger().info('')

        rclpy.shutdown()


# ==========================================
# MAIN
# ==========================================

def main():

    rclpy.init()

    node = InteractiveWaypointNavigator()

    # ======================================
    # ENTER THREAD
    # ======================================

    def wait_for_enter():

        input()

        node.start_requested = True

    input_thread = threading.Thread(
        target=wait_for_enter,
        daemon=True
    )

    input_thread.start()

    # ======================================
    # ROS CALLBACK LOOP
    # ======================================

    while (
        rclpy.ok()
        and not node.start_requested
    ):

        rclpy.spin_once(
            node,
            timeout_sec=0.1
        )

    if rclpy.ok():

        node.execute_mission()


if __name__ == '__main__':

    main()