---
description: "Instructions for setting up CoAP Clients in ESPHome"
title: "CoAP Client"
params:
  seo:
    description: "A component that enables ESPHome devices to send CoAP (RFC7252) GET/POST requests to remote CoAP servers."
    image: connection.svg
---

The `coap_client` component lets you send CoAP (RFC7252) GET/POST requests to remote CoAP servers.

```yaml
# Example configuration entry
coap_client:
```

## Overview

The **CoAP Client** component allows an ESPHome device to send [CoAP](https://datatracker.ietf.org/doc/html/rfc7252) messages to remote CoAP servers over UDP.  
This is useful for integrating ESPHome devices with:

- Constrained IoT devices/sensors
- CoAP-enabled home automation systems
- Local microcontrollers using lightweight UDP messaging
- Any endpoint that exposes CoAP resources (GET/POST/etc.)

This component uses [libCoap](https://libcoap.net/) via [espressif/coap](https://components.espressif.com/components/espressif/coap/versions/4.3.5~3/readme).  Please refer to the links for all license requirements

This component provides an easy YAML interface and Actions usable from automations and lambda blocks.

{{< anchor "coap_client-configuration_variables" >}}

## Configuration variables

- **id** (*Optional*, [ID](/guides/configuration-types#id)): Manually specify the ID used for code generation.
- **max_block_size** (*Optional*, bytes): Maximum size of payload for a given datagram packet.  Packet size is larger since it includes the header.  Maxium value is 1024B, defaults to 512B.
- **ack_timeout** (*Optional*, duration): The initial number of seconds to wait for an acknowledgment (ACK) or a response to a Confirmable (CON) message,defaults to 2 seconds.
- **max_retransmit** (*Optional*, integers): The maximum number of times a Confirmable message is retransmitted before the library stops sending it and signals a failure, defaults to 4 attempts.

## Actions

The `coap_client` component supports a number of [actions](/automations/actions#all-actions) that can be used to send coap requests.

{{< anchor "coap_client-get_action" >}}

### `coap_client.get` Action

This [action](/automations/actions#all-actions) sends a GET Request. Providing a request_name allows the later use of stop (when observe = true), resume (observe = true), and remove.
If you send again to the same request_name, then the stored request is overwritten and the CoAP Session is reused.  It is the responsibility of the caller to ensure the url does not change scheme or destination and that the resource
does not require a different credential requirement.

If request_name is not provided, a temporary name is assigned and the request is deleted from storage after timeout or response.  In the case of observe=true, the request is stored until timeout or stop action with pause = false.

```yaml
on_...:
  then:
    - coap_client.get:
        url: coap://example-server.com/test
  # Short form
    - coap_client.get: coap://example-server.com/test
```

#### Configuration variables

- **url** (**Required**, string, [templatable](/automations/templates)): URL to which to send the Request.
- **request_name** (**Optional**, string): Name the request, usable when removing the observe Request.
- **capture_response** (*Optional*, boolean): when set to `true`, the response data will be captured and placed into
  the `payload` variable as a `std::string` for use in [lambdas](/automations/templates#config-lambda). Defaults to `false`.
- **response_timeout** (*Optional*, duration): Time client will wait for a response before removing the request.  Defaults to 4 seconds.
- **observe** (*Optional*, boolean): when set to `true` and url points to an observable resource, the system will continue to accept responses
- **max_response_buffer_size** (*Optional*, integer): The maximum buffer size to be used to store the response. Defaults to `1 kB`.
- **on_response** (*Optional*, [Automation](/automations)): An automation to perform after the Request is received.
- **on_error** (*Optional*, [Automation](/automations)): An automation to perform if the Request cannot be completed.

{{< anchor "coap_client-post_action" >}}

### `coap_client.post` Action

This [action](/automations/actions#all-actions) sends a POST Request.

```yaml
on_...:
  then:
    - coap_client.post:
        request_name: "post example"
        url: coap://example-server.com/test
        payload:"this is a post"
  # Short form
    - coap_client.post: CoAPs://esphome.io
```

#### Configuration variables

- **media_type** (*Optional, string): Type of payload sent, defaults to text/plain or application/json.
- **payload** (*Optional*, string, [templatable](/automations/templates)): A CoAP payload string to send with Request.
- **json** (*Optional*, mapping): A CoAP payload in JSON format. Values are [templatable](/automations/templates).
- All other options from [`coap_client.get` Action](#coap_client-get_action).

{{< anchor "coap_client-send_action" >}}

### `coap_client.send` Action

This [action](/automations/actions#all-actions) sends a Request.  

```yaml
on_...:
  then:
    - coap_client.send:
        request_name: "send example"
        method: PUT
        media_type: "application/json"
        url: coap://example-server.com/test
```

#### Configuration variables

- **method** (**Required**, string): CoAP method to use (`GET`, `POST`, `PUT`, `DELETE`, `FETCH`, `PATCH`, `IPATCH`  ).
- All other options from [`coap_client.post` Action](#coap_client-post_action) and [`coap_client.get` Action](#coap_client-get_action).

{{< anchor "coap_client-stop_action" >}}

### `coap_client.stop` Action

This [action](/automations/actions#all-actions) stops an observe Request

```yaml
on_...:
  then:
    - coap_client.stop:
        request_name: "Test Observe"
        # keep in storage
        pause: true
  # Short form
    - coap_client.stop: "Test Observe"
```

#### Configuration variables

- **request_name** (**Required**, string): Name the request, usable when removing the observe Request.
- **pause** (**Optional**, bool): if true, keep request in storage for future resume or send.  Defaults to True

{{< anchor "coap_client-resume_action" >}}

### `coap_client.resume` Action

This [action](/automations/actions#all-actions) resumes an observe Request that was pause=true when stopped.

```yaml
on_...:
  then:
    - coap_client.resume:
        request_name: "Test Observe"
  # Short form
    - coap_client.resume: "Test Observe"
```

#### Configuration variables

- **request_name** (**Required**, string): Name the request, usable when removing the observe Request.  If not provided, then all observe requests are removed.

{{< anchor "coap_client-remove_action" >}}

### `coap_client.remove` Action

This [action](/automations/actions#all-actions) removes a stored request, if request is observe=true, then it must be stopped prior to remove.

```yaml
on_...:
  then:
    - coap_client.remove:
        request_name: "Test Observe"
  # Short form
    - coap_client.remove: "Test Observe"
```

#### Configuration variables

- **request_name** (**Required**, string): Name the request, usable when removing the observe Request.  If not provided, then all observe requests are removed.

## Triggers

{{< anchor "coap_client-on_response" >}}

### `on_response` Trigger

This automation will be triggered when the CoAP Client is complete.  If the Request had observe set to `true` and the server resource was observable, then it will keep responding on a schedule defined by the server.
The following variables are available for use in [lambdas](/automations/templates#config-lambda):

- `response` as a pointer to `CoapResponseStatistics` object which contains `content_length`, `status_code` and `duration_ms``.
- `request_name` as std::string, an unique number as a std::string is provided when no request_name is configured.
- `payload` as `std::string` which contains the response payload when `capture_response`
  (see [`coap_client.get` Action](#coap_client-get_action)) is set to `true`.

> [!NOTE]
> The `status_code` should be checked before using the `payload` variable. A successful response will have
> a status code in the `200's`. Server errors such as "not found" (404) or "internal server error" (500) will have an appropriate status code, and may contain an error message in the `payload` variable.

```yaml
on_...:
  then:
    - delay: 5 sec
    - coap_client.get:
        request_name: "Test Observe"
        url: coap://example-server.com/obs
        capture_response: true
        response_timeout: 10sec
        observe: true
        on_response:
          then:
            - logger.log:
                format: '%s Response status: %d, Duration: %u ms, %s'
                args:
                  - request_name.c_str()
                  - response->status_code
                  - response->duration_ms
                  - payload.c_str()
```

### POST Payload in JSON format (syntax 1)

**Note:** all values of the map must be strings. It is not possible to send JSON `boolean` or `numbers` with this
syntax.

```yaml
on_...:
  - coap_client.post:
      url: coap://example-server.com/test
      json:
        key: !lambda |-
          return id(my_sensor).state;
        greeting: "Hello World"

    # Will send:
    # {"key": "42.0", "greeting": "Hello World"}
```

### POST Payload in JSON format (syntax 2)

**Note:** use this syntax to send `boolean` or `numbers` in JSON.

The JSON message will be constructed using the [ArduinoJson](CoAPs://github.com/bblanchon/ArduinoJson) library.
In the `json` option you have access to a `root` object which represents the base object of the JSON message. You
can assign values to keys by using the `root["KEY_NAME"] = VALUE;` syntax as shown below.

```yaml
on_...:
  - coap_client.post:
      url: coap://example-server.com/test
      json: |-
        root["key"] = id(my_sensor).state;
        root["greeting"] = "Hello World";

    # Will send:
    # {"key": 42.0, "greeting": "Hello World"}
```

### GET values from a JSON payload response

If you want to retrieve the value for the vol key and assign it to a template sensor or number component whose id is
set to player_volume you can do this, but note that checking for the presence of the key will prevent difficult-to-read
error messages:

This example assumes that the server returns a response as a JSON object similar to this:
`{"status":"play","vol":"42","mute":"0"}`

If you want to retrieve the value for the `vol` key and assign it to a template `sensor` or `number` component
whose `id` is set to `player_volume`  :

```yaml
on_...:
- coap_client.get:
    url: coap://example-server.com/test
    capture_response: true
    on_response:
      then:
        - if:
            condition:
                lambda: return response->status_code == 205;
            then:
                - lambda: |-
                    json::parse_json(payload, [](JsonObject root) -> bool {
                        if (root["vol"]) {
                            id(player_volume).publish_state(root["vol"]);
                            return true;
                        }
                        else {
                          ESP_LOGI(TAG,"No 'vol' key in this json!");
                          return false;
                        }
                    });
            else:
                - logger.log:
                    format: "Error: Response status: %d, message %s"
                    args: [ 'response->status_code', 'payload.c_str()' ]
```

## Programatic Integration

Example code for usage within another component

```cpp
    //unique_ptr is required
    std::unique_ptr<CoapClientRequestData> tx_request = std::make_unique<CoapClientRequestData>();
    tx_request->name = this->request_name;
    tx_request->method = CoapMethod::POST
    tx_request->uri = this->url;
    tx_request->callback = callback;
    tx_request->callback_context = this;
    tx_request->media_type = CoapMediaType::TEXT_PLAIN;
    tx_request->payload = this->payload;
    tx_request->response_timeout = this->response_timeout;
    tx_request->observe = this->observe;
    global_coap_client->process_request(std::move(tx_request)); // Move is required!
```

Create a callback for the response information

- **response_code** - 205 is good!, anything outside of 200's is an error. 0 is response timeout.
- **data** - payload returned.
- **len** - of the data.
- **offset** - in case the data is returned in blocks.
- **total** - isn't trustworthy till last block when len + offset = total.
- **context** - the provided callback_context.

If len, offset, and total are all 0 when there is a response timeout or other response error.
if response is in blocks, then your code is responsible for assembly.

```cpp
static void callback(uint16_t response_code, const unsigned char *data, size_t len, size_t offset, size_t total, void *context) {
 \\... Your Code Here
}
```

## See Also

- {{< docref "index/" >}}
- {{< apiref "coap_client/coap_client.h" "coap_client/coap_client.h" >}}
- {{< docref "/components/json" >}}
