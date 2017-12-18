FROM teracy/angular-cli
LABEL maintainer="WTFlay <flay.schriever@gmail.com>"

WORKDIR /app

ADD package.json /app/
RUN npm install --no-shrinkwrap --update-binary
ADD . /app

EXPOSE 4200

ENTRYPOINT ["/usr/local/bin/npm"]
CMD ["run", "ng", "--", "serve", "--host", "0.0.0.0"]
