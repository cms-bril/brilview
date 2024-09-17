FROM cern/alma8-base:20240901-1
# Install necessary dependencies and build Angular app
RUN dnf install -y git
RUN dnf install -y python2
RUN dnf install -y make
RUN dnf group install -y "Development Tools"
WORKDIR "/home"
RUN git config --global user.email "brilview-client-compiler"
RUN git config --global user.name "brilview client compiler"
RUN mkdir -p brilview_src/
RUN git clone --branch=1.6.3 https://github.com/cms-bril/brilview.git brilview_src
WORKDIR "brilview_src/brilview/web"
RUN touch ~/.bashrc
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
RUN source ~/.bashrc \
 && nvm install 10 \
 && nvm use 10.24.1 \
 && npm install -g yarn \
 && yarn install --force --ignore-engines
# Move builded app to the /client_files_for_serving
RUN mkdir -p /client_files_for_serving && cp -R dist/* /client_files_for_serving
# Copy infinite loop script
COPY containerfiles/loop.sh .
RUN chmod -R 777 loop.sh
# Change to the Least Privileged User
RUN groupadd -r usr && useradd -g usr usr
USER usr
# Run infinite loop
CMD ["./loop.sh"]
