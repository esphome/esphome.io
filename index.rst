.. title:: ESPHome

.. meta::
    :google-site-verification: Q5q5TFbCofxA8-cSa1Frv5Hj4RopF5zwEZf_zaNHqf4

.. seo::
    :description: ESPHome Homepage - Reimagining DIY Home Automation. ESPHome is a framework that
      tries to provide the best possible use experience for using IoT microcontrollers
      for Home Automation. Just write a simple YAML configuration file and get your own customized firmware.
    :image: logo.svg

.. image:: images/logo-text.svg
    :class: logo

ESPHome is a system which allows you to turn common microcontrollers into smart home devices.

.. image:: images/hero.png

It uses `YAML <https://en.wikipedia.org/wiki/YAML>`__ configuration files and, based on the content of these file(s),
it creates custom firmware which you can then install directly onto your device.

Hardware defined in the configuration--such as sensors, switches, lights, and so on--will automatically appear in
`Home Assistant's <http://home-assistant.io>`__ user interface or can be made available via a simple web user interface
or MQTT.

.. raw:: html

    <div class="guide-container">
        <div class="guide-card">
            <h3 class="guide-card-title">Getting started</h3>
            <ul>
                <li>
                    <a class="reference" href="/guides/getting_started_hassio.html">
                        from Home Assistant
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/getting_started_command_line.html">
                        using the command line
                    </a>
                </li>
                <li>
                    <a class="reference" href="/projects/">
                        install ready-made project
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/migrate_sonoff_tasmota.html">
                        by migrating from Tasmota
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/faq.html">
                        FAQ and Tips
                    </a>
                </li>
            </ul>
            <div class="example highlight">
                <pre>
                    <span class="nt">esphome</span><span class="p">:</span>
                    <span class="w">&nbsp;&nbsp;</span><span class="nt">name</span><span class="p">:</span><span class="w"> </span><span class="l l-Scalar l-Scalar-Plain">awesome</span>
                    <span class="nt">esp32</span><span class="p">:</span>
                    <span class="w">&nbsp;&nbsp;</span><span class="nt">board</span><span class="p">:</span><span class="w"> </span><span class="l l-Scalar l-Scalar-Plain">nodemcu-32s</span>
                </pre>
            </div>
        </div>
        <div class="guide-card">
            <h3 class="guide-card-title">Next steps</h3>
            <ul>
                <li>
                    <a class="reference" href="/components/index.html">
                        Documentation
                    </a>
                </li>
                <li>
                    <a class="reference" href="/automations/index.html">
                        Automations
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/configuration-types.html">
                        Configuration types
                    </a>
                </li>
                <li>
                    <a class="reference" href="https://devices.esphome.io/">
                        Device configuration examples
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/diy.html">
                        DIY Examples
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/creators.html">
                        Sharing ESPHome devices
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/made_for_esphome.html">
                        Made for ESPHome program
                    </a>
                </li>
            </ul>
        </div>
        <div class="guide-card">
            <h3 class="guide-card-title">Keeping up</h3>
            <ul>
                <li>What's new?</li>
                <ul>
                    <li>
                        <a class="reference" href="/changelog/index.html">
                            Changelog
                        </a>
                    </li>
                </ul>
                <li>Community/Social</li>
                <ul>
                    <li>
                        <a class="reference" href="https://discord.gg/KhAMKrd" target="_blank">
                            Discord
                        </a>
                    </li>
                    <li>
                        <a class="reference" href="https://community.home-assistant.io/c/esphome/" target="_blank">
                            Forums
                        </a>
                    </li>
                </ul>
                <li>Development</li>
                <ul>
                    <li>
                        <a class="reference" href="/guides/contributing.html">
                            Contributing
                        </a>
                    </li>
                    <li>
                        <a class="reference" href="/guides/supporters.html">
                            Supporters
                        </a>
                    </li>
                </ul>
            </ul>
        </div>
    </div>

.. _device_database:

Device Database
---------------

You will find configurations for specific devices in our `ESPHome Devices <https://devices.esphome.io/>`__ database.

.. _documentation:

Documentation
-------------

You will find all :doc:`ESPHome documentation here<components/index>`.

.. _contributing:

Contributing
------------

ESPHome depends on and welcomes contributions from our community. If you'd like to contribute, please see
:doc:`Contributing <guides/contributing>`.

.. toctree::
    :hidden:

    web-api/index
    automations/index
    components/index
    cookbook/index
    guides/index
    changelog/index
    images/index
    projects/index
