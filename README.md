# HackJayhawk26

This repository contains an architectural scaffold for Nexus, a decentralized corporate travel platform built around XRPL integration, DID-based zero-trust identity, programmable policy enforcement, event-driven agents, and Kubernetes deployment.

## What's included

- `docs/architecture.md`: high-level architecture and XRPL compatibility strategy
- `proto/nexus.proto`: gRPC schema for identity, policy, payments, intelligence, and liquidity services
- `services/*`: TypeScript microservice scaffolding for Identity, Policy, Payments, Intelligence, Lending, Gateway, and shared utilities
- `services/secure-enclave`: Rust placeholder for the secure signing and key management boundary
- `docker-compose.yaml`: local developer infrastructure for PostgreSQL, Redis, Kafka, Zookeeper, and Vault
- `k8s/nexus-deployments.yaml`: Kubernetes deployment manifest for core services

## Goals

- Modular, production-grade backend architecture
- Internal gRPC communication and external REST gateway
- Zero-trust service authentication with DID-derived JWTs
- XRPL feature abstractions and off-chain fallbacks for experimental proposals
- Kafka-driven agent orchestration and audit logging
- Secure secret handling via Vault
- Observability ready with Prometheus/OpenTelemetry patterns

## Getting started

1. Install dependencies from the repository root:
   ```bash
   npm install
   ```
2. Start local infrastructure:
   ```bash
   docker-compose up -d
   ```
3. Start a service example:
   ```bash
   npm run start:identity
   ```

> This scaffold is intended as the foundation for the Nexus backend. Production implementations should add service meshes, TLS certificates, Vault-backed secrets, PostgreSQL schemas, fully implemented DID and XRPL logic, and hardened Kubernetes deployment pipelines.
