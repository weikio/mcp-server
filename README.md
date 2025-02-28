# Weik.io Integration Expert: MCP Server Enhancement Project

## Technology Overview

**Apache Camel:**
- Open source integration framework implementing Enterprise Integration Patterns
- Rule-based routing and mediation engine with 300+ components
- Supports multiple connection protocols and data formats
- Enables complex integrations between disparate systems with minimal code
- Provides YAML DSL for declarative integration flow definition

**Weik.io:**
- Open source integration and automation platform built on Apache Camel
- Agent-based architecture supporting cloud, on-premise, and hybrid deployments
- Extends Camel with specialized capabilities including:
  - Integration Flows (system-to-system integration)
  - API Management with built-in gateway
  - Managed File Transfers (MFTs)
  - Event Hub with CloudEvents support
  - Entity Store (key-value with change tracking)
  - Database change tracking
- Developer-friendly tools with VS Code integration and CLI
- Enterprise-ready with monitoring, observability, and security features

## Project Vision

An intelligent assistant that guides developers through the complete integration lifecycle using Apache Camel and Weik.io, from planning through implementation, testing, and deployment.

## Current State

The MCP server currently provides:
- Apache Camel component metadata
- Apache Camel Kamelet metadata 
- Basic Weik.io CLI operations
- Integration type decision support
- Weik.io profile management
- Docker Compose configuration for local Weik.io instances
- Integration flow initialization
- Integration deployment

### Integration Flow Initialization

The server now includes a tool called `initialize_integration` that allows creating a new integration flow:

- Takes two parameters:
  - `name`: Name of the integration flow (must be lowercase, can include hyphens)
  - `directory`: Directory where the integration flow should be created (absolute path)
- Creates a new folder with the specified name in the specified directory
- Generates two files within the folder:
  - `integration.camel.yaml`: Apache Camel YAML flow definition
  - `application.properties`: Configuration for flow-specific parameters/properties/variables

This tool enables the AI assistant to help users create and set up new integration flows quickly in their preferred location. The integration flow can then be customized based on the user's specific requirements.

Example usage:
```
// Using the MCP tool
initialize_integration(name: "hello-world", directory: "/path/to/your/project")

// Using the CLI directly
weikio integration init hello-world
```

### Integration Deployment

The server includes a tool called `push_integration` that allows deploying an integration to a Weik.io instance:

- Takes two parameters:
  - `name`: Name of the integration to push (folder name)
  - `directory`: Directory containing the integration (absolute path)
- Pushes the integration to the currently active Weik.io profile
- Validates that the integration exists and contains the required files

This tool enables the AI assistant to help users deploy their integration flows to a Weik.io instance after they have been created and customized.

Example usage:
```
// Using the MCP tool
push_integration(name: "hello-world", directory: "/path/to/your/project")

// Using the CLI directly
weikio integration push hello-world
```

### Integration Type Decision Support

The server now includes a tool called `get_supported_integration_types` that provides detailed information about the supported integration types in Weik.io:

1. **Apache Camel Based Integration Flow**
   - Description: A flexible integration framework implementing Enterprise Integration Patterns with rule-based routing and mediation engine
   - Main use cases: System-to-system integration, API-based integrations, complex data transformations, etc.
   - Best suited for: Complex integration scenarios, integrations requiring data transformation, API-based integrations, etc.

2. **RCLONE Based Managed File Transfer (MFT)**
   - Description: A specialized solution for transferring files between different storage systems with advanced management capabilities
   - Main use cases: File transfers between storage systems, file synchronization, backup and archiving, etc.
   - Best suited for: Simple file transfers between storage systems, regular file synchronization tasks, backup and archiving workflows, etc.

This tool enables the AI assistant to make informed recommendations about which integration type to use based on the user's specific requirements. For example:

- If a user needs to sync files from SFTP to Azure Blob storage, the assistant will recommend RCLONE based MFT
- If a user needs to integrate a CRM with an ERP system with data transformations, the assistant will recommend Apache Camel based Integration Flow

The decision logic follows a simple rule: If the task involves transferring files (copy, move, sync) between two file systems (SMB, SFTP, Azure Blob, S3, local directories, etc.), use MFT. Otherwise, use Apache Camel based Integration Flow.

## Enhancement Goals

Transform the server into a comprehensive integration expert that can:

1. **Guide integration planning**
   - Recommend appropriate patterns and approaches
   - Apply best practices for different integration scenarios
   - Make informed technology decisions (Camel YAML vs. specialized Weik.io features)

2. **Assist with implementation**
   - Generate correct Apache Camel YAML syntax
   - Create data transformations (with emphasis on JQ for JSON)
   - Support specialized Weik.io features beyond Camel

3. **Facilitate testing and debugging**
   - Identify required test parameters for different integration types
   - Generate test configurations and sample data
   - Provide robust debugging tools for common issues
   - Assist with data transformation troubleshooting
   - Enable detailed inspection of message flow through integration points
   - Guide validation procedures

4. **Streamline deployment**
   - Generate correct commands for pushing to Weik.io
   - Provide deployment verification guidance

## Architecture

### Knowledge Management System

The enhancement introduces a structured knowledge system:

1. **YAML DSL Knowledge Base**
   - Apache Camel YAML syntax documentation
   - Element descriptions and syntax rules
   - Example repository (basic to advanced)

2. **Integration Patterns Library**
   - Common EIP implementations
   - Use case specific patterns
   - Best practices by scenario

3. **Template System**
   - Scenario-based templates
   - Progressive complexity options
   - Customizable parameters

4. **Weik.io Extensions Knowledge Base**
   - MFT capabilities and configurations
   - Event sources documentation
   - Variables support
   - Entity store usage patterns
   - Database change tracking
   - Other built-in functionality

5. **Best Practices Framework**
   - **Design-time best practices**
     - Property placeholder usage with Weik.io Variables
     - Naming conventions and structure
     - Error handling patterns
     - Security implementation guidelines
   - **Runtime best practices**
     - Event streams for webhook integrations
     - Monitoring hooks
     - Logging strategies
     - Performance optimization patterns
   - **Operational best practices**
     - Deployment strategies
     - Configuration management
     - Versioning approaches

6. **Debugging & Troubleshooting System**
   - Data transformation debugging tools
   - Execution flow visualization
   - Error pattern recognition and resolution
   - Payload inspection and validation

### File Structure

```
weikio-server/
├── data/
│   ├── yaml-dsl/              # Apache Camel YAML DSL knowledge
│   │   ├── examples/          # Categorized examples
│   │   ├── elements/          # DSL element documentation
│   │   └── patterns/          # EIP implementation patterns
│   ├── templates/             # Reusable integration templates
│   │   ├── system-to-system/  # System integration templates
│   │   ├── data-processing/   # Data processing templates
│   │   └── api-based/         # API integration templates
│   ├── best-practices/        # Best practices documentation
│   │   ├── design/            # Design-time best practices
│   │   │   ├── property-placeholders.md
│   │   │   ├── naming-conventions.md
│   │   │   └── error-handling.md
│   │   ├── runtime/           # Runtime best practices
│   │   │   ├── event-streams.md
│   │   │   ├── monitoring.md
│   │   │   └── logging.md
│   │   └── operational/       # Operational best practices
│   │       ├── deployment.md
│   │       ├── configuration.md
│   │       └── versioning.md
│   ├── development-tools/     # External development tools
│   │   ├── ngrok/             # ngrok documentation and scripts
│   │   ├── webhook-site/      # webhook.site integration
│   │   ├── camel-jbang/       # Camel JBang scripts and examples
│   │   └── local-weikio/      # Local Weik.io environment
│   │       └── docker-compose.yml  # Docker Compose configuration
│   └── weikio/                # Weik.io-specific knowledge
│       ├── features/          # Built-in feature documentation
│       │   ├── mft/           # Managed File Transfer
│       │   ├── events/        # Event sources
│       │   ├── variables/     # Variables system
│       │   ├── entity-store/  # Key-value store
│       │   └── db-tracking/   # Database change tracking
│       └── best-practices/    # Weik.io-specific best practices
└── src/
    ├── integration-types-service.ts # Integration types information service
    ├── metadata-service.ts    # Apache Camel metadata service
    ├── yaml-dsl-service.ts    # YAML DSL knowledge service (planned)
    ├── template-service.ts    # Template management service (planned)
    ├── best-practices-service.ts # Best practices enforcement (planned)
    ├── dev-tools-service.ts   # Development tools integration (planned)
    └── local-weikio-service.ts # Local Weik.io management (planned)
```

## Implementation Roadmap

### Phase 1: Apache Camel YAML DSL Support

