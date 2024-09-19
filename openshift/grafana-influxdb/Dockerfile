FROM cern/alma8-base:20240901-1
RUN dnf install -y wget

RUN wget https://dl.influxdata.com/telegraf/releases/telegraf-1.19.1-1.x86_64.rpm
RUN yum localinstall -y telegraf-1.19.1-1.x86_64.rpm
RUN rm telegraf-1.19.1-1.x86_64.rpm
RUN wget https://dl.influxdata.com/influxdb/releases/influxdb-1.8.7.x86_64.rpm
RUN yum localinstall -y influxdb-1.8.7.x86_64.rpm
RUN rm influxdb-1.8.7.x86_64.rpm
RUN yum install -y https://s3-us-west-2.amazonaws.com/grafana-releases/release/grafana-4.6.5-1.x86_64.rpm
RUN yum clean all

COPY containerfiles /

RUN chmod 777 /var/lib/influxdb
RUN chmod 777 -R /usr/share/grafana
RUN chmod 777 -R /etc/grafana
RUN chmod 777 -R /var/lib/grafana
RUN chmod 777 -R /var/log/grafana
RUN chmod 777 /run_influxdb.sh
RUN chmod 777 /run_grafana.sh
RUN chmod 777 /start.sh

RUN groupadd -r usr && useradd -g usr usr
USER usr

CMD /start.sh
