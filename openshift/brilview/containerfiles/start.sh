#!/bin/bash
telegraf &
/opt/brilconda/bin/brilview --config /brilview_tmp/brilview_openshift_prod.yaml
