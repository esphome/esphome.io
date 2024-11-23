BLE Server
==========

.. seo::
    :description: Instructions for setting up Bluetooth LE GATT Server in ESPHome.
    :image: bluetooth.svg

The ``esp32_ble_server`` component in ESPHome sets up a simple BLE GATT server that exposes the device name,
manufacturer and board. This component allows other components to create their own services to expose
data and control.

.. warning::

    The BLE software stack on the ESP32 consumes a significant amount of RAM on the device.
    
    **Crashes are likely to occur** if you include too many additional components in your device's
    configuration. Memory-intensive components such as :doc:`/components/voice_assistant` and other
    audio components are most likely to cause issues.

.. code-block:: yaml

    # Example configuration

    esp32_ble_server:
      manufacturer: "Orange"
      manufacturer_data: [0x4C, 0, 0x23, 77, 0xF0 ]
      on_connect:
        - lambda: |-
            ESP_LOGD("BLE", "Connection from %d", id);
      on_disconnect:
        - lambda: |-
            ESP_LOGD("BLE", "Disconnection from %d", id);


Configuration variables:
------------------------

- **manufacturer** (*Optional*, string): The name of the manufacturer/firmware creator. Defaults to ``ESPHome``.
- **model** (*Optional*, string): The model name of the device. Defaults to the friendly name of the ``board`` chosen
  in the :ref:`core configuration <esphome-configuration_variables>`.
- **manufacturer_data** (*Optional*, list of bytes): The manufacturer-specific data to include in the advertising
  packet. Should be a list of bytes, where the first two are the little-endian representation of the 16-bit
  manufacturer ID as assigned by the Bluetooth SIG.
- **on_connect** (*Optional*, :ref:`Automation <automation>`): An action to be performed when a client connects to the BLE server. It provides the ``id`` variable which contains the ID of the client that connected.
- **on_disconnect** (*Optional*, :ref:`Automation <automation>`): An action to be performed when a client disconnects from the BLE server. It provides the ``id`` variable which contains the ID of the client that disconnected.
- **services** (*Optional*, list of :ref:`esp32_ble_server-service`): A list of services to expose on the BLE GATT server.


.. _esp32_ble_server-service:

Service Configuration
---------------------

Services are the main way to expose data and control over BLE. Services communicate with the client through characteristics. Each service can have multiple characteristics.

.. code-block:: yaml

    esp32_ble_server:
      services:
        - uuid: 2a24b789-7aab-4535-af3e-ee76a35cc42d
          advertise: false
          characteristics:
            - uuid: cad48e28-7fbe-41cf-bae9-d77a6c233423
              read: true
              value:
                value: "Hello, World!"


Configuration variables:

- **uuid** (*Required*, string, int): The UUID of the service. If it is a string, it should be in the format ``xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx``.
- **advertise** (*Optional*, boolean): If the service should be advertised. Defaults to ``false``.
- **characteristics** (*Optional*, list of :ref:`esp32_ble_server-characteristic`): A list of characteristics to expose in this service.


.. _esp32_ble_server-characteristic:

Characteristic Configuration
----------------------------

Characteristics expose data and control for a BLE service. Characteristics can have multiple descriptors to provide additional information about the characteristic. Each characteristic can have multiple descriptors.

.. code-block:: yaml

    esp32_ble_server:
      services:
        # ...
        characteristics:
          - id: test_characteristic
            uuid: cad48e28-7fbe-41cf-bae9-d77a6c233423
            advertise: true
            description:
              value: "Sample description"
              type: "encoded_string"
              string_encoding: "utf-8"
            read: true
            value:
                value: "123.1"
                type: float
                endianness: BIG
            descriptors:
              - uuid: 2901
                value: "Hello, World Descriptor!"


Configuration variables:

- **id** (*Optional*, string): An ID to refer to this characteristic in automations.
- **uuid** (*Required*, string, int): The UUID of the characteristic. If it is a string, it should be in the format ``xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx``.
- **description** (*Optional*, :ref:`esp32_ble_server-value`): The description of the characteristic. It will add a ``CUD`` descriptor to the characteristic with the value of the description.
- **read** (*Optional*, boolean): If the characteristic should be readable. Defaults to ``false``.
- **write** (*Optional*, boolean): If the characteristic should be writable. Defaults to ``false``.
- **broadcast** (*Optional*, boolean): If the characteristic should be broadcasted. Defaults to ``false``.
- **notify** (*Optional*, boolean): If the characteristic should be notifiable. If ``true``, a ``CCCD`` descriptor will be automatically added to the characteristic. Defaults to ``false``.
- **indicate** (*Optional*, boolean): If the characteristic should be indicated. If ``true``, a ``CCCD`` descriptor will be automatically added to the characteristic. Defaults to ``false``.
- **write_no_response** (*Optional*, boolean): If the characteristic should be writable without a response. Defaults to ``false``.
- **value** (*Optional*, :ref:`esp32_ble_server-value`): The value of the characteristic.
- **descriptors** (*Optional*, list of :ref:`esp32_ble_server-descriptor`): A list of descriptors to expose in this characteristic.
- **on_write** (*Optional*, :ref:`Automation <automation>`): An action to be performed when the characteristic is written to. The characteristic must have the ``write`` property. See :ref:`esp32_ble_server-characteristic-on_write`.


