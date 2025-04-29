WireGuard Component
===================

.. |wireguard| unicode:: WireGuard 0xAE
.. _wireguard: https://www.wireguard.org/

.. seo::
    :description: Instructions to setup WireGuard for your ESP board.
    :keywords: WireGuard, VPN

|wireguard|_ is an extremely simple yet fast and modern VPN that utilizes
state-of-the-art cryptography. This component uses a **custom**
implementation not developed by original authors and currently
available for ESP32, ESP8266 and BK72xx microcontrollers *only*.

  Please note that *"WireGuard" and the "WireGuard" logo are
  registered trademarks of Jason A. Donenfeld.* See
  `"WireGuard" Trademark Usage Policy <https://www.wireguard.com/trademark-policy/>`__
  for additional information.

.. warning::

    To successfully use this component you must have |wireguard| also
    on your remote host (already installed and ready to accept connections).
    If you don't have it please read the section :ref:`wireguard-installation`.

.. warning::

    This component requires the system clock to be synchronized.

    See :doc:`time/index` to setup a time source
    and **do not use** ``homeassistant`` time-platform if
    Home Assistant is on the remote peer because the time
    synchronization is a prerequisite to establish the VPN link.

    The :doc:`time/sntp` is a valid time-platform choice.

A VPN tunnel can be created to a **single** remote peer
adding the following to your configuration:

.. code-block:: yaml

    # Example configuration entry
    wireguard:
      address: x.y.z.w
      private_key: AaBbCcDd...=
      peer_endpoint: wg.server.example
      peer_public_key: EeFfGgHh...=

      # Optional netmask (this is the default, no outgoing traffic 
      # will pass through the tunnel if omitted)
      netmask: 255.255.255.255

      # Optional endpoint port (WireGuard default if omitted)
      peer_port: 51820

      # Optional pre-shared key (omit if not in use)
      peer_preshared_key: XxYyZzWw...=

      # Optional list of ip/mask (any host is allowed if omitted)
      peer_allowed_ips:
        - x.y.z.0/24
        - l.m.n.o/32  # the /32 can be omitted for single host
        - [...]

      # Optional keepalive (disabled by default)
      peer_persistent_keepalive: 25s

It is recommended to use *secrets* at least for private and pre-shared keys:

.. code-block:: yaml

    wireguard:
      private_key: !secret wg_privkey
      peer_preshared_key: !secret wg_shrdkey

Configuration variables
------------------------

.. _wireguard-address:

- **address** (**Required**, IPv4 address): The local VPN address of the device.

  If you intend to upload firmwares through the VPN link you probably need
  to copy this value to the ``use_address`` parameter of the :doc:`wifi`.

- **netmask** (*Optional*, IPv4 address): The netmask for the configured address.
  Default to ``255.255.255.255``.

  See section :ref:`wireguard-static-routes` if outgoing connections are
  expected to transit through the VPN link (e.g. with :doc:`mqtt` to a
  remote MQTT broker).

- **private_key** (**Required**, string): The private key of the device.

- **peer_endpoint** (**Required**, string): The hostname of the remote peer.

- **peer_port** (*Optional*, UDP port): The port where remote peer is listening on.
  The |wireguard| default is ``51820``.

- **peer_public_key** (**Required**, string): The public key of the remote peer.

- **peer_preshared_key** (*Optional*, string): The chosen pre-shared key between
  local device and remote peer.

- **peer_persistent_keepalive** (*Optional*, :ref:`config-time`): The amount of
  time after which a *keepalive* packet is sent through the tunnel.
  By default this feature is disabled (``0s``).

  If there are NATs or firewalls between the device and the remote peer set
  this value to something like ``25s``.

- **peer_allowed_ips** (*Optional*, list of IPv4 networks): A list of networks
  in CIDR notation (*IP/mask*) to be allowed through the tunnel. Any host
  (``0.0.0.0/0``) will be allowed if this parameter is omitted.

  The device own ``address/32`` is always added by default to this list.

  See section :ref:`wireguard-static-routes` if outgoing connections are
  expected to transit through the VPN link (e.g. with :doc:`mqtt` to a
  remote MQTT broker).

- **reboot_timeout** (*Optional*, :ref:`config-time`): The amount of time to wait
  before rebooting the device when the remote peer is unreachable. Can be disabled
  by setting this to ``0s``. Default to ``15min``.

