#!/usr/bin/env node

/**
 * Performance Check Script
 * Analyzes bundle size and performance metrics
 */

const fs = require('fs');
const path = require('path');

const issues = [];
const recommendations = [];

function checkBundleSize() {
  const nextDir = '.next';
  
  if (!fs.existsSync(nextDir)) {
    recommendations.push({
      type: 'BUILD',
      message: 'Run "npm run build" to generate bundle analysis',
      severity: 'INFO'
    });
    return;
  }

  // Check for large bundle files
  const staticDir = path.join(nextDir, 'static');
  if (fs.existsSync(staticDir)) {
    checkDirectorySize(staticDir, 'static');
  }
}

function checkDirectorySize(dir, name) {
  const files = fs.readdirSync(dir);
  let totalSize = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      const subSize = getDirectorySize(filePath);
      totalSize += subSize;
    } else {
      totalSize += stat.size;
    }
  });
  
  const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
  
  if (totalSize > 5 * 1024 * 1024) { // 5MB
    issues.push({
      type: 'PERFORMANCE',
      message: `${name} directory is ${sizeMB}MB - consider optimization`,
      severity: 'MEDIUM'
    });
  } else {
    recommendations.push({
      type: 'PERFORMANCE',
      message: `${name} directory size: ${sizeMB}MB (good)`,
      severity: 'INFO'
    });
  }
}

function getDirectorySize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stat.size;
    }
  });
  
  return size;
}

function checkImageOptimization() {
  const srcDir = 'src';
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  let imageCount = 0;
  let totalImageSize = 0;
  
  function checkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        checkDirectory(filePath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          imageCount++;
          totalImageSize += stat.size;
        }
      }
    });
  }
  
  if (fs.existsSync(srcDir)) {
    checkDirectory(srcDir);
  }
  
  if (imageCount > 0) {
    const avgSize = (totalImageSize / imageCount / 1024).toFixed(2);
    const totalSizeMB = (totalImageSize / 1024 / 1024).toFixed(2);
    
    if (avgSize > 500) { // 500KB average
      issues.push({
        type: 'PERFORMANCE',
        message: `Images average ${avgSize}KB (${imageCount} images, ${totalSizeMB}MB total)`,
        severity: 'MEDIUM'
      });
    }
    
    recommendations.push({
      type: 'PERFORMANCE',
      message: `Consider using Next.js Image component for ${imageCount} images`,
      severity: 'INFO'
    });
  }
}

function checkCodeSplitting() {
  const pagesDir = 'src/app';
  let pageCount = 0;
  let largeFiles = [];
  
  function checkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        checkDirectory(filePath);
      } else if (file === 'page.tsx' || file === 'page.ts') {
        pageCount++;
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').length;
        
        if (lines > 200) {
          largeFiles.push({
            file: path.relative(process.cwd(), filePath),
            lines: lines
          });
        }
      }
    });
  }
  
  if (fs.existsSync(pagesDir)) {
    checkDirectory(pagesDir);
  }
  
  if (largeFiles.length > 0) {
    issues.push({
      type: 'PERFORMANCE',
      message: `Large page files found (consider code splitting):`,
      severity: 'MEDIUM',
      details: largeFiles
    });
  }
  
  recommendations.push({
    type: 'PERFORMANCE',
    message: `Found ${pageCount} pages - good for code splitting`,
    severity: 'INFO'
  });
}

function checkDependencies() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const heavyDependencies = [
    'lodash',
    'moment',
    'jquery',
    'bootstrap',
    'material-ui',
  ];
  
  heavyDependencies.forEach(dep => {
    if (dependencies[dep]) {
      recommendations.push({
        type: 'PERFORMANCE',
        message: `Consider lighter alternatives to ${dep}`,
        severity: 'INFO'
      });
    }
  });
  
  const depCount = Object.keys(dependencies).length;
  if (depCount > 50) {
    issues.push({
      type: 'PERFORMANCE',
      message: `High dependency count: ${depCount} packages`,
      severity: 'LOW'
    });
  }
}

function checkTypeScript() {
  const tsConfigPath = 'tsconfig.json';
  
  if (!fs.existsSync(tsConfigPath)) {
    recommendations.push({
      type: 'PERFORMANCE',
      message: 'TypeScript configuration not found',
      severity: 'INFO'
    });
    return;
  }
  
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  
  if (!tsConfig.compilerOptions?.strict) {
    recommendations.push({
      type: 'PERFORMANCE',
      message: 'Enable strict mode in TypeScript for better performance',
      severity: 'INFO'
    });
  }
}

function main() {
  console.log('⚡ Running Performance Check...\n');

  checkBundleSize();
  checkImageOptimization();
  checkCodeSplitting();
  checkDependencies();
  checkTypeScript();

  // Report results
  console.log('📊 Performance Check Results:\n');

  if (issues.length === 0 && recommendations.length === 0) {
    console.log('✅ No performance issues found!');
    return;
  }

  if (issues.length > 0) {
    console.log('🚨 Performance Issues:');
    issues.forEach(issue => {
      console.log(`  ${issue.severity}: ${issue.message}`);
      if (issue.details) {
        issue.details.forEach(detail => {
          console.log(`    - ${detail.file}: ${detail.lines} lines`);
        });
      }
      console.log('');
    });
  }

  if (recommendations.length > 0) {
    console.log('💡 Recommendations:');
    recommendations.forEach(rec => {
      console.log(`  ${rec.severity}: ${rec.message}`);
    });
    console.log('');
  }

  // Summary
  console.log(`\n📈 Summary:`);
  console.log(`  Issues: ${issues.length}`);
  console.log(`  Recommendations: ${recommendations.length}`);
  
  if (issues.length > 0) {
    console.log('\n⚠️  Performance check completed with issues');
  } else {
    console.log('\n✅ Performance check passed');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkBundleSize, checkImageOptimization, checkCodeSplitting };
