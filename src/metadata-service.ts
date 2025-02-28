import axios from 'axios';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the metadata directory
const METADATA_DIR = path.join(__dirname, '..', 'metadata');

// GitHub URLs for metadata files
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/apache/camel-karavan/main/karavan-vscode/metadata';
const COMPONENTS_URL = `${GITHUB_BASE_URL}/components.json`;
const KAMELETS_URL = `${GITHUB_BASE_URL}/kamelets.yaml`;
const SPI_BEANS_URL = `${GITHUB_BASE_URL}/spiBeans.json`;

// Local file paths
const COMPONENTS_FILE = path.join(METADATA_DIR, 'components.json');
const KAMELETS_FILE = path.join(METADATA_DIR, 'kamelets.yaml');
const SPI_BEANS_FILE = path.join(METADATA_DIR, 'spiBeans.json');

// Types for metadata
export interface Component {
  name: string;
  title: string;
  description: string;
  deprecated: boolean;
  firstVersion: string;
  label: string;
  javaType: string;
  supportLevel: string;
  groupId: string;
  artifactId: string;
  version: string;
  scheme: string;
  extendsScheme: string;
  syntax: string;
  async: boolean;
  api: boolean;
  consumerOnly: boolean;
  producerOnly: boolean;
  lenientProperties: boolean;
  remote: boolean;
  componentProperties: Record<string, ComponentProperty>;
  properties: Record<string, ComponentProperty>;
  // Additional fields from the original JSON structure
  headers?: Record<string, ComponentProperty>;
  additionalProperties?: Record<string, ComponentProperty>;
}

export interface ComponentProperty {
  name: string;
  displayName: string;
  kind: string;
  group: string;
  required: boolean;
  type: string;
  javaType: string;
  enum: string[];
  deprecated: boolean;
  secret: boolean;
  defaultValue: string;
  description: string;
}

export interface Kamelet {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    annotations: {
      'camel.apache.org/kamelet.support.level': string;
      'camel.apache.org/catalog.version': string;
      'camel.apache.org/kamelet.icon': string;
      'camel.apache.org/provider': string;
      'camel.apache.org/kamelet.group': string;
      'camel.apache.org/kamelet.namespace': string;
    };
    labels: {
      'camel.apache.org/kamelet.type': string;
    };
  };
  spec: {
    definition: {
      title: string;
      description: string;
      required: string[];
      properties: Record<string, KameletProperty>;
    };
    dependencies: string[];
    template: any;
  };
}

export interface KameletProperty {
  title: string;
  description: string;
  type: string;
  default?: any;
  example?: any;
  format?: string;
  enum?: string[];
  'x-descriptors'?: string[];
}

export interface SpiBean {
  name: string;
  description: string;
  type: string;
  properties: Record<string, SpiBeanProperty>;
}

export interface SpiBeanProperty {
  name: string;
  displayName: string;
  kind: string;
  group: string;
  required: boolean;
  type: string;
  javaType: string;
  enum: string[];
  deprecated: boolean;
  secret: boolean;
  defaultValue: string;
  description: string;
}

// Main metadata service class
export class MetadataService {
  private components: Component[] = [];
  private kamelets: Kamelet[] = [];
  private spiBeans: SpiBean[] = [];
  private initialized = false;

  constructor() {
    // Ensure metadata directory exists
    if (!fs.existsSync(METADATA_DIR)) {
      fs.mkdirSync(METADATA_DIR, { recursive: true });
    }
  }

  /**
   * Initialize the metadata service by loading or downloading metadata files
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loadOrDownloadComponents();
      await this.loadOrDownloadKamelets();
      await this.loadOrDownloadSpiBeans();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize metadata service:', error);
      throw error;
    }
  }

  /**
   * Load components from local file or download from GitHub
   */
  private async loadOrDownloadComponents(): Promise<void> {
    try {
      console.error(`Loading components from ${COMPONENTS_URL}`);
      
      if (fs.existsSync(COMPONENTS_FILE)) {
        console.error(`Using cached components from ${COMPONENTS_FILE}`);
        const data = fs.readFileSync(COMPONENTS_FILE, 'utf8');
        
        try {
          const parsedData = JSON.parse(data);
          
          // Process the data using the same method as for downloaded data
          this.processComponentData(parsedData);
          
          console.error(`Loaded ${this.components.length} components from cache`);
        } catch (parseError) {
          console.error(`Error parsing cached components: ${parseError}`);
          // If we can't parse the cached file, download fresh data
          await this.downloadComponents();
        }
      } else {
        await this.downloadComponents();
      }
    } catch (error) {
      console.error('Error loading components:', error);
      throw error;
    }
  }
  
