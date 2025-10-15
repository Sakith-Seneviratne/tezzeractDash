#!/usr/bin/env node

/**
 * Security Audit Script
 * Checks for common security issues in the codebase
 */

const fs = require('fs');
const path = require('path');

const issues = [];
const warnings = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);

  // Check for hardcoded secrets
  const secretPatterns = [
    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
    /secret\s*[:=]\s*['"][^'"]+['"]/gi,
    /password\s*[:=]\s*['"][^'"]+['"]/gi,
    /token\s*[:=]\s*['"][^'"]+['"]/gi,
  ];

  secretPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'SECURITY',
        file: relativePath,
        message: `Potential hardcoded secret found: ${matches[0]}`,
        severity: 'HIGH'
      });
    }
  });

  // Check for console.log in production code
  if (content.includes('console.log') && !filePath.includes('scripts/')) {
    warnings.push({
      type: 'INFO',
      file: relativePath,
      message: 'console.log found - consider removing for production',
      severity: 'LOW'
    });
  }

  // Check for TODO/FIXME comments
  const todoPattern = /(TODO|FIXME|HACK|XXX)/gi;
  const todoMatches = content.match(todoPattern);
  if (todoMatches) {
    warnings.push({
      type: 'INFO',
      file: relativePath,
      message: `Development comment found: ${todoMatches[0]}`,
      severity: 'LOW'
    });
  }

  // Check for SQL injection patterns
  const sqlPatterns = [
    /query\s*\(\s*['"][^'"]*\$[^'"]*['"]/gi,
    /execute\s*\(\s*['"][^'"]*\+[^'"]*['"]/gi,
  ];

  sqlPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'SECURITY',
        file: relativePath,
        message: `Potential SQL injection: ${matches[0]}`,
        severity: 'HIGH'
      });
    }
  });

  // Check for XSS patterns
  const xssPatterns = [
    /innerHTML\s*=/gi,
    /outerHTML\s*=/gi,
    /document\.write/gi,
  ];

  xssPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'SECURITY',
        file: relativePath,
        message: `Potential XSS vulnerability: ${matches[0]}`,
        severity: 'MEDIUM'
      });
    }
  });
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (!['node_modules', '.next', '.git', 'dist'].includes(file)) {
        walkDirectory(filePath);
      }
    } else if (stat.isFile()) {
      // Check relevant file types
      const ext = path.extname(file);
      if (['.ts', '.tsx', '.js', '.jsx', '.json'].includes(ext)) {
        checkFile(filePath);
      }
    }
  });
}

function checkEnvironmentVariables() {
  const envExample = '.env.example';
  const envLocal = '.env.local';
  
  if (!fs.existsSync(envExample)) {
    warnings.push({
      type: 'CONFIG',
      file: 'root',
      message: '.env.example file not found - create one for documentation',
      severity: 'LOW'
    });
  }

  if (fs.existsSync(envLocal)) {
    warnings.push({
      type: 'CONFIG',
      file: '.env.local',
      message: '.env.local file exists - ensure it\'s in .gitignore',
      severity: 'MEDIUM'
    });
  }
}

function checkPackageJson() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check for known vulnerable packages
  const vulnerablePackages = [
    'lodash',
    'moment',
    'jquery',
  ];

  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  vulnerablePackages.forEach(pkg => {
    if (dependencies[pkg]) {
      warnings.push({
        type: 'DEPENDENCY',
        file: 'package.json',
        message: `Potentially vulnerable package: ${pkg}`,
        severity: 'MEDIUM'
      });
    }
  });
}

function main() {
  console.log('🔍 Running Security Audit...\n');

  // Check source code
  walkDirectory('src');
  
  // Check configuration files
  checkEnvironmentVariables();
  checkPackageJson();

  // Report results
  console.log('📊 Security Audit Results:\n');

  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ No security issues found!');
    return;
  }

  if (issues.length > 0) {
    console.log('🚨 Security Issues:');
    issues.forEach(issue => {
      console.log(`  ${issue.severity}: ${issue.file}`);
      console.log(`    ${issue.message}\n`);
    });
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(warning => {
      console.log(`  ${warning.severity}: ${warning.file}`);
      console.log(`    ${warning.message}\n`);
    });
  }

  // Summary
  console.log(`\n📈 Summary:`);
  console.log(`  Issues: ${issues.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  
  if (issues.length > 0) {
    console.log('\n❌ Security audit failed - please fix issues before deployment');
    process.exit(1);
  } else {
    console.log('\n✅ Security audit passed');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, walkDirectory };
