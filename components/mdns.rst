mDNS Component
==============

.. seo::
    :description: Instructions for setting up the mDNS configuration for your ESP node in ESPHome.
    :image: radio-tower.svg
    :keywords: WiFi, WLAN, ESP8266, ESP32, mDNS

The ``mdns`` component makes the node announce itself on the local network using the multicast DNS (mDNS) protocol.

Both Home Assistant and the ESPHome dashboard use mDNS to identify the IP address of all ESPHome nodes on the network.
If mDNS is disabled, they will no longer be able to automatically find your devices. It may be necessary to use a static
IP for all nodes and to enable the ping option in the Home Assistant add-on.

It is recommended to leave mDNS enabled.

.. code-block:: yaml

    # Example configuration entry
    mdns:
      disabled: false

.. _mdns-configuration_variables:


Services:
---------

Additional mdns services can be added as exposed by the esphome node.

.. code-block:: yaml

    # Example configuration entry with additional service
    mdns:
      services:
        - service: "_custom_service"
          protocol: "_tcp"
          port: 8080
          txt:
            txt_key_1: txt_value_1

.. _mdns-custom_services:


Configuration variables:
------------------------

- **disabled** (*Optional*, boolean): Set to true to disable mDNS usage. Defaults to false.
- **services** (*Optional*, list): List of additional services to expose.

  - **service** (**Required**, string): Name of extra service.
  - **protocol** (**Required**, string): Protocol of service (_udp or _tcp).
  - **port** (*Optional*, :ref:`templatable <config-templatable>`, int): Port number of extra service.
  - **txt** (*Optional*, mapping): Additional text records to add to service. Values are :ref:`templatable <config-templatable>`.