  /**
   * Download components from GitHub
   */
  private async downloadComponents(): Promise<void> {
    try {
      console.error(`Downloading components from ${COMPONENTS_URL}`);
      const response = await axios.get(COMPONENTS_URL);
      console.error(`Response received, status: ${response.status}`);
      
      // Log a sample of the response data to help with debugging
      const responseType = typeof response.data;
      console.error(`Response data type: ${responseType}`);
      
      if (responseType === 'string') {
        try {
          // If the response is a string, try to parse it as JSON
          const parsedData = JSON.parse(response.data);
          this.processComponentData(parsedData);
        } catch (parseError) {
          console.error(`Error parsing response data: ${parseError}`);
          this.components = [];
        }
      } else if (Array.isArray(response.data)) {
        this.processComponentData(response.data);
      } else if (typeof response.data === 'object' && response.data !== null) {
        this.processComponentData(response.data);
      } else {
        console.error(`Unexpected response data format: ${responseType}`);
        this.components = [];
      }
      
      console.error(`Downloaded ${this.components.length} components`);
      
      // Only write to file if we actually got components
      if (this.components.length > 0) {
        fs.writeFileSync(COMPONENTS_FILE, JSON.stringify(this.components, null, 2));
      } else {
        console.error('No components were downloaded, not updating cache file');
      }
    } catch (error) {
      console.error(`Error downloading components: ${error}`);
      throw error;
    }
  }
  
  /**
   * Process component data from various possible formats
   */
  private processComponentData(data: any): void {
    // First, check if it's an array of objects where each object has a "component" property
    // This is the format shown in the example provided
    if (Array.isArray(data)) {
      console.error(`Data is an array with ${data.length} items`);
      
      // Check if the array items have a "component" property
      if (data.length > 0 && data[0] && typeof data[0] === 'object' && data[0].component) {
        console.error('Found array of objects with component property');
        // Extract the component objects from each item and merge with headers and properties
        this.components = data.map(item => {
          if (!item || !item.component) return null;
          
          // Create a new component object with the component data
          const component = { ...item.component };
          
          // Add headers if they exist
          if (item.headers) {
            component.headers = item.headers;
          }
          
          // Add additional properties if they exist
          if (item.properties) {
            component.additionalProperties = item.properties;
          }
          
          return component;
        }).filter(Boolean);
        
        console.error(`Extracted ${this.components.length} components with additional data`);
        return;
      }
      
      // If it's a simple array of component objects
      this.components = data;
      return;
    }
    
    // Try to extract components if it's an object with a components property
    if (Array.isArray(data.components)) {
      console.error('Found components array property');
      this.components = data.components;
      return;
    }
    
    // Try to extract from componentScheme property (seen in some Camel metadata)
    if (Array.isArray(data.componentScheme)) {
      console.error('Found componentScheme array property');
      this.components = data.componentScheme;
      return;
    }
    
    // If it's a complex object, try to extract components from it
    // Some Camel metadata formats have component objects as direct properties
    const possibleComponents = Object.values(data).filter(
      val => typeof val === 'object' && val !== null && 'name' in val
    );
    
    if (possibleComponents.length > 0) {
      console.error(`Found ${possibleComponents.length} possible components by name property`);
      this.components = possibleComponents as Component[];
      return;
    }
    
    // If we can't find components in any expected format, log and use empty array
    console.error('Could not find components in the response data');
    console.error('Response data keys:', Object.keys(data));
    this.components = [];
  }