- **require_connection_to_proceed** (*Optional*, boolean): Set to ``true`` to
  wait for the remote peer to be up before continuing to boot the device.
  Default to ``false``.

  This can be used to delay the initialization of components that use the
  VPN tunnel as long as the VPN isn't ready. For example if you are using
  :doc:`mqtt` to reach a remote broker you may experience boot freeze just
  after the setup of MQTT because it waits for the broker to be reachable,
  but the connection cannot be established until the VPN link is
  active too. To bypass such deadlock set this parameter to ``true`` in
  order to not initialize MQTT until the remote peer is up.

- **update_interval** (*Optional*, :ref:`config-time`): How often to check
  the connection status and the latest handshake value. Default to ``10s``.

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.

.. _wireguard-static-routes:

Static routes and outgoing connections
--------------------------------------

Currently there is no way on ESP devices to configure static routes for
network interfaces, so the ``peer_allowed_ips`` list is used only to allow
(or drop) packets that pass through the VPN tunnel, not to define static
routes for remote hosts.

The routes are implicitly added by the configured ``netmask`` and
**only** packets with destination *inside* the same network defined
by ``address/netmask`` will be routed to the tunnel.

This means that the user has to tweak the ``netmask`` parameter
to "cover" **all** the networks in the allowed IPs list in order
to successfully establish *outgoing* connections to remote hosts.
Incoming connections are not affected by ``netmask``.

Let's explain with some examples:

+--------------+---------------------+----------------------+------------------------------+
| address      | netmask             | allowed ips          | working outgoing connections |
+==============+=====================+======================+==============================+
| 172.16.0.100 | *omitted* or        | *omitted* or         | **none**,                    |
|              | 255.255.255.255     | any other value      | no routes are created        |
+              +---------------------+----------------------+------------------------------+
|              | 255.255.255.0       | *omitted*            | only to ``172.16.0.0/24``    |
+              +                     +----------------------+ because ``192.168.0.0/24``   +
|              |                     | - 172.16.0.0/24      | and any other network will   |
|              |                     | - 192.168.0.0/24     | be outside ``172.16.0.0/24`` |
|              |                     | - *any other*        |                              |
+              +                     +----------------------+------------------------------+
|              |                     | -   192.168.0.0/24   | **none** because             |
|              |                     |                      | ``192.168.0.0/24`` is not    |
|              |                     |                      | part of ``172.16.0.0/24``    |
+--------------+---------------------+----------------------+------------------------------+
| 10.44.0.100  | 255.0.0.0           | *omitted*            | to ``10.0.0.0/8`` network    |
+              +                     +----------------------+------------------------------+
|              |                     | - 10.44.0.0/16       | only to the networks in      |
|              |                     | - 10.10.0.0/16       | the allowed list because the |
|              |                     |                      | netmask will route the whole |
|              |                     |                      | ``10.0.0.0/8`` but wireguard |
|              |                     |                      | allows only those two        |
|              |                     |                      | subnets                      |
+--------------+---------------------+----------------------+------------------------------+
| any          | 0.0.0.0             | *omitted*            | **any**                      |
+              +                     +----------------------+------------------------------+
|              |                     | - 172.16.0.0/24      | to any network that is in    |
|              |                     | - 10.44.0.0/16       | the list of allowed IPs      |
|              |                     | - 10.10.0.0/16       | because the netmask will     |
|              |                     |                      | route any traffic but        |
|              |                     |                      | wireguard allows only its    |
|              |                     |                      | own list                     |
+--------------+---------------------+----------------------+------------------------------+

.. note::

    Setting the ``netmask`` to ``0.0.0.0`` has the effect of routing
    through the VPN link any traffic. It is like having set the wireguard
    interface as the system default.

.. _wireguard-sensors:

Sensors
-------

Here after the sensors available for this component.

Status Binary Sensor
^^^^^^^^^^^^^^^^^^^^

