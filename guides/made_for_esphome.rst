.. _made_for_esphome:

Made for ESPHome
================

.. seo::
    :description: Information about the Made for ESPHome program
    :image: /_static/made-for-esphome-black-on-white.png

ESPHome has a wonderful and active community that loves creating and sharing projects.
You can apply for your project to get the ``Made for ESPHome`` stamp of approval.
This ensures that your project is powered by ESPHome and guarantees a minimum level of customizability to users.

Requirements
------------

There are a number of requirements your project must meet. These may vary based on its design. They are:

For projects which utilize Wi-Fi
********************************

Wi-Fi is quite common but requires configuration of the SSID and passphrase.
As such, for easy end-user provisioning, your configuration must include:

- ``esp32_improv`` as described in :doc:`/components/esp32_improv`
- ``improv_serial`` as described in :doc:`/components/improv_serial`, if a USB connection is available (recommended)

Note that these are **not** required for projects that only provide a physical/wired Ethernet port for connectivity.

For all projects
****************

- Your project is powered by ESPHome (runs ESPHome as its firmware)
- Your project is powered by an ESP32 or *supported* ESP32 variant such as the S2, S3, C3, etc.
- Your ESPHome configuration is open source, available for end users to modify/update
- Users should be able to apply updates if your project sells ready-made devices
- All components/platforms used must have an ``id`` specified so users can easily refer to,
  :ref:`config-packages_extend` and/or :ref:`config-packages_remove` configuration variables should they choose to
  "take control"
- Your project supports adoption via the ``dashboard_import`` feature of ESPHome (see
  :doc:`Sharing </guides/creators>`). In particular:

    - There are **no** references to secrets or passwords
    - Network configuration must assume defaults (no static IPs or DNS configured)
    - The configuration **must** be valid, compile and run successfully *without any user changes* after adopting it.
    - Use of remote packages in the YAML is permitted only if the above criteria are met.

- Your product name cannot contain "**ESPHome**" except in the case of *ending with* "**for ESPHome**"

When your project meets the requirements
----------------------------------------

- Create a new pull request in our `esphome-devices <https://github.com/esphome/esphome-devices/pulls>`__ repository to
  add your device on the `devices website <https://devices.esphome.io>`__. We will review and merge this PR upon
  confirming that your project meets all of the requirements listed above.
- Apply for permission to carry the logo by emailing esphome@openhomefoundation.org -- **include a link to the PR** you've
  created (as above) so we can associate your application with your PR and device(s).
- We will review your application and reply to your email. We may request changes to your project if we find it does
  not quite meet one or more of the requirements above. If we find everything is in order, we will approve your project.

Logos
-----

After your project is approved, you may use these logos on your product and/or its packaging.

.. raw:: html

    <style>
        .transparent-background img {
            background: repeating-conic-gradient(#999 0% 25%, transparent 10% 50%) 50% / 10px 10px;
        }
    </style>

.. figure:: /_static/made-for-esphome-black-on-white.svg
    :align: center
    :width: 100%
    :class: transparent-background

    Made with ESPHome black on white (`svg </_static/made-for-esphome-black-on-white.svg>`__, `png </_static/made-for-esphome-black-on-white.png>`__)

.. figure:: /_static/made-for-esphome-white-on-black.svg
    :align: center
    :width: 100%
    :class: transparent-background

    Made with ESPHome white on black (`svg </_static/made-for-esphome-white-on-black.svg>`__, `png </_static/made-for-esphome-white-on-black.png>`__)

.. figure:: /_static/made-for-esphome-black-on-transparent.svg
    :align: center
    :width: 100%
    :class: transparent-background

    Made with ESPHome black on transparent (`svg </_static/made-for-esphome-black-on-transparent.svg>`__, `png </_static/made-for-esphome-black-on-transparent.png>`__)

.. figure:: /_static/made-for-esphome-white-on-transparent.svg
    :align: center
    :width: 100%
    :class: transparent-background

    Made with ESPHome white on transparent (`svg </_static/made-for-esphome-white-on-transparent.svg>`__, `png </_static/made-for-esphome-white-on-transparent.png>`__)