  /**
   * Load kamelets from local file or download from GitHub
   */
  private async loadOrDownloadKamelets(): Promise<void> {
    try {
      console.error(`Loading kamelets from ${KAMELETS_URL}`);
      
      if (fs.existsSync(KAMELETS_FILE)) {
        console.error(`Using cached kamelets from ${KAMELETS_FILE}`);
        const data = fs.readFileSync(KAMELETS_FILE, 'utf8');
        const loadedKamelets = yaml.loadAll(data) as Kamelet[];
        this.kamelets = loadedKamelets.filter(k => k !== null && k !== undefined);
        console.error(`Loaded ${this.kamelets.length} kamelets from cache`);
      } else {
        console.error(`Downloading kamelets from ${KAMELETS_URL}`);
        const response = await axios.get(KAMELETS_URL);
        console.error(`Response received, status: ${response.status}`);
        
        const loadedKamelets = yaml.loadAll(response.data) as Kamelet[];
        this.kamelets = loadedKamelets.filter(k => k !== null && k !== undefined);
        console.error(`Downloaded ${this.kamelets.length} kamelets`);
        
        fs.writeFileSync(KAMELETS_FILE, response.data);
      }
    } catch (error) {
      console.error('Error loading kamelets:', error);
      throw error;
    }
  }

  /**
   * Load SPI beans from local file or download from GitHub
   */
  private async loadOrDownloadSpiBeans(): Promise<void> {
    try {
      if (fs.existsSync(SPI_BEANS_FILE)) {
        const data = fs.readFileSync(SPI_BEANS_FILE, 'utf8');
        this.spiBeans = JSON.parse(data);
      } else {
        const response = await axios.get(SPI_BEANS_URL);
        this.spiBeans = response.data;
        fs.writeFileSync(SPI_BEANS_FILE, JSON.stringify(this.spiBeans, null, 2));
      }
    } catch (error) {
      console.error('Error loading SPI beans:', error);
      throw error;
    }
  }

  /**
   * Search for components by name, description, or label
   */
  searchComponents(query: string): Component[] {
    console.error(`Searching for components with query: "${query}"`);
    console.error(`Total components available: ${this.components.length}`);
    
    const lowerQuery = query.toLowerCase();
    
    // Log more component names to help with debugging
    if (this.components.length > 0) {
      console.error('Sample component names:');
      const sampleSize = Math.min(20, this.components.length);
      for (let i = 0; i < sampleSize; i++) {
        const component = this.components[i];
        console.error(`- ${component?.name || 'unnamed'} (scheme: ${component?.scheme || 'none'})`);
      }
      
      // Specifically check if there's an HTTP component
      const httpComponents = this.components.filter(c => 
        c && (
          (c.name && c.name.toLowerCase().includes('http')) || 
          (c.scheme && c.scheme.toLowerCase().includes('http'))
        )
      );
      
      console.error(`Found ${httpComponents.length} components with 'http' in name or scheme`);
      if (httpComponents.length > 0) {
        console.error('HTTP components:');
        httpComponents.forEach(c => {
          console.error(`- Name: ${c.name}, Scheme: ${c.scheme}`);
        });
      }
    }
    
    const results = this.components.filter(component => {
      if (!component) {
        return false;
      }
      
      const nameMatch = component.name && component.name.toLowerCase().includes(lowerQuery);
      const descMatch = component.description && component.description.toLowerCase().includes(lowerQuery);
      const labelMatch = component.label && component.label.toLowerCase().includes(lowerQuery);
      const schemeMatch = component.scheme && component.scheme.toLowerCase().includes(lowerQuery);
      
      // Log matches for debugging
      if (nameMatch || descMatch || labelMatch || schemeMatch) {
        console.error(`Match found: ${component.name} (matched on: ${
          nameMatch ? 'name' : (descMatch ? 'description' : (labelMatch ? 'label' : 'scheme'))
        })`);
      }
      
      return nameMatch || descMatch || labelMatch || schemeMatch;
    });
    
    console.error(`Found ${results.length} components matching "${query}"`);
    return results;
  }

  /**
   * Get a component by name
   */
  getComponent(name: string): Component | undefined {
    const lowerName = name.toLowerCase();
    return this.components.find(component => 
      component && component.name && component.name.toLowerCase() === lowerName
    );
  }

