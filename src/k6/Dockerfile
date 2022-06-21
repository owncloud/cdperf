FROM golang as k6

RUN go install go.k6.io/xk6/cmd/xk6@latest && \
    xk6 build --with github.com/grafana/xk6-output-influxdb


FROM node:15-alpine as node

WORKDIR /k6

COPY .babelrc package.json rollup.config.js tsconfig.json yarn.lock ./
RUN yarn

COPY ./src ./src
RUN yarn build

FROM alpine:3

LABEL maintainer="ownCloud GmbH <devops@owncloud.com>" \
  org.label-schema.name="ownCloud measure" \
  org.label-schema.vendor="ownCloud GmbH" \
  org.label-schema.schema-version="1.0"

RUN apk update && \
	apk upgrade && \
	apk add bash curl && \
	rm -rf /var/cache/apk/*


COPY ./entrypoint /usr/bin/entrypoint
RUN chmod +x /usr/bin/entrypoint

WORKDIR /scripts

ENTRYPOINT ["entrypoint"]

COPY --from=k6 /go/k6 /usr/bin/k6

COPY --from=node /k6/dist /scripts