.. _esp32_ble_server-descriptor:

Descriptor Configuration
------------------------

Descriptors are optional and are used to provide additional information about a characteristic.

.. code-block:: yaml

    esp32_ble_server:
      services:
        - uuid: # ...
          characteristics:
            - uuid: # ...
              descriptors:
                - uuid: 2901
                  value:
                    value: "Hello, World Descriptor!"


Configuration variables:

- **uuid** (*Required*, string, int): The UUID of the descriptor. If it is a string, it should be in the format ``xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx``.
- **value** (*Required*, :ref:`esp32_ble_server-value`): The value of the descriptor.


.. _esp32_ble_server-value:

Value Configuration
-------------------

Values can be of different types and are used to define the value of a characteristic or descriptor.

.. code-block:: yaml

    esp32_ble_server:
      services:
        - uuid: # ...
          characteristics:
            - uuid: # ...
              # String value
              value:
                value: "Hello, World!"
                type: encoded_string
                string_encoding: utf-8
            - uuid: # ...
              # Integer value
              value:
                value: "123"
                type: uint16_t
                endianness: LITTLE
            - uuid: # ...
              # Array of bytes value
              value:
                value: "{9, 9, 9}"
                type: std::vector<uint8_t>
            - uuid: # ...
              # Lambda value
              value:
                value: !lambda 'return std::vector<uint8_t>({9, 9, 9});'
            - uuid: # ...
              # Lambda value using ByteBuffer
              value:
                value: !lambda 'return bytebuffer::ByteBuffer::wrap(0.182).get_data();'

Configuration variables:

- **value** (*Required*, string, int, float, boolean, list of bytes, :ref:`templatable <config-templatable>`): The value of the characteristic or descriptor. For static values, they must be wrapped in quotes. For :ref:`templatable <config-templatable>` values, the lambda function must return a ``std::vector<uint8_t>`` (you may use the ``bytebuffer::ByteBuffer`` helper class to transform your different data types into a byte array). The value is computed each time the characteristic is read.
- **type** (*Optional*, string): The C++ type of the value or ``encoded_string``. It must be defined if the value is not :ref:`templatable <config-templatable>`.
- **endianness** (*Optional*, string): The endianness of the value. Can be ``BIG`` or ``LITTLE``. Defaults to ``LITTLE``.
- **string_encoding** (*Optional*, string): The encoding of the string. Only applicable if the type is ``encoded_string``. The conversion is done in Python before compilation, so the encoding must be a valid [Python encoding](https://docs.python.org/3/library/codecs.html#standard-encodings). Defaults to ``utf-8``.


.. _esp32_ble_server-characteristic-on_write:

``on_write`` Trigger
--------------------

With this configuration option you can write complex automations that are triggered when a characteristic is written to. It provides the ``x`` variable which contains the new value of the characteristic as a ``std::vector<uint8_t>`` and the ``id`` variable which contains the ID of the client that wrote to the characteristic.

.. code-block:: yaml

    esp32_ble_server:
      services:
        - uuid: # ...
          characteristics:
            # ...
            write: true
            on_write:
              then:
                - lambda: |-
                    ESP_LOGD("BLE", "Descriptor received: %s from %d", std::string(x.begin(), x.end()).c_str(), id);


``ble_server.characteristic.set_value`` Action
----------------------------------------------

This action sets the value of a characteristic.

.. code-block:: yaml

    on_...:
      then:
        - ble_server.characteristic_set_value:
            id: test_write_characteristic
            value: [0, 1, 2]


Configuration variables:

- **id** (*Required*, string): The ID of the characteristic to set the value of.
- **value** (*Required*, :ref:`esp32_ble_server-value`): The new value of the characteristic.


``ble_server.characteristic.notify`` Action
-------------------------------------------

This action sends a NOTIFY message to the client.

.. code-block:: yaml

    on_...:
      then:
        - ble_server.characteristic_notify:
            id: test_notify_characteristic

Configuration variables:
- **id** (*Required*, string): The ID of the characteristic to notify the client about (must have the ``notify`` property).


See Also
--------

- :doc:`esp32_ble`
- :doc:`esp32_improv`
- :apiref:`esp32_ble/ble.h`
- :ghedit:`Edit`
