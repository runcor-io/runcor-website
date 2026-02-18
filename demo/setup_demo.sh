#!/bin/bash
# RunCor Demo Setup Script
# Usage: ./setup_demo.sh

echo "🚀 Setting up RunCor Demo Environment"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Generate sample images
echo -e "${BLUE}Step 1: Generating sample images...${NC}"
python3 generate_sample_images.py
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Sample images created${NC}"
else
    echo -e "${YELLOW}⚠ Could not generate images (PIL not installed). Using placeholders.${NC}"
    mkdir -p demo_images
    touch demo_images/placeholder.txt
fi
echo ""

# 2. Create input ZIP
echo -e "${BLUE}Step 2: Creating input package...${NC}"
cd demo_images
zip -r ../demo_input.zip *.jpg 2>/dev/null || echo "No images to zip"
cd ..
echo -e "${GREEN}✓ Created demo_input.zip${NC}"
echo ""

# 3. Show demo files
echo -e "${BLUE}Step 3: Demo assets ready${NC}"
echo "Files created:"
ls -lh demo_*.zip 2>/dev/null || echo "  - demo_input.zip (will be created on website)"
echo "  - demo/runcor-demo-job.py (job script)"
echo ""

# 4. Instructions
echo -e "${GREEN}✅ Demo Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. ${YELLOW}Contractor (Demo Viewer):${NC}"
echo "   - Go to https://www.runcor.io"
echo "   - Login as contractor"
echo "   - Post job with:"
echo "     • Script: demo/runcor-demo-job.py"
echo "     • Input: Upload demo_images/ folder as ZIP"
echo "     • Reward: \$5.00"
echo ""
echo "2. ${YELLOW}Provider (Your Laptop):${NC}"
echo "   - Start RunCor Agent v12"
echo "   - Watch it claim and execute the job"
echo "   - See real-time progress (0% → 100%)"
echo ""
echo "3. ${YELLOW}Results:${NC}"
echo "   - Download captions.json"
echo "   - See \$5.00 payment transferred"
echo ""
echo "Demo guides available:"
echo "  📊 Investor Pitch:  demo/INVESTOR_PITCH.md"
echo "  💻 Developer Guide: demo/DEVELOPER_GUIDE.md"
echo "  👤 User Demo:       demo/USER_DEMO.md"
echo ""
