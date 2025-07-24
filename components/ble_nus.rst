BLE Nordic UART Service (NUS)
=============================

.. seo::
    :description: BLE UART support using Nordic UART Service (NUS) for ESPHome logging and communication.

The BLE NUS component provides a Bluetooth Low Energy UART interface based on the Nordic UART Service.
It can be used to stream logs or enable custom bidirectional communication with ESPHome.

.. code-block:: yaml

    # Example configuration entry
    ble_nus:
      type: logs

Configuration variables
-----------------------

- **type** (**Required**, string): Mode of operation. Must be set to ``logs`` to stream ESPHome logs over the BLE UART.

Usage
-----

To connect and view logs from the device over BLE:

.. code-block:: bash

    esphome logs d.yaml --device BLE

Or connect to a specific BLE address:

.. code-block:: bash

    esphome logs d.yaml --device 00:11:22:33:44:55

See Also
--------

- :ghedit:`Edit`
- `Nordic UART Service (NUS) <https://docs.nordicsemi.com/bundle/ncs-latest/page/nrf/libraries/bluetooth/services/nus.html>