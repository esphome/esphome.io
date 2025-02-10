BLE Client Text Sensor
======================

.. seo::
    :description: Fetch string values from BLE devices.
    :image: bluetooth.svg

The ``ble_client`` component is a text sensor platform that can
query BLE devices for specific values of service characteristics.

For more information on BLE services and characteristics, see
:doc:`/components/ble_client`.

.. code-block:: yaml

    esp32_ble_tracker:

    ble_client:
      - mac_address: XX:XX:XX:XX:XX:XX
        id: itag_black

    text_sensor:
      - platform: ble_client
        ble_client_id: itag_black
        name: "Sensor Location"
        service_uuid: '180d'
        characteristic_uuid: '2a38'

Configuration variables:
------------------------

- **ble_client_id** (**Required**, :ref:`config-id`): ID of the associated BLE client.
- **service_uuid** (**Required**, UUID): UUID of the service on the device.
- **characteristic_uuid** (**Required**, UUID): UUID of the service's characteristic to query.
- **descriptor_uuid** (*Optional*, UUID): UUID of the characteristic's descriptor to query.
- **notify** (*Optional*, boolean): Instruct the server to send notifications for this
  characteristic. Defaults to ``false``.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to poll the device. Defaults to ``60s``.
- All other options from :ref:`Text Sensor <config-text_sensor>`.

Automations:

- **on_notify** (*Optional*, :ref:`Automation <automation>`): An automation to
  perform when a notify message is received from the device. See :ref:`ble_text_sensor-on_notify`.


BLE Sensor Automation
---------------------

.. _ble_text_sensor-on_notify:

``on_notify``
*************

This automation is triggered when the device/server sends a notify message for
a characteristic. The config variable *notify* must be true or this will have
no effect.
A variable ``x`` of type ``std::string`` is passed to the automation for use in lambdas.

See Also
--------

- :doc:`/components/ble_client`
- :doc:`/components/sensor/ble_client`
- :ref:`sensor-filters`
- :apiref:`ble_text_sensor/ble_text_sensor.h`
- :ghedit:`Edit`