1. **Create YAML DSL Knowledge Base**
   - Extract and organize DSL elements from documentation
   - Document syntax rules and constraints
   - Tag elements with metadata for searchability

2. **Build Example Repository**
   - Develop basic examples showcasing core concepts
   - Create advanced examples demonstrating complex patterns
   - Index examples with metadata for efficient retrieval

3. **Implement Integration Pattern Library**
   - Document common Enterprise Integration Patterns
   - Provide YAML implementations of each pattern
   - Create context-specific variations

4. **Develop Template System**
   - Design foundational templates for common scenarios
   - Create parameterization system for customization
   - Include documentation within templates

5. **Add Core MCP Tools**
   - `learn_yaml_example`: Store and index new examples
   - `generate_camel_integration`: Create YAML based on requirements
   - `validate_yaml`: Verify syntax and best practices
   - `get_yaml_element_help`: Provide element documentation
   - `list_integration_patterns`: Show available patterns
   - `get_template`: Retrieve integration templates

6. **Develop Debugging Capabilities**
   - Create data transformation debugging tools
     - Input/output validators
     - Transformation step visualization
     - Schema compliance checkers
   - Implement common error resolution patterns
   - Design payload examination utilities
   - Build execution flow tracing

7. **Establish Best Practices Framework**
   - Document key best practices for integration design
   - Create property placeholder standards with Weik.io Variables
   - Develop event stream patterns for webhook integrations
   - Build best practices enforcement into generation tools
   - Create validation rules to ensure compliance

### Phase 2: Weik.io Feature Support

1. **Develop Weik.io Feature Knowledge Base**
   - Document MFT capabilities and configuration
   - Create structured documentation for other Weik.io features
   - Establish extensible format for adding new features

2. **Enhance Template System**
   - Add Weik.io-specific templates
   - Create hybrid templates showing Camel+Weik.io integration
   - Include best practices for feature selection

3. **Implement Weik.io-specific Tools**
   - `generate_mft_configuration`: Create MFT configurations
   - Tools for other Weik.io features (extensible design)

4. **Add Testing & Deployment Support**
   - Test parameter identification
   - Test configuration generation
   - Deployment validation guidance

## MCP Tools Implementation

### 1. Planning Tools
- `get_supported_integration_types`: Get information about supported integration types (implemented)
- `analyze_integration_requirements`: Determine optimal approach and technology (planned)
- `suggest_integration_pattern`: Recommend appropriate pattern for requirements (planned)
- `get_best_practices`: Retrieve relevant best practices for specific integration type (planned)

### 2. Implementation Tools
- `initialize_integration`: Initialize a new integration flow with the specified name (implemented)
- `generate_camel_integration`: Generate Camel YAML flow
- `generate_mft_configuration`: Generate MFT config for file operations
- `create_data_transformation`: Build JQ or other transformations based on sample data
- `validate_implementation`: Check implementation against best practices
- `apply_best_practices`: Analyze and enhance existing integration with best practices
- `get_best_practice`: Retrieve detailed information about specific best practices
- `check_compliance`: Validate integration against best practice standards

### 3. Testing & Debugging Tools
- `identify_test_parameters`: Determine required parameters for testing
- `generate_test_configuration`: Create test setup files
- `create_test_data`: Generate mock data for testing
- `debug_transformation`: Interactive JQ/transformation debugging
- `analyze_payload`: Examine message structure at any point
- `trace_message_flow`: Visualize message path through integration
- `diagnose_error`: Analyze errors and suggest solutions

### 4. External Tool Integration
- `setup_ngrok_tunnel`: Configure and start an ngrok tunnel for local endpoints
- `get_ngrok_url`: Retrieve current ngrok public URL for use in integrations
- `create_webhook_endpoint`: Generate new webhook.site endpoints for testing
- `retrieve_webhook_requests`: Get received webhook payloads for analysis
- `run_camel_jbang`: Execute Camel scripts for quick testing

### 5. Local Weik.io Management
- `get_docker_compose`: Get a Docker Compose file for setting up a local Weik.io instance (implemented)
- `start_local_weikio`: Start local Weik.io using Docker Compose (planned)
- `stop_local_weikio`: Stop the running environment (planned)
- `restart_local_weikio`: Restart for quick refresh (planned)
- `get_weikio_status`: Simple health check and status reporting (planned)
- `reset_local_weikio`: Return environment to clean state (planned)

