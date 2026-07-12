#!/usr/bin/env node

/**
 * Display SQL Schema Files for Manual Execution in Supabase
 * 
 * Usage:
 *   node execute-sql.js supabase-payment-orders.sql
 *   node execute-sql.js supabase-payment-orders.sql supabase-another-file.sql
 */

import fs from "fs";

function displaySqlFile(filepath) {
  try {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`📄 File: ${filepath}`);
    console.log(`${"=".repeat(70)}\n`);
    
    const sql = fs.readFileSync(filepath, "utf-8");
    
    if (!sql.trim()) {
      console.warn(`⚠️  File is empty: ${filepath}`);
      return;
    }

    console.log(sql);
    console.log(`\n${"=".repeat(70)}\n`);
  } catch (err) {
    console.error(`❌ Error reading ${filepath}:`, err.message);
  }
}

function main() {
  const files = process.argv.slice(2);

  if (files.length === 0) {
    console.log("Usage: node execute-sql.js <file.sql> [<file2.sql> ...]");
    console.log("Example: node execute-sql.js supabase-payment-orders.sql");
    process.exit(1);
  }

  console.log("\n🚀 SQL Execution Guide for Supabase");
  console.log("─".repeat(70));
  console.log("\n📋 Instructions:");
  console.log("1. Go to https://app.supabase.com");
  console.log("2. Select your project (Sembuhin)");
  console.log("3. Click 'SQL Editor' in the left sidebar");
  console.log("4. Click 'New Query'");
  console.log("5. Copy the SQL below and paste it into the editor");
  console.log("6. Click 'Run'");
  console.log("7. Wait for the query to complete successfully");
  console.log("─".repeat(70));

  for (const file of files) {
    displaySqlFile(file);
  }

  console.log("✨ After executing the SQL above, your analytics dashboard will work!");
}

main();
