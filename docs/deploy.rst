==========
Deployment
==========

Central Brilview is hosted at CERN PaaS: https://paas.cern.ch

All instructions bellow assume that you are inside ``openshift`` directory of
the Brilview project.


Prerequisites
=============

Install `oc` command ( see https://paas.docs.cern.ch/1._Getting_Started/5-installing-cli/ ).

Log in to CERN Openshift
========================

There are two ways to log in to CERN PaaS server.

sso-login
---------

From host e.g. lxplus, where oc plugin sso-login is installed:

.. highlight:: bash
::

  oc sso-login --server https://api.paas.okd.cern.ch

The oc sso-login plugin (python) can be installed with:

.. highlight:: bash
::

  pip install -r  https://gitlab.cern.ch/paas-tools/oc-sso-login/-/raw/master/requirements.txt?ref_type=heads

token
---------

An alternative to oc sso-login is to login with token:
Go to https://paas.cern.ch, go to your username in top right corner then "Copy login command".
The press "Display Token" and copy and paste the full command.

users with 2FA disabled
-----------------------

Openshift 4:

.. highlight:: bash
::

  oc login https://api.paas.okd.cern.ch/ -u <username>

Openshift 4 - Playground:

.. highlight:: bash
::

  oc login https://api.paas-stg.okd.cern.ch/ -u <username>

Web GUI login
-------------

Use your CERN credentials to log in at https://paas.cern.ch (or https://paas-stg.cern.ch - playground)

First time setup for Openshift 4
================================

Project Creation
----------------

Go to https://webservices.web.cern.ch/webservices/ and "Web Application & Site Hosting" as "PaaS -
Platform-as-a-Service, Application Hosting" and click "Try out" button.

Select "Official", add "Project name" and "Project description".

Note: More information in the below link
https://paas.docs.cern.ch/1._Getting_Started/1-create-paas-project/

Create CVMFS volume claim
-------------------------

Go to project web console https://paas.cern.ch/k8s/cluster/projects/brilview/

1. Click on 3 lines in top left corner and change profile "Developer" to "Administrator".
2. "Storage" -> "PersistentVolumeClaims" -> "Create PersistentVolumeClaims".
3. Fill the form:

   - "Storage Class": ``cvmfs``
   - "Name": ``cvmfs-bril``
   - "Access Mode": ``Read Only (ROX) or Read Write Many (RWX)``
   - "Size": ``1 MiB``

   Note: For more details see https://paas.docs.cern.ch/3._Storage/cvmfs/

4. Click "Create"

Deploy Brilview containers
--------------------------

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
------------

Go to project web console https://paas.cern.ch/k8s/cluster/projects/brilview/
as a "Developer":

1. Click in "+Add"
2. Click on "Add to Project" (book with +) and search for "sso" and click on "Create"
3. In "Upstream Application" -> "Service definition" point to 
  - SERVICE_NAME: ``nginx-service``
  - Port: ``8000``
4. In "Routing Configuration":
  - "Public Application Hostname": ``brilview.web.cern.ch`` (this will be the public facing domain)
  - "Application Subpath": ``/``
  - "Internet Visibility": ✓
5. In "Authentication Options":
  - "Allowed Role": ``default-role`` (optionally you can choose e-groups in AUTHORIZED_GROUPS e.g. 'cern-users', 'cern-staff', 'CMS-BRIL-Project')
  - "Oauth Proxy Prefix": ``/oauth2``
6. Click "Create"
7. Wait a while (~3 min) until your domain will be reachable.

https://paas.docs.cern.ch/4._CERN_Authentication/2-deploy-sso-proxy/

Note: cern-sso-proxy works with a site globally unique in cern domain.
If the requested website is already registered with other hosting service, e.g. AFS, EOS, the sso
registration will fail.


Updating server (Python) & web client (Angular)
-----------------------------------------------

For production deployment, the brilview source code must have a version tag in the git repository,
and the file /openshfit/brilview/Dockerfile should contain this Git tag. The tagging step is required
in order to always trigger building docker image from right source code so do not forget to change tag
in Dockerfile!

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

1. Add data source:
    - name: ``my-influx``
    - type: ``InfluxDB``
    - url: ``http://localhost:8086``
    - access: ``proxy``
    - database: ``telegraf``
2. Create whatever dashboard needed or import (copy/paste the text) from the file ``grafana-influxdb/dashboard.json``
3. Change host names for all graphs to match the ones returned by ``oc get pods`` by clicking Edit -> Metrics (Grafana queries influxdb and gives suggestions in dropdowns)

Tips
----
If you occur any issue after building new image try to scale down a pod (or all pods) to 0 and then back to original value 1 or 2.

e.g. After successful build and deploy of new brilview into a it's pods scale down nginx pods to 0 and than back to 1 (or 2) in order to clean NGINX cache.
