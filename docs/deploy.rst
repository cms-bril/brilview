Deploy
======

Central Brilview is hosted at CERN PaaS: https://paas.cern.ch

All instructions bellow assume that you are inside ``openshift`` directory of
the Brilview project.

Log in to CERN Openshift
------------------------

There are two ways to log in to CERN PaaS server.

A) From host, e.g. lxplus, where oc plugin sso-login is installed:

.. highlight:: bash
::
    oc sso-login --server https://api.paas.okd.cern.ch

The oc sso-login plugin (python) can be installed with:

.. highlight:: bash
::
    pip install -r  https://gitlab.cern.ch/paas-tools/oc-sso-login/-/raw/master/requirements.txt?ref_type=heads

B) An alternative to oc sso-login is to login with token:
Go to https://paas.cern.ch, go to your username in top right corner then "Copy login command".
The press "Display Token" and copy and paste the full command.

Login without 2FA:
.. highlight:: bash
::

  oc login https://api.paas.okd.cern.ch/ -u <username>

Openshift 4 - Playground:
.. highlight:: bash
::

  oc login https://api.paas-stg.okd.cern.ch/ -u <username>

First time setup for Openshift 4
----------------

Project Creation
^^^^^^^^^^^^^^^^

Go to https://webservices.web.cern.ch/webservices/ and "Web Application & Site Hosting" as "PaaS - Platform-as-a-Service, Application Hosting" and click "Try out" button.

Select "Official", add "Project name" and "Project description".

Note: More information in the below link
https://paas.docs.cern.ch/1._Getting_Started/1-create-paas-project/

Create CVMFS volume claim
^^^^^^^^^^^^^^^^^^^^^^^^^

Go to project web console https://paas.cern.ch/k8s/cluster/projects/brilview/

1. Click on 3 lines in top left corner and change profile "Developer" to "Administrator".
2. "Storage" -> "PersistentVolumeClaims" -> "Create PersistentVolumeClaims".
3. Fill the form:

   a. "Storage Class": cvmfs
   b. "Name": cvmfs-bril
   c. "Access Mode": Read Only (ROX) or Read Write Many (RWX)
   d. "Size": 1 MiB

      See https://paas.docs.cern.ch/3._Storage/cvmfs/

3. Click "Create"

Deploy Brilview containers
^^^^^^^^^^^^^^^^^^^^^^^^^^

.. highlight:: bash
::

  oc apply -f brilview/template.yaml
  oc start-build brilview-server-bc --from-dir=brilview
  oc apply -f grafana-influxdb/template.yaml
  oc start-build grafana-influxdb-bc --from-dir=grafana-influxdb
  oc apply -f nginx/template.yaml
  oc start-build nginx-bc --from-dir=nginx

Do not worry if nginx container is "crashing frequently" until client files are
compiled. Health check fails until nginx can serve index file.

Add CERN SSO
^^^^^^^^^^^^

Go to project web console https://paas.cern.ch/k8s/cluster/projects/brilview/
as a "Developer":

1. Click in "+Add"
2. Click on "Add to Project" (book with +) and search for "sso" and click on "Create"
3. In "Upstream Application" -> "Service definition" point to 
  a. SERVICE_NAME: nginx-service 
  b. Port: 8000
4. In "Routing Configuration" add "Public Application Hostname": brilview
5. In "Authentication Options" -> "Allowed Role" choose e-groups in AUTHORIZED_GROUPS (e.g. 'cern-users', 'cern-staff', 'CMS-BRIL-Project')
6. Click "Create"

https://paas.docs.cern.ch/4._CERN_Authentication/2-deploy-sso-proxy/

Note: cern-sso-proxy works with a site globally unique in cern domain.
If the requested website is already registered with other hosting service, e.g. AFS, EOS, the sso registration will fail.

Make Brilview public
^^^^^^^^^^^^^^^^^^^^

Change website visibility from "Intranet" to "Internet": https://cern.service-now.com/service-portal/article.do?n=KB0004359

Go to "Web Services site" and click on "Manage my websites"

Select the site you want to expose from the list of "My websites"

Click on "Site access & Permissions"

Choose between Internet and Intranet

Please note that websites of type 'Test' cannot be exposed outside the CERN network.

.. _update-client:
Updating web client
--------------------

Temporarily scale down ``brilview-server`` pods from 2 to 1 to free some resources
for client building, then scale up client-compiler from 0 to 1, watch logs, when
finished, scale client-compiler back to 0 and scale brilview-server back to 2.

Updating server & web client
---------------

For production deployment, the brilview code must have a version tag in the git repository, and the file /openshfit/brilview/Dockerfile should contain the new git tag. The tagging step is required in order to always trigger a docker image update.

::

  oc start-build brilview-server-bc --from-dir=brilview


Monitoring
----------

Find pod containing Grafana::

  oc get pods

Forward port 3000 to your machine::

  oc port-forward grafana-influxdb-dc-<some_identifiers_you_found_with_above_command> 3000

Visit ``localhost:3000``.

If it is the first time after a Grafana deployment, then login with user: ``admin`` and pass: ``admin`` and:

1. Add data source (name: ``my-influx``, type: ``InfluxDB``, url: ``http://localhost:8086``, access: ``proxy``, database: ``telegraf``)
2. Create whatever dashboard needed or import (copy/paste the text) from the file ``grafana-influxdb/dashboard.json``
3. Change host names for all graphs to match the ones returned by ``oc get pods`` by clicking Edit -> Metrics (Grafana queries influxdb and gives suggestions in dropdowns)

Tips
----

After successful build and deploy of new brilview into a it's pods scale down nginx pods to 0 and than back to 2 in order to clean cache.