  /**
   * Search for kamelets by name, title, or description
   */
  searchKamelets(query: string): Kamelet[] {
    const lowerQuery = query.toLowerCase();
    return this.kamelets.filter(kamelet => {
      if (!kamelet || !kamelet.metadata || !kamelet.spec || !kamelet.spec.definition) return false;
      
      const nameMatch = kamelet.metadata.name && 
                        kamelet.metadata.name.toLowerCase().includes(lowerQuery);
      
      const titleMatch = kamelet.spec.definition.title && 
                         kamelet.spec.definition.title.toLowerCase().includes(lowerQuery);
      
      const descMatch = kamelet.spec.definition.description && 
                        kamelet.spec.definition.description.toLowerCase().includes(lowerQuery);
      
      return nameMatch || titleMatch || descMatch;
    });
  }

  /**
   * Get a kamelet by name
   */
  getKamelet(name: string): Kamelet | undefined {
    const lowerName = name.toLowerCase();
    return this.kamelets.find(kamelet => 
      kamelet && 
      kamelet.metadata && 
      kamelet.metadata.name && 
      kamelet.metadata.name.toLowerCase() === lowerName
    );
  }

  /**
   * Get the count of loaded components
   */
  getComponentsCount(): number {
    return this.components.length;
  }

  /**
   * Get the count of loaded kamelets
   */
  getKameletsCount(): number {
    return this.kamelets.length;
  }

  /**
   * Format component details for display
   */
  formatComponentDetails(component: Component): string {
    let result = `# ${component.title || component.name}\n\n`;
    
    if (component.deprecated) {
      result += '> **DEPRECATED**\n\n';
    }
    
    result += `${component.description}\n\n`;
    
    result += `- **Scheme**: ${component.scheme}\n`;
    result += `- **Maven**: ${component.groupId}:${component.artifactId}:${component.version}\n`;
    result += `- **Support Level**: ${component.supportLevel}\n`;
    
    if (component.consumerOnly) {
      result += '- **Consumer Only**: Yes\n';
    }
    
    if (component.producerOnly) {
      result += '- **Producer Only**: Yes\n';
    }
    
    // Log component structure for debugging
    console.error(`Component structure for ${component.name}:`);
    console.error(`- componentProperties: ${component.componentProperties ? 'present' : 'missing'}`);
    if (component.componentProperties) {
      console.error(`  - keys: ${Object.keys(component.componentProperties).join(', ')}`);
    }
    console.error(`- properties: ${component.properties ? 'present' : 'missing'}`);
    if (component.properties) {
      console.error(`  - keys: ${Object.keys(component.properties).join(', ')}`);
    }
    console.error(`- headers: ${component.headers ? 'present' : 'missing'}`);
    if (component.headers) {
      console.error(`  - keys: ${Object.keys(component.headers).join(', ')}`);
    }
    console.error(`- additionalProperties: ${component.additionalProperties ? 'present' : 'missing'}`);
    if (component.additionalProperties) {
      console.error(`  - keys: ${Object.keys(component.additionalProperties).join(', ')}`);
    }
    
    // Component properties
    if (component.componentProperties && Object.keys(component.componentProperties).length > 0) {
      result += '\n## Component Properties\n\n';
      
      for (const [key, prop] of Object.entries(component.componentProperties)) {
        result += `### ${prop.displayName || prop.name || key} (${key})\n`;
        if (prop.description) {
          result += `${prop.description}\n\n`;
        }
        result += `- **Name**: ${key}\n`;
        result += `- **Type**: ${prop.type || 'unknown'}\n`;
        result += `- **Required**: ${prop.required ? 'Yes' : 'No'}\n`;
        
        if (prop.defaultValue) {
          result += `- **Default**: ${prop.defaultValue}\n`;
        }
        
        if (prop.enum && prop.enum.length > 0) {
          result += `- **Possible Values**: ${prop.enum.join(', ')}\n`;
        }
        
        result += '\n';
      }
    }
    
    // Endpoint properties
    if (component.properties && Object.keys(component.properties).length > 0) {
      result += '\n## Endpoint Properties\n\n';
      
      for (const [key, prop] of Object.entries(component.properties)) {
        result += `### ${prop.displayName || prop.name || key} (${key})\n`;
        if (prop.description) {
          result += `${prop.description}\n\n`;
        }
        result += `- **Name**: ${key}\n`;
        result += `- **Type**: ${prop.type || 'unknown'}\n`;
        result += `- **Required**: ${prop.required ? 'Yes' : 'No'}\n`;
        
        if (prop.defaultValue) {
          result += `- **Default**: ${prop.defaultValue}\n`;
        }
        
        if (prop.enum && prop.enum.length > 0) {
          result += `- **Possible Values**: ${prop.enum.join(', ')}\n`;
        }
        
        result += '\n';
      }
    }
    
    // Headers
    if (component.headers && Object.keys(component.headers).length > 0) {
      result += '\n## Headers\n\n';
      
      for (const [key, prop] of Object.entries(component.headers)) {
        result += `### ${prop.displayName || prop.name || key} (${key})\n`;
        if (prop.description) {
          result += `${prop.description}\n\n`;
        }
        result += `- **Name**: ${key}\n`;
        result += `- **Type**: ${prop.type || 'unknown'}\n`;
        result += `- **Required**: ${prop.required ? 'Yes' : 'No'}\n`;
        
        if (prop.defaultValue) {
          result += `- **Default**: ${prop.defaultValue}\n`;
        }
        
        if (prop.enum && prop.enum.length > 0) {
          result += `- **Possible Values**: ${prop.enum.join(', ')}\n`;
        }
        
        result += '\n';
      }
    }
    
    // Additional Properties
    if (component.additionalProperties && Object.keys(component.additionalProperties).length > 0) {
      result += '\n## Additional Properties\n\n';
      
      for (const [key, prop] of Object.entries(component.additionalProperties)) {
        result += `### ${prop.displayName || prop.name || key} (${key})\n`;
        if (prop.description) {
          result += `${prop.description}\n\n`;
        }
        result += `- **Name**: ${key}\n`;
        result += `- **Type**: ${prop.type || 'unknown'}\n`;
        result += `- **Required**: ${prop.required ? 'Yes' : 'No'}\n`;
        
        if (prop.defaultValue) {
          result += `- **Default**: ${prop.defaultValue}\n`;
        }
        
        if (prop.enum && prop.enum.length > 0) {
          result += `- **Possible Values**: ${prop.enum.join(', ')}\n`;
        }
        
        result += '\n';
      }
    }
    
    return result;
  }

