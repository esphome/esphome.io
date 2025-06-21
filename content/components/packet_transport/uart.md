.. _uart-packet-transport:

UART Packet Transport Platform
==============================

.. seo::
    :description: Instructions for setting up a UART packet transport platform on ESPHome
    :image: uart.svg
    :keywords: uart, packet, transport

The :ref:`packet-transport` platform allows ESPHome nodes to directly communicate with each over a communication channel.
The UART implementation of the platform uses a serial port as a communication medium. See the :ref:`packet-transport` and :ref:`uart` for more information.

Example Configuration
---------------------

.. code-block:: yaml

    # Example configuration entry
    packet_transport:
      platform: uart
      sensors:
        - dht_temp

    uart:
      tx_pin: GPIOXX
      rx_pin: GPIOXX
      baud_rate: 9600

    sensor:
      - platform: dht
          id: dht
          pin: GPIOXX
          temperature:
            name: "Temperature"
            id: dht_temp


See Also
--------

- :ref:`packet-transport`
- :doc:`/components/uart`
- :doc:`/components/binary_sensor/packet_transport`
- :doc:`/components/sensor/packet_transport`
- :ref:`automation`
- :apiref:`packet_transport/packet_transport.h`
- :ghedit:`Edit`
