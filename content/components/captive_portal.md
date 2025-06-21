Captive Portal
==============

.. seo::
    :description: Instructions for setting up the Captive Portal fallback mechanism in ESPHome.
    :image: wifi-strength-alert-outline.svg

The captive portal component in ESPHome is a fallback mechanism for when connecting to the
configured :doc:`WiFi <wifi>` fails.

After 1 minute of unsuccessful WiFi connection attempts, the ESP will start a WiFi hotspot
(with the credentials from your configuration)

.. figure:: images/captive_portal-ui.png
    :align: center
    :width: 70.0%

In this web interface, you can manually override the WiFi settings of the device (please note
this will be overwritten by any subsequent serial upload so make sure to also update your YAML configuration).

Additionally, you can upload a new firmware file.

When you connect to the fallback network, the web interface should open automatically (see also
login to network notifications). If that does not work, you can also navigate to http://192.168.4.1/
manually in your browser.

.. code-block:: yaml

    # Example configuration entry
    wifi:
      # ...
      ap:
        ssid: "Livingroom Fallback Hotspot"
        password: !secret wifi_ap_password

    captive_portal:


No configuration variables.


See Also
--------

- :doc:`wifi`
- :doc:`improv_serial`
- :doc:`esp32_improv`
- :apiref:`captive_portal/captive_portal.h`
- :ghedit:`Edit`
