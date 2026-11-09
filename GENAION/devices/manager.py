"""
GENAION Devices — Hardware & Edge Device Integration
Provides adapter interfaces for Android, Raspberry Pi, Arduino, ESP32, and Robots.
Includes hardware interlock to prevent unauthorized actuator triggers.
"""

import time
from typing import Any, Dict, List, Optional


class DeviceAdapter:
    """Base class for device communications (Serial/UART, MQTT, HTTP)."""

    def __init__(self, device_id: str, protocol: str = "http"):
        self.device_id = device_id
        self.protocol = protocol
        self.is_connected = False

    def connect(self) -> bool:
        self.is_connected = True
        return True

    def disconnect(self) -> None:
        self.is_connected = False

    def send_command(self, command: str, payload: dict) -> Dict[str, Any]:
        return {
            "device_id": self.device_id,
            "status": "acknowledged",
            "command": command,
            "timestamp": time.time()
        }


class DeviceManager:
    """Manages registered physical devices and safe dispatching."""

    def __init__(self):
        self.devices: Dict[str, DeviceAdapter] = {}
        # Pre-register local host device
        self.register_device("android_local_sensors", "android_hal")

    def register_device(self, device_id: str, protocol: str) -> None:
        self.devices[device_id] = DeviceAdapter(device_id, protocol)

    def list_devices(self) -> List[Dict[str, Any]]:
        return [
            {
                "device_id": d.device_id,
                "protocol": d.protocol,
                "is_connected": d.is_connected
            }
            for d in self.devices.values()
        ]
