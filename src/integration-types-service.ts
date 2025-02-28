export interface IntegrationType {
  name: string;
  description: string;
  mainUseCases: string[];
  capabilities: string[];
  bestSuitedFor: string[];
  limitations: string[];
  examples: string[];
}

export class IntegrationTypesService {
  private integrationTypes: IntegrationType[] = [
    {
      name: "Apache Camel Based Integration Flow",
      description: "A flexible integration framework implementing Enterprise Integration Patterns with rule-based routing and mediation engine.",
      mainUseCases: [
        "System-to-system integration",
        "API-based integrations",
        "Complex data transformations",
        "Event-driven architectures",
        "Message routing and orchestration"
      ],
      capabilities: [
        "Support for 300+ components and protocols",
        "Advanced routing and mediation",
        "Data transformation and validation",
        "Error handling and retry mechanisms",
        "Transaction support",
        "Monitoring and management"
      ],
      bestSuitedFor: [
        "Complex integration scenarios",
        "Integrations requiring data transformation",
        "API-based integrations",
        "Event processing",
        "Real-time data processing"
      ],
      limitations: [
        "More complex setup for simple file transfers",
        "Steeper learning curve for beginners"
      ],
      examples: [
        "Integrating CRM with ERP systems",
        "Building API gateways",
        "Implementing event-driven architectures",
        "Real-time data processing pipelines"
      ]
    },
    {
      name: "RCLONE Based Managed File Transfer (MFT)",
      description: "A specialized solution for transferring files between different storage systems with advanced management capabilities.",
      mainUseCases: [
        "File transfers between storage systems",
        "File synchronization",
        "Backup and archiving",
        "Secure file distribution"
      ],
      capabilities: [
        "Support for multiple file systems (SMB, SFTP, S3, Azure Blob, etc.)",
        "File synchronization and mirroring",
        "Bandwidth control and scheduling",
        "Encryption and secure transfers",
        "Checksumming and verification",
        "Filtering and exclusion rules"
      ],
      bestSuitedFor: [
        "Simple file transfers between storage systems",
        "Regular file synchronization tasks",
        "Backup and archiving workflows",
        "Large file transfers"
      ],
      limitations: [
        "Limited to file transfer operations",
        "Not suitable for complex data transformations",
        "Not designed for API integrations"
      ],
      examples: [
        "Syncing files from SFTP to S3 storage",
        "Backing up local directories to cloud storage",
        "Distributing files from central storage to multiple endpoints",
        "Secure transfer of sensitive files between organizations"
      ]
    }
  ];

  getIntegrationTypes(): IntegrationType[] {
    return this.integrationTypes;
  }

  getIntegrationType(name: string): IntegrationType | undefined {
    return this.integrationTypes.find(
      type => type.name.toLowerCase() === name.toLowerCase()
    );
  }
}

export const integrationTypesService = new IntegrationTypesService();
