#!/bin/bash
# Update brilview Angular app
rm -rf /client_files_for_serving/*
cp -R dist/* /client_files_for_serving/
# Run brilview server
telegraf &
/opt/brilconda/bin/brilview --config /brilview_tmp/brilview_openshift_prod.yaml
