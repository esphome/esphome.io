---
description: "Instructions for setting up template text sensors in ESPHome"
title: "Template Text Sensor"
params:
  seo:
    description: Instructions for setting up template text sensors in ESPHome
    image: description.svg
---

The `template` text sensor platform allows you to create a text sensor with templated values
using [lambdas](/automations/templates#config-lambda).

```yaml
# Example configuration entry
text_sensor:
  - platform: template
    name: "Template Text Sensor"
    lambda: |-
      return {"Hello World"};
    update_interval: 60s
```

Possible return values for the lambda:

- `return {"STRING LITERAL"};` the new value for the sensor of type `std::string`. **Has to be** in
   brackets `{}`  !

- `return {};` if you don't want to publish a new state (advanced).

## Configuration variables

- **lambda** (*Optional*, [lambda](/automations/templates#config-lambda)):
  Lambda to be evaluated every update interval to get the new value of the text sensor

- **update_interval** (*Optional*, [Time](/guides/configuration-types#time)): The interval to check the
  text sensor. Set to `never` to disable updates. Defaults to `60s`.

- All other options from [Text Sensor](/components/text_sensor#config-text_sensor).

{{< anchor "text_sensor-template-publish_action" >}}

## `text_sensor.template.publish` Action

You can also publish a state to a template text sensor from elsewhere in your YAML file
with the `text_sensor.template.publish` action.

```yaml
# Example configuration entry
text_sensor:
  - platform: template
    name: "Template Text Sensor"
    id: template_text

# in some trigger
on_...:
  - text_sensor.template.publish:
      id: template_text
      state: "Hello World"

  # Templated
  - text_sensor.template.publish:
      id: template_text
      state: !lambda 'return "Hello World";'
```

Configuration options:

- **id** (**Required**, [ID](/guides/configuration-types#id)): The ID of the template text sensor.
- **state** (**Required**, string, [templatable](/automations/templates)):
  The state to publish.

> [!NOTE]
> This action can also be written in lambdas:
>
> ```cpp
> id(template_text).publish_state("Hello World");
> ```

## Useful Template Sensors

Here are some useful text sensors for debugging and tracking project info.

```yaml
# Example configuration entry
text_sensor:
  - platform: template
    name: "ESPHome Project Version"
    id: esphome_project_version_text_short
    icon: "mdi:information-box"
    entity_category: "diagnostic"
    update_interval: 600s
    lambda: |-
      return { ESPHOME_PROJECT_VERSION };

  - platform: template
    name: "ESPHome Project Version Detailed"
    id: esphome_project_version_text_detailed
    icon: "mdi:information-box"
    entity_category: "diagnostic"
    update_interval: 600s
    lambda: |-
      return { ESPHOME_PROJECT_VERSION " " + App.get_compilation_time() };

  - platform: template
    name: "ESPHome Project Name"
    id: esphome_project_name
    icon: "mdi:information-box"
    entity_category: "diagnostic"
    update_interval: 600s
    lambda: |-
      return { ESPHOME_PROJECT_NAME };

  - platform: template
    name: "Example Datetime"
    id: example_datetime_text_sensor
    icon: "mdi:calendar-clock"
    device_class: "timestamp"
    update_interval: 5s
    lambda: |-
      auto t = id(example_datetime).state_as_esptime();
      // This handles getting the timezone offset as well
      int32_t offset_sec = ESPTime::timezone_offset();  // seconds
      char sign = offset_sec >= 0 ? '+' : '-';
      offset_sec = abs(offset_sec);
      int hours = offset_sec / 3600;
      int minutes = (offset_sec % 3600) / 60;
      char buf[40];
      snprintf(
        buf,
        sizeof(buf),
        "%s%c%02d:%02d",
        t.strftime("%Y-%m-%dT%H:%M:%S").c_str(),
        sign,
        hours,
        minutes
      );
      return std::string(buf);

  - platform: template
    name: "Example Date as Datetime"
    id: example_date_as_datetime_text_sensor
    icon: "mdi:calendar-clock"
    device_class: "timestamp"
    update_interval: 5s
    lambda: |-
      auto t = id(example_date).state_as_esptime();
      // This handles getting the timezone offset as well
      int32_t offset_sec = ESPTime::timezone_offset();  // seconds
      char sign = offset_sec >= 0 ? '+' : '-';
      offset_sec = abs(offset_sec);
      int hours = offset_sec / 3600;
      int minutes = (offset_sec % 3600) / 60;
      char buf[40];
      snprintf(
        buf,
        sizeof(buf),
        "%s%c%02d:%02d",
        t.strftime("%Y-%m-%dT00:00:00").c_str(),
        sign,
        hours,
        minutes
      );
      return std::string(buf);

  - platform: template
    name: "Example Date"
    id: example_date_text_sensor
    icon: "mdi:calendar"
    device_class: "date"
    update_interval: 5s
    lambda: |-
      auto d = id(example_date).state_as_esptime();
      return d.strftime("%Y-%m-%d");
```

## See Also

- {{< docref "/components/text_sensor" >}}
- [Automation](/automations)
- {{< apiref "template/text_sensor/template_text_sensor.h" "template/text_sensor/template_text_sensor.h" >}}
