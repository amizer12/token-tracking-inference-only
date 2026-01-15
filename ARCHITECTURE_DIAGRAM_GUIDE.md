# Architecture Diagram Guide

## Overview

The `architecture.drawio` file contains a professional, premium-quality architecture diagram of the Token Usage Tracker system with proper AWS service icons and clean alignment.

## How to View

1. **Online**: Go to https://app.diagrams.net/
2. **Open File**: Click "Open Existing Diagram" → Select `architecture.drawio`
3. **View**: The diagram will display with all AWS icons and formatting

Alternatively, you can use the draw.io desktop app or VS Code extension.

## Diagram Features

### Professional Design Elements

✅ **AWS Official Icons**
- CloudFront (purple)
- S3 (green)
- API Gateway (pink)
- Lambda (orange)
- DynamoDB (purple)
- Bedrock (teal)

✅ **Clean Layout**
- Organized left-to-right flow
- Proper spacing and alignment
- No overlapping elements
- Clear visual hierarchy

✅ **Color Coding**
- Each AWS service has its official brand color
- Arrows color-matched to target services
- Consistent styling throughout

✅ **Detailed Information**
- Service descriptions
- Configuration details
- Deployment information
- Data flow labels

## Diagram Structure

### Main Components (Left to Right)

1. **End Users** (Left)
   - User icon
   - Entry point to system

2. **CloudFront CDN** (Center-Left)
   - Global distribution
   - HTTPS enabled
   - Gzip compression
   - Cache optimization
   - Live URL displayed

3. **S3 Bucket** (Top-Center-Left)
   - Frontend assets
   - Private access
   - OAC secured
   - Connected to CloudFront

4. **API Gateway** (Center)
   - 6 REST endpoints listed:
     - POST /users
     - GET /users/{id}
     - PUT /users/{id}/limit
     - POST /users/{id}/usage
     - GET /users
     - POST /invoke/{id}

5. **Lambda Functions** (Center-Right)
   - Container with 6 functions:
     1. CreateUser
     2. GetUserUsage
     3. UpdateTokenLimit
     4. RecordTokenUsage
     5. ListAllUsers
     6. InvokeModel
   - Each endpoint connected to its specific Lambda

6. **DynamoDB** (Right)
   - TokenUsageTable
   - On-demand billing
   - Atomic operations
   - Connected to all Lambdas

7. **AWS Bedrock** (Far Right)
   - Claude Sonnet 4.5
   - Connected to InvokeModel Lambda
   - Token counting

### Connection Arrows

**User → CloudFront**
- Thick black arrow
- Label: "HTTPS"
- Represents user access

**CloudFront → S3**
- Green dashed arrow
- Label: "Origin"
- Represents static asset fetching

**CloudFront → API Gateway**
- Pink solid arrow
- Label: "API Calls"
- Represents API requests

**API Endpoints → Lambda Functions**
- Orange arrows
- Each endpoint to its specific Lambda:
  - POST /users → CreateUser
  - GET /users/{id} → GetUserUsage
  - PUT /users/{id}/limit → UpdateTokenLimit
  - POST /users/{id}/usage → RecordTokenUsage
  - GET /users → ListAllUsers
  - POST /invoke/{id} → InvokeModel

**Lambda → DynamoDB**
- Purple bidirectional arrow
- Label: "Read/Write"
- Represents data operations

**InvokeModel → Bedrock**
- Teal arrow
- Label: "Invoke Model"
- Represents AI model calls

### Information Boxes

**Legend (Top Right)**
- All AWS service icons
- Service names
- Dark background for contrast

**Data Flow (Right)**
- Step-by-step flow description
- Numbered steps 1-6
- Blue background

**Key Features (Bottom Right)**
- Feature checklist
- Teal background
- Highlights system capabilities

**Technology Stack (Bottom)**
- Complete tech stack listing
- Frontend, backend, infrastructure
- Full width banner

### Visual Hierarchy

**Primary Elements** (Largest)
- CloudFront
- API Gateway
- Lambda container
- DynamoDB
- Bedrock

**Secondary Elements** (Medium)
- Individual Lambda functions
- API endpoints
- Information boxes

**Tertiary Elements** (Smallest)
- Labels
- Descriptions
- Flow indicators

## Color Scheme

### AWS Official Colors
- **CloudFront**: #8C4FFF (Purple)
- **S3**: #7AA116 (Green)
- **API Gateway**: #E7157B (Pink)
- **Lambda**: #ED7100 (Orange)
- **DynamoDB**: #C925D1 (Purple)
- **Bedrock**: #01A88D (Teal)

### Supporting Colors
- **AWS Orange**: #FF9900 (Borders, accents)
- **Dark Gray**: #232F3E (Text, user icon)
- **White**: #FFFFFF (Backgrounds)
- **Light Gray**: #F7F9FB (Cloud background)

## Deployment Information

The diagram includes live deployment details:
- ✅ Status: LIVE
- 🌐 URL: d14yergixb8grm.cloudfront.net
- 📅 Deployed: January 15, 2026
- 🔐 HTTPS: Enabled

## Diagram Specifications

- **Canvas Size**: 1600 x 1000 pixels
- **Grid**: 10px grid with snap-to-grid enabled
- **Format**: Draw.io XML format
- **Compatibility**: draw.io, diagrams.net, VS Code extension

## Usage Tips

### Editing the Diagram

1. Open in draw.io
2. Click any element to edit
3. Use the format panel (right side) to adjust:
   - Colors
   - Fonts
   - Sizes
   - Positions

### Exporting

**PNG Export** (for documentation):
```
File → Export as → PNG
- Zoom: 100%
- Border: 10px
- Transparent: No
```

**PDF Export** (for presentations):
```
File → Export as → PDF
- Page View: Fit to Page
- Quality: High
```

**SVG Export** (for web):
```
File → Export as → SVG
- Embed Images: Yes
- Include Copy: Yes
```

## Best Practices

### Maintaining the Diagram

When updating:
1. Keep AWS official colors
2. Maintain consistent spacing (10px grid)
3. Align elements properly
4. Use orthogonal connectors
5. Label all arrows
6. Update deployment info
7. Keep legend current

### Adding New Services

1. Use AWS official icons from draw.io library
2. Match color scheme
3. Add to legend
4. Connect with appropriate arrows
5. Add description text

## Integration with Documentation

The diagram is referenced in:
- README.md - Main project overview
- DEPLOYMENT_SUCCESS.md - Deployment details
- CLOUDFRONT_DEPLOYMENT.md - Infrastructure guide
- FINAL_SUMMARY.md - Complete summary

## Diagram Quality

✅ **Professional Grade**
- AWS official icons
- Clean, organized layout
- Proper alignment
- Clear labels
- Comprehensive information

✅ **Production Ready**
- Includes live URLs
- Shows actual deployment
- Complete service details
- Data flow visualization

✅ **Easy to Understand**
- Logical left-to-right flow
- Color-coded services
- Numbered data flow
- Detailed legend

---

**The architecture diagram is now premium-quality and production-ready!** 🎨
