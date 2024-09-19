FROM cern/alma8-base:20240901-1
RUN dnf install -y wget

RUN yum install -y epel-release
RUN yum install -y nginx
RUN wget https://dl.influxdata.com/telegraf/releases/telegraf-1.19.1-1.x86_64.rpm
RUN yum localinstall -y telegraf-1.19.1-1.x86_64.rpm
RUN rm telegraf-1.19.1-1.x86_64.rpm
RUN yum clean all

EXPOSE 8080

COPY containerfiles /

RUN chmod 777 -R /var/log/nginx
RUN chmod 777 -R /var/log/telegraf
RUN chmod 777 -R /var/lib/nginx
RUN chmod 777 /start.sh

RUN groupadd -r usr && useradd -g usr usr
USER usr

CMD /start.sh
