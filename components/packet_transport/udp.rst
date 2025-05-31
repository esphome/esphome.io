.. _udp-packet-transport:

UDP Packet Transport Platform
=============================

.. seo::
    :description: Instructions for setting up a udp packet transport platform on ESPHome
    :image: udp.svg
    :keywords: udp, packet, transport

The :ref:`packet-transport` platform allows ESPHome nodes to directly communicate with each over a communication channel.
The UDP implementation of the platform uses UDP as a communication medium. See the :ref:`packet-transport` and :ref:`udp` for more information.

Example Configuration
---------------------

.. code-block:: yaml

    # Example configuration entry
    packet_transport:
      platform: udp
      sensors:
        - dht_temp

    udp:

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
- :doc:`/components/udp`
- :doc:`/components/binary_sensor/packet_transport`
- :doc:`/components/sensor/packet_transport`
- :ref:`automation`
- :apiref:`packet_transport/packet_transport.h`
- :ghedit:`Edit`
