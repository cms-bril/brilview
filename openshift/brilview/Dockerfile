# Brilview Angular Client
FROM cern/alma8-base:20240901-1 as build
# Install necessary dependencies and build Angular app
RUN dnf install -y git
RUN dnf install -y python2
RUN dnf install -y make
RUN dnf group install -y "Development Tools"
WORKDIR "/home"
RUN mkdir -p brilview_src/
RUN git clone https://github.com/cms-bril/brilview.git brilview_src --branch=1.6.3 # <- Change TAG here!
WORKDIR "brilview_src/brilview/web"
RUN touch ~/.bashrc
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
RUN source ~/.bashrc \
 && nvm install 10 \
 && nvm use 10.24.1 \
 && npm install -g yarn \
 && yarn install --force --ignore-engines




# Brilview Python Server
FROM cern/alma8-base:20240901-1
# Install necessary dependencies
RUN dnf install -y epel-release
RUN dnf install -y wget
RUN dnf install -y git
RUN dnf install -y libaio
RUN dnf install -y libnsl
RUN wget https://dl.influxdata.com/telegraf/releases/telegraf-1.19.1-1.x86_64.rpm
RUN dnf localinstall -y telegraf-1.19.1-1.x86_64.rpm
RUN rm telegraf-1.19.1-1.x86_64.rpm
RUN dnf clean all
RUN wget -q https://cern.ch/cmslumisw/installers/linux-64/Brilconda-3.3.0-0-Linux-x86_64.sh
RUN mkdir -p /opt
RUN bash ./Brilconda-3.3.0-0-Linux-x86_64.sh -b -p /opt/brilconda
RUN rm ./Brilconda-3.3.0-0-Linux-x86_64.sh
RUN /opt/brilconda/bin/pip install brilws==3.9.4;
EXPOSE 9000
# Copy previously dowloaded repo to /brilview directory and change working directory
RUN mkdir -p /brilview
COPY --from=build /home/brilview_src/ /brilview
WORKDIR "/brilview"
# Install Brilview python package
RUN /opt/brilconda/bin/python ./setup.py install
# Copy configuration and set permitions
COPY containerfiles /
RUN chmod 444 /brilview_tmp/frontier_config.xml
RUN chmod 444 /brilview_tmp/brilview_openshift_prod.yaml
RUN chmod 777 /brilview_tmp
RUN chmod 777 /start.sh
# Move builded Angular app to the current build
RUN mkdir -p dist
COPY --from=build /home/brilview_src/brilview/web/dist/ dist/
# Change to the Least Privileged User
RUN groupadd -r usr && useradd -g usr usr
USER usr
CMD ["/start.sh"]