### 6. Profile Management
- `list_profiles`: List all Weik.io profiles (implemented)
- `add_profile`: Add a new Weik.io profile with name, URL, and API key (implemented)

These tools enable connecting to different Weik.io instances by managing profiles. When a new profile is added, it becomes the default profile for subsequent operations.

Example workflow:
1. Check existing profiles with `list_profiles`
2. Add a new profile with `add_profile` if needed
3. Verify connection with `list_agents` to ensure the profile works correctly

### 7. Publishing Tools
- `push_integration`: Push an integration to a Weik.io instance (implemented)
- `generate_push_commands`: Create commands to push to Weik.io
- `create_deployment_checklist`: Generate pre-deployment verification steps

## Extensibility Mechanisms

The implementation should prioritize extensibility to allow future enhancements:

1. **Pluggable Knowledge System**
   - Structured file format for adding new knowledge
   - Versioning support for evolving capabilities

2. **Feature Documentation Format**
   - Standard schema for documenting Weik.io features
   - Easy addition of new features as they're developed

3. **Template Extension API**
   - Clear conventions for adding new templates
   - Parameter definition standards

## Technical Implementation Guidelines

### Knowledge Base Design

1. **File Format**
   - Use JSON/YAML for structured data
   - Maintain clear schemas for each knowledge type
   - Include rich metadata for filtering and search

2. **Example Storage**
   - Store examples as complete, valid YAML
   - Annotate with comments for learning purposes
   - Tag with relevant components, patterns, and complexity

### Service Implementation

1. **YAML DSL Service**
   - Provide indexing and search capabilities
   - Implement validation against DSL rules
   - Support contextual help for elements

2. **Template Service**
   - Enable parameter substitution
   - Provide filtering by use case and complexity
   - Support merging of multiple templates

### Best Practices Enforcement

1. **Structured Documentation Format**
   - Markdown-based best practice documentation
   - Metadata for applicability (integration type, components)
   - Code examples showing correct implementation
   - Common anti-patterns to avoid

2. **Integration Generation Guardrails**
   - Default application of best practices in all generated code
   - Template configurations conforming to standards
   - Automatic property placeholder implementation
   - Event stream generation for webhook scenarios

3. **Compliance Checking**
   - Static analysis rules for best practice validation
   - Customizable compliance levels (required vs. recommended)
   - Detailed reporting with improvement suggestions
   - Fix suggestions for non-compliant implementations

4. **Extensibility Mechanism**
   - Simple format for adding new best practices
   - Version tagging for practice evolution
   - Deprecation mechanism for outdated practices

### Debugging System Design

1. **Data Transformation Focus**
   - JQ testing environment with sample input/output
   - Step-by-step transformation visualization
   - Common error pattern identification
   - Schema validation against expected formats

2. **Message Flow Debugging**
   - Enable tracing through integration points
   - Provide payload inspection at each step
   - Identify potential bottlenecks and failure points

3. **Error Resolution Patterns**
   - Maintain database of common errors and resolutions
   - Pattern matching for error diagnostics
   - Suggested fixes based on error signatures

## Example Best Practices

To illustrate the level of detail in the best practices framework, here are examples of two key practices:

### Property Placeholders with Weik.io Variables

Integrations should externalize all configuration using Weik.io's Variable system rather than hardcoding values:

```yaml
# ❌ Incorrect: Hardcoded values
- route:
    from:
      uri: "sftp://ftp.example.com:22/incoming"
      parameters:
        username: "ftpuser"
        password: "secret123"
```

```yaml
# ✅ Correct: Using Weik.io Variables
- route:
    from:
      uri: "sftp://{{vars.ftp.host}}:{{vars.ftp.port}}/incoming"
      parameters:
        username: "{{vars.ftp.username}}"
        password: "{{vars.ftp.password}}"
```

Benefits:
- Environment-specific configurations
- Improved security (no secrets in code)
- Centralized management
- Runtime reconfiguration without redeployment

### Event Streams for Webhook Integrations

All webhook-style integrations should implement event streams for replay and inspection:

```yaml
# ✅ Recommended Pattern
- route:
    from:
      uri: "webhook://orders"
      steps:
        # Log incoming event to stream
        - to:
            uri: "stream:event"
            parameters:
              streamName: "webhook-orders"
              persistent: true
        # Continue with processing
        - process:
            # ... processing steps
```

