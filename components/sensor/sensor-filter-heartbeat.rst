``heartbeat``
*************

Send the value periodically with the specified time interval.
If the sensor value changes during the interval the interval will not reset.
The last value of the sensor will be sent.

So a value of ``10s`` will cause the filter to output values every 10s regardless
of the input values.

