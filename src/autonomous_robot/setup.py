from setuptools import find_packages, setup

package_name = 'autonomous_robot'

setup(
    name=package_name,
    version='0.0.0',

    packages=find_packages(exclude=['test']),

    data_files=[
        (
            'share/ament_index/resource_index/packages',
            ['resource/' + package_name]
        ),
        (
            'share/' + package_name,
            ['package.xml']
        ),
    ],

    install_requires=['setuptools'],

    zip_safe=True,

    maintainer='saishrinivas07',
    maintainer_email='saishrinivas07@todo.todo',

    description='Autonomous robot waypoint navigation',
    license='Apache-2.0',

    extras_require={
        'test': [
            'pytest',
        ],
    },

    entry_points={
        'console_scripts': [
            'waypoint_navigator = autonomous_robot.waypoint_navigator:main',
        ],
    },
)
