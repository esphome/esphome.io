Eastron SDM Energy Monitor
==========================

.. seo::
    :description: Instructions for setting up SDM power monitors.
    :image: sdm220m.jpg
    :keywords: SDM230M, SDM220, SDM630, SDM120M, SDM72

The ``sdm_meter`` sensor platform allows you to use Eastron SDM modbus energy monitors
(`website <http://www.eastrongroup.com/product_detail.php?id=170&menu1=&menu2=>`__)
with ESPHome.

.. figure:: images/sdm220m-full.png
    :align: center
    :width: 50.0%

    SDM230M Energy Monitor.

The communication with this component is done via a :ref:`UART <uart>` using the :ref:`Modbus protocol <modbus>` 
over RS485 wiring. You will need an RS485 to UART converter for communication.
You must therefore have a ``uart:`` entry in your configuration with both the TX and RX pins set
to some pins on your board and the baud rate set to 9600bps. 
! For the SDM230M, SDM120M Energy Monitor the default factory baud rate is 2400bps. You either need to change the code to 2400bps for these models or change the settings on your Energy Meter For more information search for your model: (`eastron's website <https://www.eastroneurope.com/products/category/din-rail-mounted-metering>`__).

.. code-block:: yaml

    # Example configuration entry
    uart:
      rx_pin: D1
      tx_pin: D2
      baud_rate: 9600 #if your energy meter is SDM230M or SDM120M than change the baud_rate: 2400
      stop_bits: 1

    sensor:
      - platform: sdm_meter
        phase_a:
          current:
            name: "SDM230M Current"
          voltage:
            name: "SDM230M Voltage"
          active_power:
            name: "SDM230M Power"
          power_factor:
            name: "SDM230M Power Factor"
          apparent_power:
            name: "SDM230M Apparent Power"
          reactive_power:
            name: "SDM230M Reactive Power"
          phase_angle:
            name: "SDM230M Phase Angle"
        frequency:
          name: "SDM230M Frequency"
        total_power:
          name: "SDM230M Total Power"
        import_active_energy:
          name: "SDM230M Import Active Energy"
        export_active_energy:
          name: "SDM230M Export Active Energy"
        import_reactive_energy:
          name: "SDM230M Import Reactive Energy"
        export_reactive_energy:
          name: "SDM230M Export Reactive Energy"
        update_interval: 60s


Configuration variables:
------------------------

- **phase_a** (*Optional*): The group of exposed sensors for Phase A/1.

  - **current** (*Optional*): Use the current value of the sensor in amperes. All options from
    :ref:`Sensor <config-sensor>`.
  - **voltage** (*Optional*): Use the voltage value of the sensor in volts (V).
    All options from :ref:`Sensor <config-sensor>`.
  - **active_power** (*Optional*): Use the (active) power value of the sensor in watts (W). All options
    from :ref:`Sensor <config-sensor>`.
  - **power_factor** (*Optional*): Use the power factor value of the sensor.
    All options from :ref:`Sensor <config-sensor>`.
  - **apparent_power** (*Optional*): Use the apparent power value of the sensor in volt amps (VA). All
    options from :ref:`Sensor <config-sensor>`.
  - **reactive_power** (*Optional*): Use the reactive power value of the sensor in volt amps reactive (VAR). All
    options from :ref:`Sensor <config-sensor>`.
  - **phase_angle** (*Optional*): Use the phase angle value of the sensor in degrees (°). All options
    from :ref:`Sensor <config-sensor>`.

- **phase_b** (*Optional*): The group of exposed sensors for Phase B/2 on applicable meters. eg: SDM630

  - All options from **phase_a**

- **phase_c** (*Optional*): The group of exposed sensors for Phase C/3 on applicable meters. eg: SDM630

  - All options from **phase_a**

- **frequency** (*Optional*): Use the frequency value of the sensor in hertz.
  All options from :ref:`Sensor <config-sensor>`.
- **total_power** (*Optional*): Use the total power value of the sensor in watts (W).
  All options from :ref:`Sensor <config-sensor>`.
- **import_active_energy** (*Optional*): Use the import active energy value of the sensor in kilowatt
  hours (kWh). All options from :ref:`Sensor <config-sensor>`.
- **export_active_energy** (*Optional*): Use the export active energy value of the sensor in kilowatt
  hours (kWh). All options from :ref:`Sensor <config-sensor>`.
- **import_reactive_energy** (*Optional*): Use the import reactive energy value of the sensor in
  kilovolt amps reactive hours (kVArh). All options from :ref:`Sensor <config-sensor>`.
- **export_reactive_energy** (*Optional*): Use the export reactive energy value of the sensor in
  kilovolt amps reactive hours (kVArh). All options from :ref:`Sensor <config-sensor>`.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the
  sensor. Defaults to ``60s``.
- **address** (*Optional*, int): The address of the sensor if multiple sensors are attached to
  the same UART bus. You will need to set the address of each device manually. Defaults to ``1``.

See Also
--------

- :ref:`sensor-filters`
- :apiref:`sdm220m/sdm220m.h`
- :ghedit:`Edit`

