FROM vhalme/txlinks-api-base:latest
RUN mkdir /transitlinks
RUN mkdir /transitlinks/images
RUN cd /transitlinks && \
  git clone https://github.com/transitlinks/txlinks-api.git && \
  cd txlinks-api && \
  yarn install && \
  yarn build
ADD assets/start.sh /
RUN chmod a+x /start.sh
CMD /start.sh