Benefits:
- Ability to replay events for testing
- Inspection of payloads for debugging
- Audit trail of received webhooks
- Recovery mechanism in case of processing failures

## External Developer Tools Integration

The MCP server provides seamless integration with popular development and testing tools:

### ngrok
- Automatic tunnel management for local endpoints
- Configuration of custom domains and authentication
- Integration with webhook testing workflows

### webhook.site
- Automated endpoint creation and management
- Payload inspection and analysis
- Response mocking for simulating external systems

### Camel CLI (JBang)
- Quick component testing without project setup
- Transformation validation with sample data
- Route testing with minimal configuration

These tools are integrated directly into the MCP server's capabilities, providing a seamless experience for developers throughout the integration lifecycle.

## Local Weik.io Environment

The MCP server provides streamlined management of local Weik.io instances:

### Docker Compose Configuration

The MCP server includes a tool called `get_docker_compose` that provides a ready-to-use Docker Compose configuration for running a local Weik.io environment. The configuration includes:

- Traefik for routing (accessible at http://weikio.localtest.me:8000)
- NATS for messaging
- Weik.io Backend (with default credentials dev@weik.io/password and API key "api.key")
- Weik.io UI
- Weik.io Agent
- API Management

To use this configuration:
1. Get the Docker Compose file with `get_docker_compose`
2. Save it to a file (e.g., `docker-compose.yml`)
3. Run `docker-compose up -d` to start the environment
4. Connect to the local instance by adding a profile:
   ```
   weikio profiles add "local" "http://backend.localtest.me:8000" "api.key"
   ```
5. Verify the connection with `weikio agents ls`

### Instance Management
- One-command startup of complete Weik.io environment
- Basic status reporting
- Simple reset functionality for clean testing

### Development Integration
- Deploy integrations directly to local instance
- Test with real-world data using tunneling (ngrok)
- Rapid iteration between code changes and testing

This simplified approach focuses on developer productivity by providing just the essential controls needed for integration development and testing.

## Future Opportunities

1. **Interactive Learning**
   - Step-by-step tutorials for common integrations
   - Feedback on user-created integrations

2. **Pattern Detection**
   - Analyze existing integrations to identify patterns
   - Suggest optimizations based on best practices

3. **Integration with Weik.io Roadmap**
   - Support for new Weik.io features as they're released
   - Alignment with Weik.io product evolution

## Development Approach

This project should be implemented with an iterative approach:

1. Start with core YAML DSL knowledge and simple examples
2. Add integration patterns and templates
3. Build tools for generation and validation
4. Extend with Weik.io-specific features
5. Enhance with testing and deployment support

Each iteration should deliver standalone value while building toward the complete vision.

## Docker Container and CI/CD

The MCP server can be run as a Docker container, with automated builds via GitHub Actions.

### Docker Image

The MCP server is containerized using Docker, making it easy to deploy and run in various environments. The Docker image is built on Node.js Alpine for a minimal footprint.

#### Running the Docker Container

```bash
# Pull the latest image
docker pull ghcr.io/[your-github-username]/weikio-server:latest

# Run the container
docker run -it ghcr.io/[your-github-username]/weikio-server
```

### CI/CD Pipeline

The project uses GitHub Actions for continuous integration and delivery:

1. **Automated Builds**: Every push to the main branch triggers a new build
2. **Versioning**: Uses MinVer for automatic semantic versioning
3. **Container Registry**: Images are published to GitHub Container Registry (ghcr.io)

#### Versioning Strategy

The project uses MinVer for automatic versioning:

- Initial version starts at 1.0.0
- Version numbers follow the pattern: 1.0.0, 1.0.1, 1.0.2, etc.
- To create a new version, create and push a git tag:
  ```bash
  # For a patch release
  git tag v1.0.1
  git push origin v1.0.1
  
  # For a minor release
  git tag v1.1.0
  git push origin v1.1.0
  
  # For a major release
  git tag v2.0.0
  git push origin v2.0.0
  ```

#### GitHub Actions Workflow

The GitHub Actions workflow:
1. Checks out the code
2. Sets up Node.js and installs dependencies
3. Builds the TypeScript project
4. Determines the version using MinVer
5. Builds and pushes the Docker image with appropriate tags

The workflow file is located at `.github/workflows/docker-build.yml`.
