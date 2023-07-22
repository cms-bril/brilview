#!/bin/sh
if [ -d "brilview_src" ]; then
    rm -rf brilview_src/
fi
git config --global user.email "brilview-client-compiler"
git config --global user.name "brilview client compiler"
git clone --branch=1.5.10 https://github.com/cms-bril/brilview.git brilview_src
cd brilview_src/brilview/web
source ~/.bashrc 
node -v
npm install node-sass@4.12
#npm install --unsafe-perm
yarn install --ignore-engines
#rm -rf /client_files_for_serving/*
cp -R dist/* /client_files_for_serving/
echo "showing files"
ls /client_files_for_serving/
echo "Finished. Going to sleep."
echo "To update client again: scale down to 0 pods, then scale up to 1"
sleep 5000
trap 'trap - TERM; kill -s TERM -- -$$' TERM
tail -f /dev/null & wait
exit 0

