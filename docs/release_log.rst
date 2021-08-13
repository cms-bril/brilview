Release log
===========

1.3
-----

1.3.10
^^^^^

2021-08-13

* Fixed per bunch luminosity chart. Set the negative values to zero instead of ignoring them.

1.3.9
^^^^^

2021-08-09

* Moved to new repository


1.3.3
^^^^^

2018-10-26

* Fix web client hang when calculating lumi unit and max value is <=0


1.3.2
^^^^^

2018-04-25

* Add BCM1FSI lumi type


1.3.1
^^^^^

2018-01-23

* Add total luminosity sorting by time (for output by normtag files)
* Fix RUN/FILL separators


1.3.0
^^^^^

2018-01-17

* Add per bunch luminosity inspector component
* Add live bestlumi component
* Add ATLAS luminosity component
* Add support for normtag files from ``/cvmfs/cms-bril.cern.ch/cms-lumi-pog/Normtags``
* Add pileup chart to total luminosity inspector


1.2
-----

1.2.0
^^^^^

2017-06-28

* Add Y axis zoom shortcut to 0-3 for ratios
* Add stats calculation for "in view" data
* Add ratio permutator
* Add support for multiple comma separated iovtags


1.1
-----

1.1.1
^^^^^

2017-06-21

* Add HFET to luminosity types (sources)

1.1.0
^^^^^

2017-04-21

* Add stats calculator for chart series
* Add normtag autocomplete
* Make chart editable (titles, legends)


1.0
-----

1.0.1
^^^^^

2017-04-11

Fix csv download after some data is removed from memory

1.0.0
^^^^^

2017-04-10

Initial features:

* Query total luminosity from brilcalc
* Plot queried data

  * Luminosity over time
  * Cumulative luminosity over time
  * Luminosity ratios over time

* Download queried data as CSV