This binary sensor tracks the connection status (*online*/*offline*) of the remote peer.

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: wireguard
        status:
          name: 'WireGuard Status'

All options from :ref:`Binary Sensor <config-binary_sensor>` can be added to the
above configuration.

Enabled Binary Sensor
^^^^^^^^^^^^^^^^^^^^^

This binary sensor tracks if |wireguard| is *enabled* or not.

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: wireguard
        enabled:
          name: 'WireGuard Enabled'

All options from :ref:`Binary Sensor <config-binary_sensor>` can be added to the
above configuration.

Latest Handshake Sensor
^^^^^^^^^^^^^^^^^^^^^^^

This sensor reports the *timestamp* of the latest completed handshake.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: wireguard
        latest_handshake:
          name: 'WireGuard Latest Handshake'

All options from :ref:`Sensor <config-sensor>` can be added to the
above configuration.

Address Text Sensor
^^^^^^^^^^^^^^^^^^^

This sensor exposes to the frontend the configured :ref:`address <wireguard-address>`.

.. code-block:: yaml

    # Example configuration entry
    text_sensor:
      - platform: wireguard
        address:
          name: 'WireGuard Address'

All options from :ref:`Text Sensor <config-text_sensor>` can be added to the
above configuration.

.. _wireguard-actions:

Actions
-------

The following actions are available.

``wireguard.disable``
^^^^^^^^^^^^^^^^^^^^^

This action drops down the active VPN link (if any) and disables the component.

.. code-block:: yaml

    on_...:
      then:
        - wireguard.disable:

The lambda equivalent is ``id(wireguard_id).disable()``.

.. note::

    To disable |wireguard| since device boot you can execute this action
    in the :ref:`esphome-on_boot` step.

``wireguard.enable``
^^^^^^^^^^^^^^^^^^^^

This action enables the component and starts the connection to the remote peer.

.. code-block:: yaml

    on_...:
      then:
        - wireguard.enable:

The lambda equivalent is ``id(wireguard_id).enable()``.

.. _wireguard-conditions:

Conditions
----------

The following conditions are available.

``wireguard.enabled``
^^^^^^^^^^^^^^^^^^^^^

This condition checks if |wireguard| is currently enabled or not.

.. code-block:: yaml

    on_...:
      - if:
          condition: wireguard.enabled
          then:
            - ...
          else:
            - ...

The lambda equivalent is ``id(wireguard_id).is_enabled()``.

``wireguard.peer_online``
^^^^^^^^^^^^^^^^^^^^^^^^^

This condition checks if the remote peer is *online*.

.. code-block:: yaml

    on_...:
      - if:
          condition: wireguard.peer_online
          then:
            - ...
          else:
            - ...

The lambda equivalent is ``id(wireguard_id).is_peer_up()``.

.. _wireguard-installation:

Remote peer setup
-----------------

There are many different ways for installing and configuring
|wireguard| on servers, home servers or general host. It depends
on the platform and on the operating system in use.

You can start reading the `official documentation <https://www.wireguard.com/>`__
to have an overview of what it is and on how to install it *system wide* for
common operating systems. Read the thread at `Home Assistant Community Add-on: WireGuard
<https://community.home-assistant.io/t/home-assistant-community-add-on-wireguard/134662>`__
if you intend to install it through Home Assistant. Plase note that securely
setting up a VPN requires some networking experience, you will need to open
router ports and possibly use custom commands to redirect traffic.

Once everything is configured you should be able to add the device
to Home Assistant. See next section.

Connecting to remote Home Assistant
-----------------------------------

The ESP device should interact with remote Home Assistant, across the VPN link,
as it is on the local network but probably the initial *auto discovery*
will not work and you have to add the device **manually**.

These are the steps:

1. go to the Home Assistant "Integrations" page
2. click on the "Add Integration" button (bottom right corner)
3. select "ESPHome" from the list
4. insert the configured IP :ref:`address <wireguard-address>`
   as the host name

The device should now be linked to your remote Home Assistant.

.. note::

    If you have issues linking the ESP device try setting
    the ``use_address`` parameter of the :doc:`wifi` to the value
    of the :ref:`address <wireguard-address>` configured here.

See Also
--------

- :doc:`time/index`
- :doc:`time/sntp`
- :ref:`automation`
- |wireguard|_ official website
- `Home Assistant Community Add-on: WireGuard
  <https://community.home-assistant.io/t/home-assistant-community-add-on-wireguard/134662>`__
  (also on `GitHub <https://github.com/hassio-addons/addon-wireguard>`__)
- :ghedit:`Edit`
