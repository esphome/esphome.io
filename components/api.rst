Native API Component
====================

.. seo::
    :description: Instructions for setting up the native ESPHome API for communication with Home Assistant.
    :image: server-network.svg
    :keywords: Native API, ESPHome, Home Assistant

The ESPHome native API is used to communicate with clients directly, with a highly-optimized
network protocol. Currently, only the ESPHome tool, Home Assistant and ioBroker use this native API.

After adding an ``api:`` line to your ESPHome configuration you can go to the Home Assistant
web interface and navigate to the "Integrations" screen in the "Configuration" panel. Then wait
for the ESPHome device to show up under the discovered section (can take up to 5 minutes) or add
the device manually by choosing "ESPHome" from the integration overview and entering
"<NODE_NAME>.local" or the IP address of the unit in the "Host" field.

The ESPHome native API is based on a custom TCP protocol using protocol buffers. You can find
the protocol data structure definitions here: `api.proto <https://github.com/esphome/esphome/blob/dev/esphome/components/api/api.proto>`__
A Python library that implements this protocol is `aioesphomeapi <https://github.com/esphome/aioesphomeapi>`__.

.. note::

    **Actions** were previously called **Services**. ESPHome changed the name in line with
    `Home Assistant <https://developers.home-assistant.io/blog/2024/07/16/service-actions/>`__
    but will continue to support YAML with ``services`` and ``homeassistant.service`` for the foreseeable future.
    Documentation will only refer to **Actions**.

.. code-block:: yaml

    # Example configuration entry
    api:

Configuration variables:
------------------------

- **port** (*Optional*, int): The port to run the API Server on. Defaults to ``6053``.
- **encryption** (*Optional*): Enable transport encryption of the API layer.

  - **key** (**Required**, string): The pre-shared key for the encryption. This is a 32-byte base64 encoded string.
    Below you can copy a key randomly generated in your browser:

    .. raw:: html

        <input type="text" id="api-key" onclick="this.focus();this.select()" style="width: 350px; max-width: 75vw;" readonly="readonly">
        <script>
          // https://stackoverflow.com/a/62362724
          function bytesArrToBase64(arr) {
            const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"; // base64 alphabet
            const bin = n => n.toString(2).padStart(8,0); // convert num to 8-bit binary string
            const l = arr.length
            let result = '';

            for(let i=0; i<=(l-1)/3; i++) {
              let c1 = i*3+1>=l; // case when "=" is on end
              let c2 = i*3+2>=l; // case when "=" is on end
              let chunk = bin(arr[3*i]) + bin(c1? 0:arr[3*i+1]) + bin(c2? 0:arr[3*i+2]);
              let r = chunk.match(/.{1,6}/g).map((x,j)=> j==3&&c2 ? '=' :(j==2&&c1 ? '=':abc[+('0b'+x)]));
              result += r.join('');
            }

            return result;
          }

          let array = new Uint8Array(32);
          window.crypto.getRandomValues(array);
          document.getElementById("api-key").value = bytesArrToBase64(array);
        </script>

- **actions** (*Optional*, list): A list of user-defined actions. See :ref:`api-device-actions`.
- **reboot_timeout** (*Optional*, :ref:`config-time`): The amount of time to wait before rebooting when no
  client connects to the API. This is needed because sometimes the low level ESP functions report that
  the ESP is connected to the network, when in fact it is not - only a full reboot fixes it.
  Can be disabled by setting this to ``0s``. Defaults to ``15min``.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.
- **password** (*Optional*, **Deprecated**, string): The password to protect the API Server with. Defaults
  to no password. It is recommended to use the ``encryption`` -> ``key`` above instead of the the ``password``.
- **on_client_connected** (*Optional*, :ref:`Action <config-action>`): An automation to perform when a client
  connects to the API. See :ref:`api-on_client_connected_trigger`.
- **on_client_disconnected** (*Optional*, :ref:`Action <config-action>`): An automation to perform when a client
  disconnects from the API. See :ref:`api-on_client_disconnected_trigger`.

.. _api-actions:

Actions
-------

Before using any of the actions below, you'll need to tell Home Assistant to allow your device to
perform actions.

Open the ESPHome integration page on your Home Assistant instance:

.. raw:: html

    <a href="https://my.home-assistant.io/redirect/integration/?domain=esphome" target="_blank" rel="noreferrer noopener"><img src="https://my.home-assistant.io/badges/integration.svg" alt="Open your Home Assistant instance and show an integration." /></a>

Then:

#. Find your device in the device list
#. Click the "configure" button next to it
#. Check the "Allow the device to perform Home Assistant actions" box
#. Then click "submit".

.. _api-homeassistant_event_action:

``homeassistant.event`` Action
******************************

.. note::

    Be sure to :ref:`follow the instructions above <api-actions>` to tell Home Assistant to allow
    your device to perform actions.

When using the native API with Home Assistant, you can create events in the Home Assistant event bus
straight from ESPHome :ref:`Automations <automation>`.

.. code-block:: yaml

    # In some trigger
    on_...:
      # Simple
      - homeassistant.event:
          event: esphome.button_pressed
          data:
            message: Button was pressed

Configuration variables:
````````````````````````

- **event** (**Required**, string): The event to create - must begin with ``esphome.``
- **data** (*Optional*, mapping): Optional *static* data to pass along with the event.
- **data_template** (*Optional*, mapping): Optional template data to pass along with the event.
  This is evaluated on the Home Assistant side with Home Assistant's templating engine.
- **variables** (*Optional*, mapping): Optional variables that can be used in the ``data_template``.
  Values are :ref:`lambdas <config-lambda>` and will be evaluated before sending the request.

.. _api-homeassistant_action-action:

``homeassistant.action`` Action
********************************

.. note::

    Be sure to :ref:`follow the instructions above <api-actions>` to tell Home Assistant to allow
    your device to perform actions.

When using the native API with Home Assistant, you can perform Home Assistant actions straight from ESPHome :ref:`Automations <automation>`.

.. code-block:: yaml

    # In some trigger
    on_...:
      # Simple
      - homeassistant.action:
          action: notify.html5
          data:
            message: Button was pressed
      # With templates and variables
      - homeassistant.action:
          action: notify.html5
          data:
            title: New Humidity
          data_template:
            message: The humidity is {{ my_variable }}%.
          variables:
            my_variable: |-
              return id(my_sensor).state;

Configuration variables:
````````````````````````

- **action** (**Required**, string): The Home Assistant `Action <https://www.home-assistant.io/docs/scripts/service-calls/>`__
  to perform.
- **data** (*Optional*, mapping): Optional *static* data to perform the action with.
- **data_template** (*Optional*, mapping): Optional template data to perform the action with.
  This is evaluated on the Home Assistant side with Home Assistant's templating engine.
- **variables** (*Optional*, mapping): Optional variables that can be used in the ``data_template``.
  Values are :ref:`lambdas <config-lambda>` and will be evaluated before sending the request.

Data structures are not possible, but you can create a script in Home Assistant and call with all
the parameters in plain format.

.. code-block:: yaml

    # Home Assistant Configuration
    script:
      ...
      set_light_rgb:
        alias: 'ESPHome RGB light set'
        sequence:
        - action: light.turn_on
          data_template:
            entity_id: '{{ light_name }}'
            rgb_color:
            - '{{ red }}'
            - '{{ green }}'
            - '{{ blue }}'

Then, in ESPHome:

.. code-block:: yaml

    # In some trigger
    on_...:
      - homeassistant.action:
          action: script.set_light_rgb
          data:
            light_name: 'my_light'
            red: '255'
            green: '199'
            blue: '71'

.. _api-homeassistant_tag_scanned_action:

``homeassistant.tag_scanned`` Action
************************************

.. note::

    Be sure to :ref:`follow the instructions above <api-actions>` to tell Home Assistant to allow
    your device to make action calls.

When using the native API with Home Assistant, you can push tag_scanned to Home Assistant
straight from ESPHome :ref:`Automations <automation>`.

.. code-block:: yaml

    # In some trigger
    on_...:
      # Simple
      - homeassistant.tag_scanned: some-tag

Configuration variables:
````````````````````````

- **tag** (**Required**, :ref:`templatable <config-templatable>`, string): The id of the scanned tag

Triggers
--------

.. _api-on_client_connected_trigger:

``on_client_connected`` Trigger
*******************************

This trigger is activated each time a client connects to the API. Two variables of
type ``std::string`` are available for use by actions called from within this trigger:

- ``client_address``: the IP address of the client that connected
- ``client_info``: the name of the client that connected

.. code-block:: yaml

    api:
      # ...
      on_client_connected:
        - logger.log:
            format: "Client %s connected to API with IP %s"
            args: ["client_info.c_str()", "client_address.c_str()"]


.. _api-on_client_disconnected_trigger:

``on_client_disconnected`` Trigger
**********************************

This trigger is activated each time the API disconnects from the API. Two variables of
type ``std::string`` are available for use by actions called from within this trigger:

- ``client_address``: the IP address of the client that disconnected
- ``client_info``: the name of the client that disconnected

.. code-block:: yaml

    api:
      # ...
      on_client_disconnected:
        - logger.log: "API client disconnected!"

.. _api-connected_condition:

``api.connected`` Condition
---------------------------

This :ref:`Condition <config-condition>` checks if at least one client is connected to the ESPHome
native API. Please note client not only includes Home Assistant, but also ESPHome's OTA log output
if logs are shown remotely.

.. code-block:: yaml

    on_...:
      if:
        condition:
          api.connected:
        then:
          - logger.log: API is connected!

.. _api-device-actions:

User-defined Actions
--------------------

It is also possible to get data from Home Assistant to ESPHome with user-defined actions.
When you declare actions in your ESPHome YAML file, they will automatically show up in
Home Assistant and you can call them directly.

.. code-block:: yaml

    # Example configuration entry
    api:
      actions:
        - action: start_laundry
          then:
            - switch.turn_on: relay
            - delay: 3h
            - switch.turn_off: relay

For example with the configuration seen above, after uploading you will see an action
called ``esphome.livingroom_start_laundry`` (livingroom is the node name) which you can
then call.

Additionally, you can also transmit data from Home Assistant to ESPHome with this method:

.. code-block:: yaml

    # Example configuration entry
    api:
      actions:
        - action: start_effect
          variables:
            my_brightness: int
            my_effect: string
          then:
            - light.turn_on:
                id: my_light
                brightness: !lambda 'return my_brightness;'
                effect: !lambda 'return my_effect;'

Using the ``variables`` key you can tell ESPHome which variables to expect from Home Assistant.
For example the action seen above would be executed with something like this:

.. code-block:: yaml

    # Example Home Assistant Action
    action: esphome.livingroom_start_effect
    data_template:
      my_brightness: "{{ states.brightness.state }}"
      my_effect: "Rainbow"

Then each variable you define in the ``variables`` section is accessible in the automation
triggered by the user-defined action through the name you gave it in the variables section
(note: this is a local variable, so do not wrap it in ``id(...)`` to access it).

There are currently 4 types of variables:

- bool: A boolean (ON/OFF). C++ type: ``bool``
- int: An integer. C++ type: ``int``/``int32_t``
- float: A floating point number. C++ type: ``float``
- string: A string. C++ type: ``std::string``

Each of these also exist in array form:

- bool[]: An array of boolean values. C++ type: ``std::vector<bool>``
- ... - Same for other types.

Advantages over MQTT
--------------------

The ESPHome native API has many advantages over using MQTT for communication with Home
Automation software (currently only Home Assistant and ioBroker). But MQTT is a great protocol and will
never be removed. Features of native API (vs. MQTT):

- **Much more efficient:** ESPHome encodes all messages in a highly optimized format with
  protocol buffers - for example binary sensor state messages are about 1/10 of the size.
- **One-click configuration:** ESPHome just needs one click to set up in Home Assistant -
  no more messing around with retained MQTT discovery messages and alike.
- **One less single point of failure:** In the ESPHome native API each ESP is its own server.
  With MQTT, when the broker shuts off nothing can communicate anymore.
- **Stability:** Since ESPHome has far more control over the protocol than with MQTT,
  it's really easy for us to roll out stability improvements.
- **Low Latency:** The native API is optimized for very low latency, usually this is only
  a couple of milliseconds and far less than can be noticed by the eye.

See Also
--------

- :apiref:`api/api_server.h`
- :ghedit:`Edit`
