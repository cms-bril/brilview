Release log
===========

1.5
-----
1.5.10
^^^^^
2023-07-22

* Add new input form to CMS lumi queries for the connection mode.
* Update the backend to handle the the connection mode value

1.5.9
^^^^^
2023-07-12

* Add cache to ATLAS luni chart.

1.5.8
^^^^^
2023-07-12

* Improved error messaging for the ATLAS lumi chart when the fillnum of
  the queried luminosity for CMS mismatches the fillnum of the queried ATLAS lumi.

1.5.7
^^^^^
2023-07-06

* resuse same sql engine for DB accesses

1.5.5
^^^^^
2023-01-20

* functionality for parsing datatag name from brilcalc response

1.5.4
^^^^^
2023-01-19

* New totlumi UI form with datatag input field
* Updated backend handler for datatag extension
* New functionality of retrieving the datatags from DB

1.5.0
^^^^^
2023-01-16

* Update brilws version to 3.6.9
* Fixed displayed error message
* Updated bxlumi options
  * new forms for bxid, bxthreshlod and bxmin
  * updated backend handler

1.4
-----
1.4.11/12
^^^^^

2022-08-31

* Fixed ATLAS lumi queries for the atlaslumi plot

1.4.10
^^^^^

2022-08-30

* Added sanitization check for NaN values for bestlumi

1.4.9
^^^^^

2022-08-10

* Removed 'BCM1FSI' luminosity type

1.4.8
^^^^^

2022-08-10

* New 'BCM1FUTCA' luminosity type

1.4.7
^^^^^

2022-08-08

* New 'RAMSES' luminosity type
* Updated build_brilview_client.sh to fetch last client version from git

1.4.6
^^^^^

2022-08-01

* Fixed client-compiler build script confliction
* Updated docs


1.4.5
^^^^^

2022-03-16

* Fixed deployment for new okd4


1.4.4
^^^^^

2021-12-13

* Fixed Normtags, server and client side.

1.4.3
^^^^^

2021-11-24

* Updated nodejs in dockerfile and 
* Update deploy script to works with node 12

1.4.2
^^^^^

2021-11-23

* Fixed calendar date selector view to display and change the month.

1.4.1
^^^^^

2021-11-16

* Updated brilws to fix database parsing problem

1.4.0
^^^^^

2021-08-25

* Updated to Python 3


1.3
-----

1.3.10
^^^^^

2021-08-16

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
