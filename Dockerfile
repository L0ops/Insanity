FROM teracy/angular-cli
LABEL maintainer="WTFlay <flay.schriever@gmail.com>"

VOLUME ["/app"]

WORKDIR /app

ADD package.json /app/
RUN npm install
ADD . /app

EXPOSE 4200

ENTRYPOINT ["/usr/local/bin/npm"]
CMD ["start"]
