FROM openshift/base-centos7

RUN yum install -y epel-release\
 && yum install -y libaio\
 && wget https://dl.influxdata.com/telegraf/releases/telegraf-1.19.1-1.x86_64.rpm\
 && yum localinstall -y telegraf-1.19.1-1.x86_64.rpm\
 && rm telegraf-1.19.1-1.x86_64.rpm\
 && yum clean all\
 && wget -q https://cern.ch/cmslumisw/installers/linux-64/Brilconda-3.3.0-0-Linux-x86_64.sh\
 && mkdir -p /opt\
 && bash ./Brilconda-3.3.0-0-Linux-x86_64.sh -b -p /opt/brilconda\
 && rm ./Brilconda-3.3.0-0-Linux-x86_64.sh\
 && /opt/brilconda/bin/pip install brilws==3.8.1;

EXPOSE 9000

# RUN useradd -u 1000 -g root -r -M -p \* -s /sbin/nologin brilview

CMD /start.sh

COPY containerfiles /

RUN git clone https://github.com/cms-bril/brilview.git --branch=1.5.11 &> /dev/null\
 && cd brilview\
 && /opt/brilconda/bin/python ./setup.py install\
 && chmod 666 /brilview_tmp/brilview_openshift_prod.yaml\
 && chmod 666 /brilview_tmp/frontier_config.xml\
 && chmod 777 /brilview_tmp\
 && chmod 777 /start.sh