  /**
   * Format kamelet details for display
   */
  formatKameletDetails(kamelet: Kamelet): string {
    let result = `# ${kamelet.spec.definition.title || kamelet.metadata.name}\n\n`;
    
    result += `${kamelet.spec.definition.description}\n\n`;
    
    result += `- **Type**: ${kamelet.metadata.labels['camel.apache.org/kamelet.type']}\n`;
    result += `- **Group**: ${kamelet.metadata.annotations['camel.apache.org/kamelet.group']}\n`;
    result += `- **Support Level**: ${kamelet.metadata.annotations['camel.apache.org/kamelet.support.level']}\n`;
    result += `- **Provider**: ${kamelet.metadata.annotations['camel.apache.org/provider']}\n`;
    
    // Properties
    if (Object.keys(kamelet.spec.definition.properties || {}).length > 0) {
      result += '\n## Properties\n\n';
      
      for (const [key, prop] of Object.entries(kamelet.spec.definition.properties)) {
        // Include both title and property name
        result += `### ${prop.title || key} (${key})\n`;
        result += `${prop.description}\n\n`;
        result += `- **Name**: ${key}\n`;  // Explicitly include the property name
        result += `- **Type**: ${prop.type}\n`;
        result += `- **Required**: ${kamelet.spec.definition.required?.includes(key) ? 'Yes' : 'No'}\n`;
        
        if (prop.default !== undefined) {
          result += `- **Default**: ${JSON.stringify(prop.default)}\n`;
        }
        
        if (prop.example !== undefined) {
          result += `- **Example**: ${JSON.stringify(prop.example)}\n`;
        }
        
        if (prop.enum && prop.enum.length > 0) {
          result += `- **Possible Values**: ${prop.enum.join(', ')}\n`;
        }
        
        result += '\n';
      }
    }
    
    // Dependencies
    if (kamelet.spec.dependencies && kamelet.spec.dependencies.length > 0) {
      result += '\n## Dependencies\n\n';
      for (const dep of kamelet.spec.dependencies) {
        result += `- ${dep}\n`;
      }
    }
    
    return result;
  }
}

// Export a singleton instance
export const metadataService = new MetadataService();
