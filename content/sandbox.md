---
description: "This is just a sandbox for new solutions build for ESPHome's Hugo webserver."
title: "ESPHome - Sandbox testing page"
params:
  seo:
    description: ESPHome - Smart Home Made Simple. This is just a sandbox for new solutions build for ESPHome's Hugo webserver.
    image: logo.svg
---

## test

<table class="table table-sm">
  <thead>
    <tr>
      <th scope="col">Variable</th>
      <th scope="col">Req.</th>
      <th scope="col">Type</th>
      <th scope="col">Default</th>
      <th scope="col">Discription</th>
    </tr>
  </thead>
  <tbody class="table-group-divider">
    <tr>
      <th scope="row">mode</th>
      <td>Opt.</td>
      <td>enum</td>
      <td><code>quad</code></td>
      <td>Defines the operating mode the PSRAM should utilize. One of
        <code>quad</code> or <code>octal</code>.</td>
    </tr>
    <tr>
      <th scope="row">speed</th>
      <td>Opt.</td>
      <td>int</td>
      <td><code>40MHz</code></td>
      <td>The speed at which the PSRAM should operate. One of
        <code>40MHz</code>, <code>80MHz</code> or
        <code>120MHz</code>.</td>
    </tr>
    <tr>
      <th scope="row">enable_ecc</th>
      <td><em>Opt.</em></td>
      <td>bool</td>
      <td><code>false</code></td>
      <td>For octal mode, enable ECC (Error Correction Code) for the
        PSRAM. ECC is a method of detecting and correcting
        single-bit errors in memory. It will reduce the available
        PSRAM size and speed by 1/16th, but also increases the rated
        temperature range of some ESP32 modules.</td
      >
    </tr>
    <tr>
      <th scope="row">disabled</th>
      <td><em>Opt.</em></td>
      <td>bool</td>
      <td><code>false</code></td>
      <td>Don’t try to initialize the PSRAM. This is needed if one of
        the configured components autoloads psram but the ESP32
        module doesn’t have PSRAM and you need to use one of the
        PSRAM control lines for something else. e.g. ethernet.</td>
    </tr>
  </tbody>
  <thead>
    <tr>
      <td colspan="5" scope="col">Automations:</td>
    </tr>
  </thead>
  <tbody  class="table-group-divider">
    <tr>
      <th scope="row">on_boot</th>
      <td><em>Opt.</em></td>
      <td colspan="2">Automation</td>
      <td>An automation to perform when the node starts. See <em>on_boot</em></td>
    </tr>
    <tr>
      <th scope="row">on_shutdown</th>
      <td><em>Opt.</em></td>
      <td colspan="2">Automation</td>
      <td>An automation to perform right before the node shuts down. See <em>on_shutdown</em></td>
    </tr>
    <tr>
      <th scope="row">on_loop</th>
      <td><em>Opt.</em></td>
      <td colspan="2">Automation</td>
      <td>An automation to perform on each loop() iteration. See <em>on_loop</em>.</td>
    </tr>
  </tbody>
  <tfoot>
    <td colspan="5" scope="col">All other variables from: <em>Sensor</em></td>
  </tfoot>
</table>
