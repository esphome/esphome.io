---
description: "Recipes for running ESPHome on a Linux host"
title: "Host controls and sensors"
params:
  seo:
    description: Recipes for running ESPHome on a Linux host
---

If you have a Debian system you can run ESPHome binary on it to control a couple of tasks and monitor some states using
`host` platform.

## Basic setup

```yaml
host:

api:
  encryption:
    key: !secret encryption_key

logger:
  level: DEBUG
```

## Read some data at start of binary

```yaml
esphome:
  name: host-test-shell
  name_add_mac_suffix: true
  on_boot:
    - lambda: |-
        auto result = esphome::host::execute_shell_command("ip -o -4 addr show | awk '$2!=\"lo\"{print $4}' | cut -d/ -f1");
        id(host_ip_address).publish_state(result.stdout_output);
    - lambda: |-
        auto result = esphome::host::execute_shell_command("cat /sys/class/dmi/id/product_name");
        id(host_model).publish_state(result.stdout_output);
```

## Text sensors

```yaml
text_sensor:
  - platform: template
    id: host_model
    icon: mdi:raspberry-pi
    name: "Model"
  - platform: template
    id: host_ip_address
    icon: mdi:ip-network
    name: "IP Addresses"
```

## Sensors

```yaml
sensor:
  - platform: template
    icon: mdi:radiator
    name: "CPU Temperature"
    state_class: measurement
    accuracy_decimals: 0
    lambda: |-
      auto result = esphome::host::execute_shell_command("cat /sys/class/thermal/thermal_zone0/temp");
      auto load_str = result.stdout_output;
      load_str.erase(std::remove_if(load_str.begin(), load_str.end(), ::isspace), load_str.end());
      auto parsed = parse_number<float>(load_str);
      if (!parsed.has_value()) {
        return NAN;
      }
      return parsed.value() / 1000;
  - platform: template
    name: "Load average"
    update_interval: 30s
    state_class: measurement
    accuracy_decimals: 2
    icon: mdi:cpu-64-bit
    lambda: |-
      auto result = esphome::host::execute_shell_command("awk '{print $1}' /proc/loadavg");
      auto load_str = result.stdout_output;
      load_str.erase(std::remove_if(load_str.begin(), load_str.end(), ::isspace), load_str.end());
      auto parsed = parse_number<float>(load_str);
      if (!parsed.has_value()) {
        return NAN;
      }
      return parsed.value();
  - platform: template
    name: "Free memory"
    state_class: measurement
    accuracy_decimals: 2
    icon: mdi:memory
    lambda: |-
      esphome::host::ShellCommandOptions opts;
      opts.environment = {
        {"LC_NUMERIC", "C"},
      };
      auto result = esphome::host::execute_shell_command("free | awk '/^Mem:/ {print ($7/$2)*100}'", opts);
      auto load_str = result.stdout_output;
      load_str.erase(std::remove_if(load_str.begin(), load_str.end(), ::isspace), load_str.end());
      auto parsed = parse_number<float>(load_str);
      if (!parsed.has_value()) {
        return NAN;
      }
      return parsed.value();
  - platform: template
    name: "System uptime"
    state_class: total_increasing
    device_class: duration
    unit_of_measurement: s
    entity_category: diagnostic
    accuracy_decimals: 0
    icon: mdi:timer-outline
    lambda: |-
      auto result = esphome::host::execute_shell_command("cut -d. -f1 /proc/uptime");
      auto load_str = result.stdout_output;
      load_str.erase(std::remove_if(load_str.begin(), load_str.end(), ::isspace), load_str.end());
      auto parsed = parse_number<float>(load_str);
      if (!parsed.has_value()) {
        return NAN;
      }
      return parsed.value();
  - platform: uptime
    name: "Executable Uptime"
    type: seconds
```

## Controls

```yaml
button:
  - platform: template
    name: "Reboot"
    on_press:
      - lambda: |-
          auto result = esphome::host::execute_shell_command("/sbin/reboot");

switch:
  - platform: template
    name: "Display"
    id: host_display_switch
    icon: mdi:monitor-shimmer
    optimistic: true
    restore_mode: DISABLED # or ALWAYS_ON
    turn_on_action:
      - lambda: |-
          esphome::host::ShellCommandOptions opts;
          opts.environment = {
            {"DISPLAY", ":0.0"},
          };
          auto result = esphome::host::execute_shell_command("xset dpms force on", opts);
    turn_off_action:
      - lambda: |-
          esphome::host::ShellCommandOptions opts;
          opts.environment = {
            {"DISPLAY", ":0.0"},
          };
          auto result = esphome::host::execute_shell_command("xset dpms force off", opts);

interval:
  - interval: 5s
    then:
      - switch.template.publish:
          id: host_display_switch
          state: !lambda |-
              esphome::host::ShellCommandOptions opts;
              opts.environment = {
                {"DISPLAY", ":0.0"},
              };
              auto result = esphome::host::execute_shell_command("xset -q | awk '/Monitor is/ {print $NF; exit}'", opts);
              auto load_str = result.stdout_output;
              load_str.erase(std::remove_if(load_str.begin(), load_str.end(), ::isspace), load_str.end());
              auto parsed = parse_on_off(load_str.c_str(), "On", "Off");
              if (parsed == esphome::PARSE_ON) {
                return true;
              }
              if (parsed == esphome::PARSE_OFF) {
                return false;
              }
              ESP_LOGW("host.shell", "Unable to parse monitor state from output: %s", load_str.c_str());
              return {};
```
