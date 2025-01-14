Bluetooth Proxy
===============

.. seo::
    :description: Instructions for setting up the Bluetooth Proxy in ESPHome.
    :image: bluetooth.svg

Home Assistant can expand its Bluetooth reach by communicating through the Bluetooth proxy component in ESPHome.
The individual device integrations in Home Assistant (such as BTHome) will receive the data from the Bluetooth
Integration in Home Assistant which automatically aggregates all ESPHome Bluetooth proxies with any USB Bluetooth
Adapters you might have. This exceptional feature offers fault tolerant connection between the Bluetooth devices
and Home Assistant.

Note that while this component is named ``bluetooth_proxy``, only BLE devices (and their Home Assistant integrations)
are supported.

If you're looking to create an ESPHome node that is just a Bluetooth Proxy, see
our `Bluetooth Proxy installer <https://esphome.github.io/bluetooth-proxies/>`__ website.

.. warning:: Active connections

    The Bluetooth proxy of ESPHome provides Home Assistant with a maximum number of 3 simultaneous active connections.
    Devices which maintain a *continuous active* connection will consume one of these constantly, whilst devices which
    do *periodic disconnections and reconnections* will permit using more than 3 of them (on a statistical basis).
    Passively broadcasted sensor data (that is advertised by certain devices without active connections) is received
    separately from these, and is not limited to a specific number.

    The :doc:`esp32` component should be configured to use the ``esp-idf`` framework, as the ``arduino`` framework
    uses significantly more memory and performs poorly with the Bluetooth proxy enabled. When switching from
    ``arduino`` to ``esp-idf``, make sure to update the device with a serial cable as the partition table is
    different between the two frameworks as :doc:`/components/ota/index` updates will not change the partition table.

    The :doc:`web_server` component should be disabled as the device is likely
    to run out of memory and will malfunction when both components are enabled simultaneously.

    Not all devices are supported and ESPHome does not decode or keep a list. To find out if your device is supported,
    please search for it in the `Home Assistant Integrations <https://www.home-assistant.io/integrations/>`__ list.

Configuration:
--------------

.. code-block::

    bluetooth_proxy:

- **active** (*Optional*, boolean): Enables proxying active connections. Defaults to ``false``.
- **cache_services** (*Optional*, boolean): Enables caching GATT services in NVS flash storage which significantly speeds up active connections. Defaults to ``true`` when using the ESP-IDF framework.

The Bluetooth proxy depends on :doc:`esp32_ble_tracker` so make sure to add that to your configuration.

Improving reception performance
-------------------------------

Use a board with an Ethernet connection to the network, to offload ESP32's radio module from WiFi traffic, this gains performance on Bluetooth side.
To maximize the chances of catching advertisements of the sensors, you can set ``interval`` equal to ``window`` in :doc:`/components/esp32_ble_tracker` scan parameter settings:

.. code-block:: yaml

    esp32_ble_tracker:
      scan_parameters:
        interval: 1100ms
        window: 1100ms
.. note::

    For WiFi-based proxies, changing the ``interval`` or ``window`` from their default values may result in an unstable WiFi connection. Using the default values for ``interval`` and ``window`` will usually resolve any instability.

Avoid placing the ESP node in racks, close to routers/switches or other network equipment as EMI interference will degrade Bluetooth signal reception. For best results put as far away as possible, at least 3 meters distance from any other such equipment. Place your ESPHome devices close to the Bluetooth devices that you want to interact with for the best experience.

Complete sample recommended configuration for an ethernet-connected Bluetooth proxy
-----------------------------------------------------------------------------------

Below is a complete sample recommended configuration for an ethernet-connected Bluetooth proxy. This configuration is not for a Wi-Fi based proxy. If you experience issues with your proxy, try reducing your configuration to be as similar to this as possible.

This configuration is for an Olimex ESP32-PoE-ISO board with an Ethernet connection to the network. If you use a different board, you must change the ``board`` substitution to match your board.

.. code-block:: yaml

    substitutions:
      name: my-bluetooth-proxy
      board: esp32-poe-iso

    esphome:
      name: ${name}
      name_add_mac_suffix: true

    esp32:
      board: ${board}
      framework:
        type: esp-idf

    ethernet:
      type: LAN8720
      mdc_pin: GPIO23
      mdio_pin: GPIO18
      clk_mode: GPIO17_OUT
      phy_addr: 0
      power_pin: GPIO12

    # Enable logging
    logger:

    # Enable Home Assistant API
    api:

    ota:
      platform: esphome

    esp32_ble_tracker:
      scan_parameters:
        interval: 1100ms
        window: 1100ms
        active: true

    bluetooth_proxy:
      active: true


See Also
--------

- :doc:`esp32_ble_tracker`
- :apiref:`bluetooth_proxy/bluetooth_proxy.h`
- BTHome `<https://bthome.io/>`__
- :ghedit:`Edit`
