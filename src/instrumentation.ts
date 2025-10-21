import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { logs } from "@opentelemetry/sdk-node";
import { registerOTel } from "@vercel/otel";

const otelCollectorUrl = process.env.OTEL_COLLECTOR_URL;

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    registerOTel({
      serviceName: "bytebuzz-nextjs",
      traceExporter: new OTLPTraceExporter({
        url: `${otelCollectorUrl}/v1/traces`,
      }),
      logRecordProcessors: [
        new logs.SimpleLogRecordProcessor(
          new OTLPLogExporter({
            url: `${otelCollectorUrl}/v1/logs`,
          }),
        ),
      ],
      metricReaders: [
        new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporter({
            url: `${otelCollectorUrl}/v1/metrics`,
          }),
        }),
      ],
    });
  }
}
