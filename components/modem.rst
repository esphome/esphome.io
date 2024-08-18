Modem Component
===============

.. seo::
    :description: Instructions for setting up the Ethernet configuration for your ESP32 node in ESPHome.
    :image: ethernet.svg
    :keywords: Network, Modem

This ESPHome component enables cellular modem TCP/IP connections for ESP32s.

Only ESP32 with IDF framework is supported.

As the device IP will be on a foreign private network, :doc:`/components/mqtt` should be used, or :doc:`/components/api` with :doc:`/components/wireguard`. 

This component can't be used with the :doc:`/components/wifi` or the :doc:`/components/ethernet`, even if other are physically available.

.. code-block:: yaml

    modem:
      id: atmodem
      rx_pin: GPIO26
      tx_pin: GPIO27
      model: SIM7600  
      apn: orange
      pin_code: "0000"


Configuration variables:
------------------------

- **model** (**Required**, string): The type of the modem.

  Supported modems are:

  - ``BG96``
  - ``SIM800``
  - ``SIM7000``
  - ``SIM7600``
  - ``SIM7670``
  - ``GENERIC``

- **rx_pin** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The pin used for ``RX`` on the esp side (connected to the ``TX`` pin on the modem side).
- **tx_pin** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The pin used for ``TX`` on the esp side (connected to the ``RX`` pin on the modem side).
- **apn** (**Required**, string): Operator apn.
- **pin_code** (*Optional*, string): The pin code of the sim card.
- **baud_rate** (*Optional*, int): Modem baud rate. Use ``AT+IPR=?`` with ``init_at:`` to see available baud rate for your modem.
- **enable_on_boot** (*Optional*, boolean): If enabled, the PPPoS interface will be enabled on boot. Defaults to ``true``.
- **enable_cmux** (*Optional*, boolean): If enabled, CMUX will be enabled. In this mode, the modem will be able to answer `AT` commands while connected. Defaults to ``false``.
- **reboot_timeout** (*Optional*, :ref:`config-time`): The amount of time to wait before rebooting after connecting attempt fail. Defaults to ``10min``.
- **init_at** (*Optional*, list): A list of ``AT`` commands that will be sent to the modem after the connection.
- **power_pin** (*Optional*, :ref:`Pin Schema <config-pin_schema>`): The pin used for ``PWK``, to allow power handling. Needs ``status_pin``.
- **status_pin** (*Optional*, :ref:`Pin Schema <config-pin_schema>`): The pin used for ``STATUS``, to be able to know the power state.
- **on_not_responding** (*Optional*, :ref:`Automation <automation>`): An action to be performed when the modem doesn't respond.
- **on_connect** (*Optional*, :ref:`Automation <automation>`): An action to be performed when the modem get an IP.
- **on_disconnect** (*Optional*, :ref:`Automation <automation>`): An action to be performed when the modem lost it's IP.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.

.. note::

    **Modem disconnection**

    The modem component is not able to check the internet connection by itself. You will have to rely on an other component 
    (like :doc:`/components/mqtt` or :doc:`/components/api`) to check if the network has disconnect, and use the `reconnect()` method.

    .. code-block:: yaml

        modem:
          id: atmodem

        mqtt:
          on_disconnect:
            - lambda: id(atmodem).reconnect();


.. note::

    **Lilygo devices**

    On some modem like Lilygo devices, the ``power_pin`` is inverted. Some modem needs also the ``fligth_pin`` to be high.

    .. code-block:: yaml

        modem:
          power_pin: 
            number: GPIO04
            inverted: True

        switch:
          id: flight_mode
          internal: True
          pin: GPIO25
          restore_mode: ALWAYS_ON

.. note::

    **No NMEA for GNSS**

    Internally, the modem component use the CMUX protocol to comminicate with the modem. 
    This create two virtual channels: one for ``AT`` commands, and one for data.
    As the data channel is used for ``PPPoS``, It's not possible to create another data channel, for example for NMEA GNSS frames. 
    (For GNSS, a workaround is to use ``AT+CGNSSINFO``, that doesn't produce NMEA frames).



Configuration examples
----------------------

.. code-block:: yaml

    modem:
      id: atmodem
      rx_pin: 26
      tx_pin: 27
      model: SIM7600  
      apn: orange
      status_pin: GPIO34
      power_pin: 
        number: GPIO04
        inverted: True
      pin_code: "0000"
      enable_on_boot: True
      init_at:
        - AT+CGMM  # module name
      on_not_responding:
        - logger.log: "modem not responding"
      on_connect:
        - logger.log: "modem got IP"
      on_disconnect:
        - logger.log: "modem lost IP"

Lambda calls
------------

From :ref:`lambdas <config-lambda>`, you can call several methods to do some advanced stuff.

- ``.dce``: The DCE object from the underlying `esp_modem`_ library. Most of the `DCE methods <https://docs.espressif.com/projects/esp-protocols/esp_modem/docs/latest/internal_docs.html#_CPPv4N9esp_modem3DCEE>`_ are available.

For example, to send an ``AT`` command, and get the result:

.. code-block:: cpp

    std::string gnss_info;
    esp_modem::command_result err;
    err = id(atmodem).dce->at("AT+CGNSSINFO", gnss_info, 3000);
    if (err != esp_modem::command_result::OK) {
      ESP_LOGE("", "Error while executing AT command");
    } else {
      ESP_LOGI("", "Result: %s", gnss_info.c_str());
    }

- ``.is_connected()``: Returns ``True`` or ``False`` if the modem is connected or not.

.. code-block:: yaml

    on_...:
      if:
        condition:
          lambda: return id(atmodem).is_connected();
        then:
          - logger.log: Modem is connected!

- ``.modem_ready()``: Returns ``True`` or ``False`` if the modem is able to answer ``AT`` commands.

- ``.send_at(std::string cmd)``: Shortand to ``.dce->at()`` that directly returns the ``std::string`` containing the result, or "ERROR" if the command fail.

.. code-block:: cpp

    ESP_LOGI("", "result: %s", id(atmodem).send_at("ATI").c_str());

- ``.enable()``: Enable and start the connection. Poweron the modem if needed and ``power_pin`` defined.
- ``.disable()``: Disconnect. Also poweroff the modem if ``power_pin`` defined. 

Performance and stability
-------------------------

  To gain more speed, or if big transferts fails you can try to enable ``CONFIG_UART_ISR_IN_IRAM``:

  .. code-block:: yaml

      esp32:
      framework:
        type: esp-idf
        sdkconfig_options:
          CONFIG_UART_ISR_IN_IRAM: y

  This is not done by default, because it conflict with :doc:`/components/uart` (crash).

See Also
--------

- :doc:`network`
- :doc:`/components/text_sensor/modem`
- :doc:`/components/sensor/modem`
- :doc:`/components/switch/modem`
- :doc:`/components/mqtt`
- :doc:`/components/wireguard`
- `SIM7600 AT command list <https://simcom.ee/documents/SIM7600C/SIM7500_SIM7600%20Series_AT%20Command%20Manual_V1.01.pdf>`__
- `SIM7600 Hardware design <https://simcom.ee/documents/SIM7600E/SIM7600%20Series%20Hardware%20Design_V1.03.pdf>`__
- `esp modem <https://docs.espressif.com/projects/esp-protocols/esp_modem/docs/latest/index.html>`__
- :ghedit:`Edit`


.. _esp_modem: https://docs.espressif.com/projects/esp-protocols/esp_modem/docs/latest/
