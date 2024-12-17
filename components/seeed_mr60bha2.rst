Seeed Studio MR60BHA2 60GHz mmWave Breathing and Heartbeat Detection Sensor Kit
===============================================================================

.. seo::
    :description: Instructions for setting up Seeed Studio MR60BHA2 60GHz mmWave Breathing and Heartbeat Detection Sensor Kit.
    :image: seeed_mr60bha2.jpg

Component/Hub
-------------

The ``seeed_mr60bha2`` platform allows you to use Seeed Studio MR60BHA2 60GHz mmWave Fall Detection Sensor Kit with XIAO ESP32C6 (`Product Page <https://www.seeedstudio.com/MR60BHA2-60GHz-mmWave-Sensor-Breathing-and-Heartbeat-Module-p-5945.html>`__) with ESPHome.

The :ref:`UART <uart>` is required to be set up in your configuration for this sensor to work, ``parity`` and ``stop_bits`` **must be** respectively ``NONE`` and ``1``.
You can use the ESP32 software or hardware serial to use this MR60BHA2, its default baud rate is 115200.

.. figure:: images/seeed_mr60bha2.jpg
    :align: center
    :width: 50.0%

    Seeed Studio MR60BHA2 60GHz mmWave Fall Detection Sensor Kit with XIAO ESP32C6


.. code-block:: yaml

    # Example configuration entry
    seeed_mr60bha2:

Configuration variables:
************************

- **uart_id** (*Optional*, :ref:`config-id`): Manually specify the ID of the :ref:`UART Component <uart>` if you want
  to use multiple UART buses.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID for this :doc:`seeed_mr60bha2` component if you need multiple components.

Sensor
------

The ``seeed_mr60bha2`` sensor allows you to perform different measurements.

.. code-block:: yaml

    sensor:
      - platform: seeed_mr60bha2
        breath_rate:
          name: "Real-time respiratory rate"
        heart_rate:
          name: "Real-time heart rate"
        distance:
          name: "Distance to detection object"

Configuration variables:
************************

- **breath_rate** (*Optional*, int): Radar-detected respiratory rate during the first 60 seconds.
  All options from :ref:`Sensor <config-sensor>`.
- **heart_rate** (*Optional*, int): Heart rate during the first 60 seconds as detected by the radar.
  All options from :ref:`Sensor <config-sensor>`.
- **distance** (*Optional*, int): Straight-line distance between the radar and the monitoring object.
  All options from :ref:`Sensor <config-sensor>`.


See Also
--------

- `Official Using Documents for Seeed Studio MR60BHA2 60GHz mmWave Breathing and Heartbeat Detection Sensor Kit with XIAO ESP32C6 <https://wiki.seeedstudio.com/getting_started_with_mr60bha2_mmwave_kit/>`_
- `Product Detail Page for Seeed Studio MR60BHA2 60GHz mmWave Breathing and Heartbeat Detection Sensor Kit with XIAO ESP32C6 <https://www.seeedstudio.com/MR60BHA2-60GHz-mmWave-Sensor-Breathing-and-Heartbeat-Module-p-5945.html>`_
- `Source of inspiration for implementation <https://github.com/limengdu/MR60BHA2_ESPHome_external_components/>`_
- :apiref:`seeed_mr60bha2/seeed_mr60bha2.h`
- :ghedit:`Edit`
