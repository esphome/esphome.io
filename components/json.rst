json Component
==============

.. seo::
    :description: Instructions for parsing and building json within ESPHome.
    :keywords: json

The ``json`` component enables ESPHome to work with JSON data in automations, sensors, and HTTP requests. This is particularly useful for:

- Processing API responses
- Sending structured data to external services
- Parsing configuration from JSON files

What is JSON?

JSON is a text syntax that facilitates structured data interchange between all programming languages. JSON
is a syntax of braces, brackets, colons, and commas that is useful in many contexts, profiles, and applications.
JSON stands for JavaScript Object Notation and was inspired by the object literals of JavaScript aka
ECMAScript as defined in the ECMAScript Language Specification, Third Edition.
- https://ecma-international.org/wp-content/uploads/ECMA-404_2nd_edition_december_2017.pdf

Example 1: Relatively complex JSON::

  {
   "first_name": "John",
   "last_name": "Smith",
   "is_alive": true,
   "age": 27,
   "address": {
     "street_address": "21 2nd Street",
     "city": "New York",
     "state": "NY",
     "postal_code": "10021-3100"
   },
   "phone_numbers": [
     {
       "type": "home",
       "number": "212 555-1234"
     },
     {
       "type": "office",
       "number": "646 555-4567"
     }
   ],
   "children": [
     "Catherine",
     "Thomas",
     "Trevor"
   ],
   "spouse": null
  }

Example 2: Simple JSON::
 {"key": 42.0, "greeting": "Hello World"}

Parsing JSON:
-------------

Building JSON:
--------------

Building JSON in a lambda::
 on_...:
   - http_request.post:
       url: https://esphome.io
       json: |-
         root["key"] = id(my_sensor).state;
         root["greeting"] = "Hello World";

This will send::
 {"key": 42.0, "greeting": "Hello World"}



