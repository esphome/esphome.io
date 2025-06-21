``round_to_multiple_of``
************************

Rounds the value to the nearest multiple. Takes a float greater than zero.

.. code-block:: yaml

    - platform: ...
      filters:
        - round_to_multiple_of: 10
        # 123 -> 120
        # 126 -> 130

    - platform: ...
      filters:
        - round_to_multiple_of: 0.25
        # 3.1415 -> 3.25
        # 1.6180 -> 1.5


