# Publishing @weikio/mcp-server to npm

This guide will walk you through the process of publishing the @weikio/mcp-server package to npm, both manually and using GitHub Actions.

## Prerequisites

Before publishing, ensure you have:

1. Node.js and npm installed
2. Updated the package.json file (already done)
3. Built the project with `npm run build`

## Creating an npm Account

If you don't already have an npm account:

1. Go to [https://www.npmjs.com/signup](https://www.npmjs.com/signup)
2. Fill out the registration form
3. Verify your email address
4. Set up two-factor authentication (recommended)

## Publishing the Package

### 1. Login to npm

```bash
npm login
```

Follow the prompts to enter your username, password, and email.

### 2. Test the Package Locally (Optional)

Before publishing, you can create a local package to test:

```bash
# In the project directory
npm pack
```

This will create a `.tgz` file that you can install locally:

```bash
npm install -g ./weikio-mcp-server-0.1.0.tgz
```

### 3. Publish the Package

```bash
# For first-time publishing a scoped package
npm publish --access public
```

The `--access public` flag is required for scoped packages (like @weikio/mcp-server) on the first publish.

### 4. Verify the Publication

After publishing, verify that your package is available on npm:

```bash
npm view @weikio/mcp-server
```

Or visit: [https://www.npmjs.com/package/@weikio/mcp-server](https://www.npmjs.com/package/@weikio/mcp-server)

## Updating the Package

For future updates:

1. Update the version in package.json
2. Make your changes
3. Build the project
4. Publish again:

```bash
npm publish
```

## Automated Publishing with GitHub Actions

A GitHub workflow has been set up to automatically publish the package to npm when changes are pushed to the main branch. The workflow:

1. Checks out the code
2. Sets up Node.js
3. Determines the version using MinVer
4. Updates the package.json version
5. Installs dependencies
6. Builds the project
7. Publishes to npm

### Setting up the NPM_TOKEN Secret

For the GitHub workflow to publish to npm, you need to set up an NPM_TOKEN secret in your GitHub repository:

1. Generate an npm access token:
   - Go to your npm account settings
   - Select "Access Tokens"
   - Click "Generate New Token"
   - Choose "Publish" as the token type
   - Copy the generated token

2. Add the token to your GitHub repository:
   - Go to your GitHub repository
   - Click on "Settings"
   - Select "Secrets and variables" > "Actions"
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm access token
   - Click "Add secret"

Once the secret is set up, the GitHub workflow will automatically publish new versions of the package when changes are pushed to the main branch.

### Creating a New Version

To create a new version:

1. Create and push a git tag:
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

2. Push your changes to the main branch:
   ```bash
   git push origin main
   ```

The GitHub workflow will use the version from the latest tag to set the package version.

## Using the Published Package

Once published, users can use the package with npx:

```bash
npx @weikio/mcp-server
```

Or install it globally:

```bash
npm install -g @weikio/mcp-server
```

Then run it with:

```bash
weikio-mcp-server
```

## MCP Settings Configuration

Users can configure their MCP settings to use the npm package:

```json
{
  "mcpServers": {
    "weikio": {
      "command": "npx",
      "args": [
        "-y",
        "@weikio/mcp-server"
      ],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

See `mcp-settings-example.json` for a complete example.
