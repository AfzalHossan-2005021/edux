#!/bin/bash

# EDUX Course Content System - Deployment Checklist
# Run this to ensure all components are properly deployed

echo "======================================"
echo "EDUX Course Content System Deployment"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track status
ERRORS=0
WARNINGS=0

# 1. Check API Endpoints
echo -e "${YELLOW}[1/10]${NC} Checking API Endpoints..."
API_ENDPOINTS=(
  "pages/api/course/overview.js"
  "pages/api/course/materials.js"
  "pages/api/course/topics.js"
  "pages/api/course/structure.js"
  "pages/api/course/content.js"
)

for endpoint in "${API_ENDPOINTS[@]}"; do
  if [ -f "$endpoint" ]; then
    echo -e "${GREEN}✓${NC} $endpoint"
  else
    echo -e "${RED}✗${NC} $endpoint - NOT FOUND"
    ((ERRORS++))
  fi
done

# 2. Check React Components
echo ""
echo -e "${YELLOW}[2/10]${NC} Checking React Components..."
COMPONENTS=(
  "components/CourseContentManager.js"
  "components/CourseContentViewer.js"
)

for component in "${COMPONENTS[@]}"; do
  if [ -f "$component" ]; then
    echo -e "${GREEN}✓${NC} $component"
  else
    echo -e "${RED}✗${NC} $component - NOT FOUND"
    ((ERRORS++))
  fi
done

# 3. Check Service Layer
echo ""
echo -e "${YELLOW}[3/10]${NC} Checking Service Layer..."
if [ -f "lib/courseContentService.js" ]; then
  echo -e "${GREEN}✓${NC} lib/courseContentService.js"
else
  echo -e "${RED}✗${NC} lib/courseContentService.js - NOT FOUND"
  ((ERRORS++))
fi

# 4. Check Validation Schemas
echo ""
echo -e "${YELLOW}[4/10]${NC} Checking Validation Schemas..."
if grep -q "topicSchema" "lib/validation/schemas.js"; then
  echo -e "${GREEN}✓${NC} Course content schemas added to validation"
else
  echo -e "${RED}✗${NC} Course content schemas NOT FOUND in validation"
  ((ERRORS++))
fi

# 5. Check Database Migration
echo ""
echo -e "${YELLOW}[5/10]${NC} Checking Database Migration..."
if [ -f "docker/oracle/migrations/add_lecture_progress.sql" ]; then
  echo -e "${GREEN}✓${NC} docker/oracle/migrations/add_lecture_progress.sql"
else
  echo -e "${RED}✗${NC} add_lecture_progress.sql - NOT FOUND"
  ((WARNINGS++))
fi

# 6. Check Documentation
echo ""
echo -e "${YELLOW}[6/10]${NC} Checking Documentation..."
DOCS=(
  "COURSE_CONTENT_GUIDE.md"
  "COURSE_CONTENT_IMPLEMENTATION.md"
  "COURSE_CONTENT_INDEX.md"
  "COURSE_CONTENT_QUICK_REFERENCE.js"
)

for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo -e "${GREEN}✓${NC} $doc"
  else
    echo -e "${RED}✗${NC} $doc - NOT FOUND"
    ((ERRORS++))
  fi
done

# 7. Check package.json dependencies
echo ""
echo -e "${YELLOW}[7/10]${NC} Checking Dependencies..."
if grep -q "zod" "package.json"; then
  echo -e "${GREEN}✓${NC} Zod validation library installed"
else
  echo -e "${YELLOW}!${NC} Zod not found in package.json - may need installation"
  ((WARNINGS++))
fi

# 8. Database Connection Check (if possible)
echo ""
echo -e "${YELLOW}[8/10]${NC} Database Configuration..."
echo -e "${GREEN}ℹ${NC} Ensure Oracle database is running"
echo -e "${GREEN}ℹ${NC} Run migration: docker/oracle/migrations/add_lecture_progress.sql"

# 9. Environment Variables
echo ""
echo -e "${YELLOW}[9/10]${NC} Environment Configuration..."
if [ -f ".env.local" ] || [ -f ".env" ]; then
  echo -e "${GREEN}✓${NC} Environment file exists"
else
  echo -e "${YELLOW}!${NC} Environment file not found - create .env.local"
  ((WARNINGS++))
fi

# 10. API Testing
echo ""
echo -e "${YELLOW}[10/10]${NC} Ready for API Testing..."
echo -e "${GREEN}ℹ${NC} Test course/overview endpoint"
echo -e "${GREEN}ℹ${NC} Test course/structure endpoint"
echo -e "${GREEN}ℹ${NC} Test course/topics endpoint"
echo -e "${GREEN}ℹ${NC} Test course/materials endpoint"
echo -e "${GREEN}ℹ${NC} Test course/content endpoint"

# Summary
echo ""
echo "======================================"
echo "Deployment Summary"
echo "======================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo -e "${GREEN}✓ System is ready for deployment${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ All critical checks passed, but $WARNINGS warning(s) found${NC}"
  exit 0
else
  echo -e "${RED}✗ $ERRORS error(s) found, please fix before deployment${NC}"
  exit 1
fi
